export const SESSION_NAME = "gqll";

export const MONGO_CONNECTION_URL = `${process.env.MONGODB_CLIENT_URL}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;

export const PORT = process.env.BACKEND_PORT ?? "9000";

export const REDIS_URL = process.env.REDIS_URL ?? "";
