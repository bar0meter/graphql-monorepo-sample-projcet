import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { PasswordReset } from "../entities/PasswordResetEntity";
import { AuthType } from "../entities/UserEntity";
import { Context, Session } from "../types";
import Result from "../types/output/Result";

@Resolver(() => PasswordReset)
export class ResetPasswordResolver {
    @Mutation(() => Result)
    async validateResetPasswordLink(
        @Arg("email") email: string,
        @Arg("resetToken") resetToken: string,
        @Ctx() { ctx, passwordResetRepository }: Context,
    ) {
        const user = await passwordResetRepository.validateResetToken(resetToken, email);

        if (user) {
            ctx.session = {
                userID: user._id,
                authType: AuthType.RESET_PASSWORD,
                resetToken,
            } as Session;
        }

        return new Result(!!user);
    }

    @Mutation(() => Result)
    async createAndSendResetPasswordMail(
        @Arg("email") email: string,
        @Ctx() { ctx, passwordResetRepository }: Context,
    ) {
        // sign out session user
        ctx.session = null;

        const success = await passwordResetRepository.createAndSetTokenForEmail(email);
        if (success) {
            // send mail here
        }

        return new Result(); // always send success true regardless of whether the token was set or not
    }
}
