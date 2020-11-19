import { Entity, EntityRepositoryType, Property, Unique } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { UserRepository } from "../repositories/UserRepository";
import { AbstractEntity } from "./AbstractEntity";

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
    email: string;

    @Property({ type: "bytea", nullable: true })
    password: Buffer;

    // @OneToOne(() => PasswordReset)
    // passwordReset: PasswordReset;

    [EntityRepositoryType]?: UserRepository;
}

export enum AuthType {
    SESSION = "session",
    RESET_PASSWORD = "reset_password",
}
