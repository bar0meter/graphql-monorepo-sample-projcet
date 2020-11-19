import { FindOptions, FilterQuery, QueryOrder, EntityRepository } from "@mikro-orm/core";
import Relay from "graphql-relay";
import { AbstractEntity } from "../entities/AbstractEntity";
import { ConnectionArgs, Cursor, LimitOffsetArgs, MAX_TAKE } from "../types/Pagination";

export const DEFAULT_FIND_OPTIONS = {
    limit: MAX_TAKE,
    offset: 0,
};

type AbstractEntityQueryType = {
    _id?: any;
    createdAt?: any;
    updatedAt?: any;
};

type WHERE<T extends AbstractEntity<T>> = FilterQuery<T> & AbstractEntityQueryType;

export abstract class BaseRepository<T extends AbstractEntity<T>> extends EntityRepository<T> {
    public async findAndPaginate(
        where: WHERE<T>,
        args: LimitOffsetArgs,
        partialOptions?: FindOptions<T>,
    ) {
        const findOptions = partialOptions ?? DEFAULT_FIND_OPTIONS;

        const records = await this.find(
            { ...(where as {}) },
            {
                ...findOptions,
                limit: args.limit + 1,
                offset: args.offset,
                orderBy: {
                    ...partialOptions?.orderBy,
                    createdAt: QueryOrder.DESC,
                    _id: QueryOrder.DESC,
                },
            },
        );

        const hasNextPage = records.length > args.limit;

        return {
            pageInfo: {
                hasNextPage,
                hasPreviousPage: !!args.offset,
                startCursor: null,
                endCursor: null,
            },
            edges: records.slice(0, args.limit).map((node) => ({
                node,
                cursor: Cursor.serialize(node.createdAt),
            })),
        } as Relay.Connection<T>;
    }

    public async findAndPaginateConnection(
        where: WHERE<T>,
        args: ConnectionArgs,
        findOptions?: FindOptions<T>,
    ) {
        if (typeof args.first !== "number" && typeof args.last !== "number") {
            throw new Error(
                "Must specify the number of records to fetch via the `first` or `last` argument.",
            );
        }

        const numberOfRecords = args.first ?? args.last ?? 0;

        const newWhere: WHERE<T> = {
            ...(where as {}),
        };

        if (args.after) {
            const after = Cursor.parse(args.after);
            newWhere.createdAt = { $gt: after };
        } else if (args.before) {
            const before = Cursor.parse(args.before);
            newWhere.createdAt = { $lt: before };
        }

        const records = await this.find(newWhere, {
            ...findOptions,
            limit: numberOfRecords + 1,
            orderBy: {
                ...findOptions?.orderBy,
                createdAt: args.first ? "DESC" : "ASC",
            },
        });

        const hasNextPage = records.length > numberOfRecords;

        return {
            pageInfo: {
                hasNextPage,
                hasPreviousPage: !!args.after,
                startCursor: records.length ? Cursor.serialize(records[0].createdAt) : null,
                endCursor: records.length
                    ? Cursor.serialize(
                          records[Math.max(records.length - (hasNextPage ? 2 : 1), 0)].createdAt,
                      )
                    : null,
            },
            edges: records.slice(0, numberOfRecords).map((node) => ({
                node,
                cursor: Cursor.serialize(node.createdAt),
            })),
        } as Relay.Connection<T>;
    }
}
