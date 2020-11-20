import { Entity, EntityRepositoryType, Enum, Index, Property, Unique } from "@mikro-orm/core";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { UserRepository } from "../repositories/UserRepository";
import { AbstractEntity } from "./AbstractEntity";

export enum AuthType {
    SESSION = "session",
    RESET_PASSWORD = "reset_password",
}

export enum UserRole {
    OWNER = 0,
    ADMIN = 10,
    BASIC = 50,
}

registerEnumType(UserRole, {
    name: "Access",
    description: "User Access",
});

@Entity({ customRepository: () => UserRepository })
@ObjectType()
export class User extends AbstractEntity<User> {
    @Property()
    @Field()
    firstName: string;

    @Property({ nullable: true })
    @Field({ nullable: true })
    lastName?: string;

    @Property()
    @Field()
    @Unique()
    email!: string;

    @Property({ nullable: true })
    password: Buffer;

    @Enum({ default: UserRole.BASIC })
    role: UserRole;

    [EntityRepositoryType]?: UserRepository;
}
