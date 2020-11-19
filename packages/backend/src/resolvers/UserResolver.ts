import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { AuthType, User } from "../entities/UserEntity";
import { Context, Session } from "../types";
import { SignUpUserInput } from "../types/inputs/UserInput";
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
    async signIn(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { ctx, userRepository }: Context,
    ) {
        const user = await userRepository.signIn(email, password);
        if (user) {
            ctx.session = {
                userID: user._id,
                authType: AuthType.SESSION,
            } as Session;
        }

        return new Result(!!user);
    }

    @Mutation(() => Result)
    async changePassword(
        @Arg("password") password: string,
        @Ctx() { ctx, userRepository }: Context,
    ) {
        const session: Session = ctx.session;
        if (
            !session ||
            !session.userID ||
            session.authType !== AuthType.RESET_PASSWORD ||
            !session.resetToken
        ) {
            return new Result(false);
        }

        const success = await userRepository.changePassword(password, session.resetToken);
        if (success) {
            // sign in reset password user
            ctx.session.authType = AuthType.SESSION;
        }

        return new Result(success);
    }
}
