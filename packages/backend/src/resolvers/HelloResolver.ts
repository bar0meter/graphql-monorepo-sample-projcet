import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  async greeting(): Promise<String> {
    return "Hello World";
  }
}
