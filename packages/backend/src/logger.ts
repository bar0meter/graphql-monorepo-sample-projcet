import pino from "pino";

const LOGGER_CONFIG = {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  formatters: {
    level: (level: string, number: number) => {
      return { level, number };
    },
  },
};

export const logger = pino(LOGGER_CONFIG);
