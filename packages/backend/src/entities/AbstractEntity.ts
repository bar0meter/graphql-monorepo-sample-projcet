import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { v4 } from "uuid";

@Entity()
@ObjectType({ isAbstract: true })
export abstract class AbstractEntity<
  T extends { id: string }
> extends BaseEntity<T, "id"> {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  public id: string = v4();

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
