import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "";
export default new Redis(REDIS_URL);
