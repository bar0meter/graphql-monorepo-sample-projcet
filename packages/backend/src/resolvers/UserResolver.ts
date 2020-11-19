import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { AuthType, User } from "../entities/UserEntity";
import { Context, Session } from "../types";
import { SignInInput, SignUpUserInput } from "../types/inputs/UserInput";
import Result from "../types/output/Result";
import { createConnection, LimitOffsetArgs } from "../types/Pagination";

const [UserConnection] = createConnection(User);

@Resolver(() => User)
export class UserResolver {
    @Query(() => UserConnection)
    async users(@Args() args: LimitOffsetArgs, @Ctx() { userRepository }: Context) {
        return await userRepository.findAndPaginate({}, args);
    }

    @Mutation(() => Result)
    async signUp(@Arg("input") input: SignUpUserInput, @Ctx() { ctx, userRepository }: Context) {
        const user = await userRepository.signUp(input);

        ctx.session = {
            userID: user._id,
            authType: AuthType.SESSION,
        } as Session;

        return new Result();
    }

    @Mutation(() => Result)
    async changePassword(
        @Arg("password") password: string,
        @Arg("resetToken") resetToken: string,
        @Ctx() { ctx, userRepository, passwordResetRepository }: Context,
    ) {
        const session: Session = ctx.session;
        if (!session || !session.userID || session.authType !== AuthType.RESET_PASSWORD) {
            return new Result(false);
        }

        const sessionUser = await userRepository.findOne({ _id: session.userID });
        // there wont be any such case
        if (!sessionUser) {
            return new Result(false);
        }

        const success = await passwordResetRepository.resetPassword(password, resetToken);
        if (success) {
            // sign in user
            ctx.session = {
                userID: sessionUser._id,
                authType: AuthType.SESSION,
            };
        }

        return new Result(success);
    }
}
