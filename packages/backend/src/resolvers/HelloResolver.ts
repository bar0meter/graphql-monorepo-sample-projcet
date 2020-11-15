import { Query, Resolver } from "type-graphql";
import { helloWorld } from "@gql-learning/utils";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  async greeting(): Promise<String> {
    helloWorld();
    return "Hello World";
  }
}
