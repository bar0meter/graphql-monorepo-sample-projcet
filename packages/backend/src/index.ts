import "reflect-metadata";
import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import session from "koa-session";
import redisStore from "koa-redis";
import { SESSION_NAME } from "./constants";
import redis from "./redis";
import { AuthChecker, buildSchema } from "type-graphql";
import path from "path";
import { Context } from "./types";
import { ApolloServer } from "apollo-server-koa";

const app = new Koa();
const router = new Router();

app.use(
  cors({
    credentials: true,
  })
);

const SESSION_CONFIG = {
  key: SESSION_NAME,
  maxAge: 86400000 * 14,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true,
  renew: false,
  store: redisStore({
    client: redis,
  }),
};

app.use(session(SESSION_CONFIG, app));
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

async function main() {
  const customAuthChecker: AuthChecker<Context> = ({ context }, roles) => {
    return true;
  };

  const schema = await buildSchema({
    resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    authChecker: customAuthChecker,
  });

  const server = new ApolloServer({
    debug: true,
    schema,
    context: ({ ctx, connection }) => {
      if (connection?.context) {
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

  const PORT = process.env.BACKEND_PORT ?? "9000";

  app.listen(PORT, () => {
    console.log(`Koa server listening on port ${PORT}`);
  });
}

main().catch((err) => console.error(err));
