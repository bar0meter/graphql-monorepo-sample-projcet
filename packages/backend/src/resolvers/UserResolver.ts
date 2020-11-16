import { logger } from "@gql-learning/utils";
import { Args, Ctx, Query, Resolver } from "type-graphql";
import { User } from "../entities/UserEntity";
import { Context } from "../types";
import { createConnection, LimitOffsetArgs } from "../types/Pagination";

const UserConnection = createConnection(User);

@Resolver(() => User)
export class UserResolver {
    @Query(() => UserConnection)
    async users(@Args() args: LimitOffsetArgs, @Ctx() { orm }: Context) {
        const result = await orm.em.getRepository(User).findAndPaginate({}, args);
        logger.info(result);

        return result;
    }
}
