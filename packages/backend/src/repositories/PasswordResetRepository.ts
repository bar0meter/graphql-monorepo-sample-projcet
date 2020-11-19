import { wrap } from "@mikro-orm/core";
import { v4 } from "uuid";
import { PasswordReset } from "../entities/PasswordResetEntity";
import { User } from "../entities/UserEntity";
import { BaseRepository } from "./BaseRepository";

// TODO: Implement using transactions if implicit transactions are off
export class PasswordResetRepository extends BaseRepository<PasswordReset> {
    async createAndSetTokenForEmail(email: string) {
        const userRepo = this.em.getRepository(User);

        const user = await userRepo.findOne({ email });
        if (!user) {
            return false; // no user found, dont throw any error, just don't send any email
        }

        const previousRecord = await this.findOne({ user });
        // Here can add check for number of reset password email requested in last 5-10 mins or 1 hr, etc
        // Dont want someone to spam the emails
        if (previousRecord) {
            this.remove(previousRecord);
        }

        const resetToken = v4();

        const passwordReset = new PasswordReset(user);
        wrap(passwordReset).assign({ resetToken }, { em: this.em });

        await this.em.persistAndFlush(passwordReset);

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
}
