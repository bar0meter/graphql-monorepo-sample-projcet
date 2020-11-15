FROM node:14-buster-slim AS base

WORKDIR /app

FROM base as builder

COPY *.json yarn.lock ./
COPY packages/utils/ ./packages/utils
COPY packages/backend/ ./packages/backend

RUN yarn install --production --pure-lockfile

RUN yarn workspace @gql-learning/utils build
RUN yarn workspace @gql-learning/utils build

FROM base

COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/utils/dist/ ./node_modules/@gql-learning/utils/

# Copy runtime project
COPY --from=builder /app/packages/backend/dist/ ./src/
COPY packages/backend/package.json ./

CMD ["node", "src/index.js"]