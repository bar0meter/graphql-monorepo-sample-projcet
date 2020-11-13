import { Context as KoaContext } from "koa";

export type Session = {
  userID: string;
};
export type Cookies = KoaContext["cookies"];

export type Context = {
  destroySession(): void;
};

export type Lazy<T> = T | Promise<T>;
