import { User } from "../entities/UserEntity";
import { SignUpUserInput, SignInInput } from "../types/inputs/UserInput";
import { BaseRepository } from "./BaseRepository";
import SecurePassword from "secure-password";
import { wrap } from "@mikro-orm/core";

const securePassword = new SecurePassword({
    memlimit: SecurePassword.MEMLIMIT_DEFAULT,
    opslimit: SecurePassword.OPSLIMIT_DEFAULT,
});

export class UserRepository extends BaseRepository<User> {
    async signUp(input: SignUpUserInput) {
        const hashedPassword = await this.hashPassword(input.password);

        // save user
        const user = this.create({ ...input, password: hashedPassword });

        await this.em.persist(user).flush();

        // sign in
        return await this.signIn(new SignInInput(input.email, input.password));
    }

    async hashPassword(password: string) {
        return await securePassword.hash(Buffer.from(password));
    }

    async verifyHashedPassword(password: string, hashedPassword: Buffer) {
        return await securePassword.verify(Buffer.from(password), hashedPassword);
    }

    async signIn({ email, password }: SignInInput) {
        const user = await this.findOneOrFail({ email }, { fields: ["_id", "password", "email"] });

        const verifyPassowrdResult = await this.verifyHashedPassword(password, user.password);

        if (![SecurePassword.VALID_NEEDS_REHASH, SecurePassword.VALID].includes(verifyPassowrdResult)) {

        }

        if (verifyPassowrdResult === SecurePassword.VALID_NEEDS_REHASH) {
            const hashedPassword = await this.hashPassword(password)
            wrap(user).assign({
                password: hashedPassword
            })
            this.persistAndFlush(user);
        }

        return user;
    }
}
