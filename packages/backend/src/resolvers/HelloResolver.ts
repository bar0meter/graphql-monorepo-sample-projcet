import { Query, Resolver } from "type-graphql";
import { logger } from "../logger";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  async greeting(): Promise<String> {
    logger.info("Hello World");
    return "Hello World";
  }
}
