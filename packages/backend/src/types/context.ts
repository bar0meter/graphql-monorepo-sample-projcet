import { ObjectId } from "@mikro-orm/mongodb";
import { Redis } from "ioredis";
import { ParameterizedContext } from "koa";
import { AuthType, UserRole } from "../entities/UserEntity";
import { PasswordResetRepository } from "../repositories/PasswordResetRepository";
import { UserRepository } from "../repositories/UserRepository";

// Depending on the AuthType we can give him access to certain API
export type Session = {
    userID: ObjectId;
    authType: AuthType;
    role: UserRole;
    resetToken?: string;
};

export type Context = ParameterizedContext & {
    session: Session;
    redis: Redis;
    userRepository: UserRepository;
    passwordResetRepository: PasswordResetRepository;
};

export type Lazy<T> = T | Promise<T>;
