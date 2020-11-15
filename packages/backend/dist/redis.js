"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = (_a = process.env.REDIS_URL) !== null && _a !== void 0 ? _a : "";
exports.default = new ioredis_1.default(REDIS_URL);
