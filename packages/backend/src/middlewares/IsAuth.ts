import { MiddlewareFn } from "type-graphql";
import { AuthType } from "../entities/UserEntity";
import { Context } from "../types";

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
    const { ctx } = context;
    if (!ctx.session || !ctx.session.userID || ctx.session.authType !== AuthType.SESSION) {
        throw new Error("not authenticated");
    }

    return next();
};
