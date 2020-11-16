import { logger } from "@gql-learning/utils";
import { MikroORM } from "@mikro-orm/core";
import { Args, Ctx, Query, Resolver } from "type-graphql";
import { User } from "../entities/UserEntity";
import { createConnection, LimitOffsetArgs } from "../repositories/BaseRepository";
import { Context } from "../types";

const UserConnection = createConnection(User);

@Resolver(() => User)
export class UserResolver {
    @Query(() => UserConnection)
    async users(@Args() args: LimitOffsetArgs, @Ctx() ctx: Context) {
        const result = await ctx.orm.em.getRepository(User).findAndPaginate({}, args);
        logger.info(result);

        return result;
    }
}
