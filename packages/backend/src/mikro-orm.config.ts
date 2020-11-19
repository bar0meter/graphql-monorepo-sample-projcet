import { Options } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { MONGO_CONNECTION_URL } from "./constants";

const options: Options<MongoDriver> = {
    type: "mongo",
    debug: process.env.NODE_ENV !== "production",
    entities: [__dirname + "/entities/**/*.{ts,js}"],
    clientUrl: MONGO_CONNECTION_URL,
};

export default options;
