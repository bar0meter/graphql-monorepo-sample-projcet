"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const router_1 = __importDefault(require("@koa/router"));
const koa_session_1 = __importDefault(require("koa-session"));
const koa_redis_1 = __importDefault(require("koa-redis"));
const constants_1 = require("./constants");
const redis_1 = __importDefault(require("./redis"));
const type_graphql_1 = require("type-graphql");
const path_1 = __importDefault(require("path"));
const apollo_server_koa_1 = require("apollo-server-koa");
const utils_1 = require("@gql-learning/utils");
const app = new koa_1.default();
const router = new router_1.default();
app.use(cors_1.default({
    credentials: true,
}));
const SESSION_CONFIG = {
    key: constants_1.SESSION_NAME,
    maxAge: 86400000 * 14,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true,
    renew: false,
    store: koa_redis_1.default({
        client: redis_1.default,
    }),
};
app.use(koa_session_1.default(SESSION_CONFIG, app));
app.use(koa_bodyparser_1.default());
app.use(router.routes());
app.use(router.allowedMethods());
async function main() {
    var _a;
    const customAuthChecker = () => {
        return true;
    };
    const schema = await type_graphql_1.buildSchema({
        resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
        emitSchemaFile: path_1.default.resolve(__dirname, "schema.gql"),
        authChecker: customAuthChecker,
    });
    const server = new apollo_server_koa_1.ApolloServer({
        debug: true,
        schema,
        context: ({ ctx, connection }) => {
            if (connection === null || connection === void 0 ? void 0 : connection.context) {
                return connection.context;
            }
            return {
                destroySession() {
                    ctx.session = null;
                },
            };
        },
    });
    server.applyMiddleware({ app, path: "/api/graphql" });
    const PORT = (_a = process.env.BACKEND_PORT) !== null && _a !== void 0 ? _a : "9000";
    app.listen(PORT, () => {
        utils_1.logger.info(`Koa server listening on port ${PORT}`);
    });
}
main().catch((err) => console.error(err));
