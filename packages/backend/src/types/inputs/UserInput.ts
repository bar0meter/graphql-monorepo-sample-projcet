import { ObjectId } from "@mikro-orm/mongodb";
import { IsEmail, MinLength } from "class-validator";
import { Field, ID, InputType } from "type-graphql";

@InputType({ description: "Normal SignUp input payload" })
export class SignUpUserInput {
    @Field()
    public firstName: string;

    @Field()
    public lastName: string;

    @Field()
    @IsEmail()
    public email: string;

    @Field()
    @MinLength(8)
    public password: string;
}

@InputType()
export class UpdateUserInput {
    @Field(() => ID)
    public _id: ObjectId;

    @Field({ nullable: true })
    public firstName: string;

    @Field({ nullable: true })
    public lastName: string;

    @Field({ nullable: true })
    @IsEmail()
    public email: string;

    @Field({ nullable: true })
    @MinLength(8)
    public password: string;
}

@InputType({ description: "Normal SignIn User Input" })
export class SignInInput {
    @Field()
    @IsEmail()
    public email: string;

    @Field()
    @MinLength(8)
    public password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}
