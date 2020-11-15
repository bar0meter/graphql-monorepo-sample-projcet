import { Entity, Property, Unique } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { UserRepository } from "../repositories/UserRepository";
import { AbstractEntity } from "./AbstractEntity";

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

  @Property()
  public password: string;
}
