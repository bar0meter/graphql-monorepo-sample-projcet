import { Options } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";

const options: Options<MongoDriver> = {
    type: "mongo",
    debug: process.env.NODE_ENV !== "production",
    entities: [__dirname + "/entities/**/*.{ts,js}"],
    clientUrl: `${process.env.MONGODB_CLIENT_URL}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`,
};

export default options;
