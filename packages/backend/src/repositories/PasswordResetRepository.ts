import { wrap } from "@mikro-orm/core";
import { v4 } from "uuid";
import { PasswordReset } from "../entities/PasswordResetEntity";
import { User } from "../entities/UserEntity";
import { BaseRepository } from "./BaseRepository";

// TODO: Implement using transactions if implicit transactions are off
export class PasswordResetRepository extends BaseRepository<PasswordReset> {
    async createForEmail(email: string) {
        const userRepo = this.em.getRepository(User);

        const user = await userRepo.findOne({ email });
        if (!user) {
            return false; // no user found, dont throw any error, just don't send any email
        }

        const previousRecord = this.findOne({ user });
        // Here can add check for number of reset password email requested in last 5-10 mins or 1 hr, etc
        // Dont want someone to spam the emails
        this.remove(previousRecord);

        const resetToken = v4();

        const passwordReset = this.create({ user, resetToken });
        await this.persistAndFlush(passwordReset);

        // Send email here

        return true;
    }

    async validateResetToken(resetToken: string, email: string) {
        const userRepo = this.em.getRepository(User);

        const user = await userRepo.findOne({ email });
        const reset = await this.findOne({ resetToken, user });

        if (!reset) {
            return null;
        }

        // Here validate expiry time here

        return user;
    }

    async resetPassword(password: string, resetToken: string) {
        const reset = await this.findOne({ resetToken });
        if (!reset) {
            throw new Error("Invalid Token");
        }

        const user = reset.user;
        const userRepo = this.em.getRepository(User);
        const hashedPassword = await userRepo.hashPassword(password);

        wrap(user).assign({ password: hashedPassword });
        userRepo.persist(user);
        await this.removeAndFlush(reset);

        return true;
    }
}
