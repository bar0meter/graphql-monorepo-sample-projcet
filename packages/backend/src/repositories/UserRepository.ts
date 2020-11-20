import { User, UserRole } from "../entities/UserEntity";
import { SignUpUserInput } from "../types";
import { BaseRepository } from "./BaseRepository";
import SecurePassword from "secure-password";
import { wrap } from "@mikro-orm/core";
import { PasswordReset } from "../entities/PasswordResetEntity";

const ADMIN_USERS = ["frost@gmail.com"];

const securePassword = new SecurePassword({
    memlimit: SecurePassword.MEMLIMIT_DEFAULT,
    opslimit: SecurePassword.OPSLIMIT_DEFAULT,
});

// Should we use cached User object for validating user ? (hmmmm !!!)
export class UserRepository extends BaseRepository<User> {
    async signUp(input: SignUpUserInput) {
        const hashedPassword = await this.hashPassword(input.password);

        // save user
        const role: UserRole = ADMIN_USERS.includes(input.email ?? "")
            ? UserRole.ADMIN
            : UserRole.BASIC;
        const user = this.create({ ...input, password: hashedPassword, role });

        await this.em.persist(user).flush();

        // sign in
        return await this.signIn(input.email, input.password);
    }

    async hashPassword(password: string) {
        return await securePassword.hash(Buffer.from(password));
    }

    async verifyHashedPassword(password: string, hashedPassword: Buffer) {
        return await securePassword.verify(Buffer.from(password), hashedPassword);
    }

    async signIn(email: string, password: string) {
        const user = await this.findOneOrFail({ email }, { fields: ["_id", "password", "email"] });

        const verifyPassowrdResult = await this.verifyHashedPassword(password, user.password);

        if (
            ![SecurePassword.VALID_NEEDS_REHASH, SecurePassword.VALID].includes(
                verifyPassowrdResult,
            )
        ) {
            // Invalid credentials
            throw new Error("Invalid Credentials");
        }

        if (verifyPassowrdResult === SecurePassword.VALID_NEEDS_REHASH) {
            const hashedPassword = await this.hashPassword(password);
            wrap(user).assign({
                password: hashedPassword,
            });
            this.persistAndFlush(user);
        }

        // Remove password reset entry if any
        await this.em.getRepository(PasswordReset).nativeDelete({ user });

        return user;
    }

    async changePassword(password: string, resetToken: string) {
        const passwordResetRepo = this.em.getRepository(PasswordReset);
        const reset = await passwordResetRepo.findOne({ resetToken });
        if (!reset) {
            throw new Error("Invalid Token");
        }

        const user = reset.user;
        const hashedPassword = await this.hashPassword(password);

        wrap(user).assign({ password: hashedPassword });
        this.persist(user);
        passwordResetRepo.remove(reset);

        // flush all the changes
        await this.em.flush();

        return true;
    }
}
