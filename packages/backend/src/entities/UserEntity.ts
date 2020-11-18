import { Entity, EntityRepositoryType, OneToOne, Property, Unique } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { UserRepository } from "../repositories/UserRepository";
import { AbstractEntity } from "./AbstractEntity";
import { PasswordReset } from "./PasswordResetEntity";

@Entity({ customRepository: () => UserRepository })
@ObjectType()
export class User extends AbstractEntity<User> {
    @Property()
    @Field()
    public firstName: string;

    @Property({ nullable: true })
    @Field({ nullable: true })
    public lastName?: string;

    @Property()
    @Field()
    @Unique()
    public email: string;

    @Property({ type: "bytea", nullable: true })
    public password: Buffer;

    @OneToOne(() => PasswordReset)
    passwordReset: PasswordReset;

    [EntityRepositoryType]?: UserRepository;
}
