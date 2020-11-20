import { Context } from "koa";
import { AuthChecker } from "type-graphql";
import { UserRole } from "../entities/UserEntity";

export const CustomAuthChecker: AuthChecker<Context> = ({ context }, roles) => {
    const { ctx } = context;

    if (!ctx?.session?.userID) {
        return false;
    }

    if (!roles || roles.length === 0) {
        return true;
    }

    const userRole: UserRole = ctx?.session?.role;
    if (!userRole) {
        return false;
    }

    const access = roles.find(role => +role === +userRole.toString());

    return !!access;
};
