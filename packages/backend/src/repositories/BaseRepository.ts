import {
  EntityRepository,
  FindOptions,
  FilterQuery,
  QueryOrder,
} from "@mikro-orm/core";
import Relay from "graphql-relay";
import { AbstractEntity } from "../entities/AbstractEntity";

export const MAX_TAKE = 50;
export const DEFAULT_FIND_OPTIONS = {
  limit: MAX_TAKE,
  offset: 0,
};

export class Cursor {
  static serialize(id: Date) {
    return Buffer.from(String(id.getTime())).toString("base64");
  }

  static parse(cursor: string) {
    return new Date(+Buffer.from(cursor, "base64"));
  }
}

export abstract class BaseRepository<
  T extends AbstractEntity<T>
> extends EntityRepository<T> {
  public async findAndPagniate(
    where: FilterQuery<T>,
    partialOptions?: FindOptions<T>
  ) {
    const findOptions = partialOptions ?? DEFAULT_FIND_OPTIONS;
    const limit = findOptions?.limit ? findOptions.limit : MAX_TAKE;

    const records = await this.find(where, {
      ...findOptions,
      limit: limit + 1,
      orderBy: {
        ...partialOptions?.orderBy,
        createdAt: QueryOrder.DESC,
        id: QueryOrder.DESC,
      },
    });

    const hasNextPage = records.length > limit;

    return {
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!findOptions.offset,
        startCursor: null,
        endCursor: null,
      },
      edges: records.slice(0, limit).map((node) => ({
        node,
        cursor: Cursor.serialize(node.createdAt),
      })),
    } as Relay.Connection<T>;
  }

  //TODO: Implement this
  // https://github.com/kesne/HostyHosting/blob/master/packages/backend/src/entity/BaseEntity.ts
  public async findAndPagniateConnection(
    where: FilterQuery<T>,
    partialOptions?: FindOptions<T>
  ) {}
}
