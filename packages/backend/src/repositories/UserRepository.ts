import { User } from "../entities/UserEntity";
import { SignUpUserInput, SignInInput } from "../types/inputs/UserInput";
import { BaseRepository } from "./BaseRepository";

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
        return await password;
    }

    async verifyHashedPassword(password: string, hashedPassword: string): Promise<Boolean> {
        return false;
    }

    async signIn({ email, password }: SignInInput) {
        const user = await this.findOneOrFail({ email }, { fields: ["_id", "password", "email"] });

        if (!this.verifyHashedPassword(password, user.password)) {
            // throw invalid credentials error here
        }

        return user;
    }
}
