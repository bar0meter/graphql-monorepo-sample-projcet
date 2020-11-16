import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entities/UserEntity";
import { Context } from "../types";
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

        ctx.session.userID = user._id;

        return new Result();
    }
}
