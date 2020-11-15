import { Options } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { AbstractEntity } from "./entities/AbstractEntity";
import { User } from "./entities/User";

const options: Options<MongoDriver> = {
  type: "mongo",
  dbName: process.env.MONGO_INITDB_DATABASE,
  debug: process.env.NODE_ENV !== "production",
  entities: [AbstractEntity, User],
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  password: process.env.MONGO_INITDB_ROOT_PASSWORD,
};

export default options;
