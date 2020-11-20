import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { AuthType, User, UserRole } from "../entities/UserEntity";
import {
    Context,
    Session,
    SignUpUserInput,
    createConnection,
    LimitOffsetArgs,
    Result,
} from "../types";

const [UserConnection] = createConnection(User);

@Resolver(() => User)
export class UserResolver {
    @Authorized(UserRole.ADMIN)
    @Query(() => UserConnection)
    async users(@Args() args: LimitOffsetArgs, @Ctx() { userRepository }: Context) {
        return await userRepository.findAndPaginate({}, args);
    }

    @Mutation(() => Result)
    async signUp(@Arg("input") input: SignUpUserInput, @Ctx() context: Context) {
        const { ctx, userRepository } = context;
        const user = await userRepository.signUp(input);

        ctx.session = {
            userID: user._id,
            authType: AuthType.SESSION,
            role: user.role,
        } as Session;

        return new Result();
    }

    @Mutation(() => Result)
    async signIn(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() context: Context,
    ) {
        const { ctx, userRepository } = context;
        const user = await userRepository.signIn(email, password);
        if (user) {
            ctx.session = {
                userID: user._id,
                authType: AuthType.SESSION,
                role: user.role,
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

    @Mutation(() => Result)
    logout(@Ctx() { ctx }: Context) {
        ctx.session = null;
        return new Result();
    }
}
