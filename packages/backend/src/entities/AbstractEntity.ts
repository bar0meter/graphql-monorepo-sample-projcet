import { BaseEntity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType({ isAbstract: true })
export abstract class AbstractEntity<T extends { _id: ObjectId }> extends BaseEntity<T, "_id"> {
    @Field(() => ID)
    @PrimaryKey()
    _id: ObjectId;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    constructor(body = {}) {
        super();
        this.assign(body);
    }
}
