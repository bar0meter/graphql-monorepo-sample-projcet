import { FindOptions, FilterQuery, QueryOrder, EntityRepository } from "@mikro-orm/core";
import { Min, Max } from "class-validator";
import Relay, { ConnectionCursor } from "graphql-relay";
import { ArgsType, Field, Int, ID, ClassType, ObjectType } from "type-graphql";
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

@ArgsType()
export class LimitOffsetArgs {
    @Min(1)
    @Max(MAX_TAKE)
    @Field(() => Int)
    limit!: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    offset?: number;
}

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
    @Field(() => ID, {
        nullable: true,
        description: "Paginate before opaque cursor",
    })
    before?: ConnectionCursor;
    @Field(() => ID, {
        nullable: true,
        description: "Paginate after opaque cursor",
    })
    after?: ConnectionCursor;

    @Min(1)
    @Max(MAX_TAKE)
    @Field(() => Int, { nullable: true, description: "Paginate first" })
    first?: number;

    @Min(1)
    @Max(MAX_TAKE)
    @Field(() => Int, { nullable: true, description: "Paginate last" })
    last?: number;
}

@ObjectType()
export class PageInfo implements Relay.PageInfo {
    @Field()
    hasNextPage!: boolean;

    @Field()
    hasPreviousPage!: boolean;

    @Field(() => ID, { nullable: true })
    startCursor?: ConnectionCursor;

    @Field(() => ID, { nullable: true })
    endCursor?: ConnectionCursor;
}

const CONNECTIONS_CACHE = new Map();

export function createConnection<T extends ClassType>(nodeType: T) {
    if (CONNECTIONS_CACHE.has(nodeType)) {
        return CONNECTIONS_CACHE.get(nodeType);
    }

    @ObjectType(`${nodeType.name}Edge`)
    class Edge implements Relay.Edge<T> {
        @Field(() => nodeType)
        node!: T;

        @Field(() => ID, { description: "Used in `before` and `after` args" })
        cursor!: ConnectionCursor;
    }

    @ObjectType(`${nodeType.name}Connection`)
    class Connection implements Relay.Connection<T> {
        @Field()
        pageInfo!: PageInfo;

        @Field(() => [Edge])
        edges!: Edge[];
    }

    const returnValue = [Connection, Edge] as const;

    CONNECTIONS_CACHE.set(nodeType, returnValue);

    return returnValue;
}

type AbstractEntityQueryType = {
    id?: any;
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
                    id: QueryOrder.DESC,
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
            newWhere.createdAt = { $gte: after };
        } else if (args.before) {
            const before = Cursor.parse(args.before);
            newWhere.createdAt = { $lte: before };
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
