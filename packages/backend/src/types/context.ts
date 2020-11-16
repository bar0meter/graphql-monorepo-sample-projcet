import { ObjectId } from "@mikro-orm/mongodb";
import { Redis } from "ioredis";
import { ParameterizedContext } from "koa";
import { UserRepository } from "../repositories/UserRepository";

export type Session = {
    userID: ObjectId;
};

export type Context = ParameterizedContext & {
    session: Session;
    redis: Redis;
    userRepository: UserRepository;
};

export type Lazy<T> = T | Promise<T>;
