/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated server utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import type { GenericId, Id } from "./dataModel";
import type { DataModel } from "./dataModel";

/**
 * A type for your Convex data model.
 *
 * This type enables you to type your query and mutation arguments.
 */
export type DataModel = DataModel;

/**
 * A type for your Convex data model.
 *
 * This type enables you to type your query and mutation arguments.
 */
export type GenericId<TableName extends keyof DataModel> = GenericId<TableName>;

/**
 * A type for your Convex data model.
 *
 * This type enables you to type your query and mutation arguments.
 */
export type Id<TableName extends keyof DataModel> = Id<TableName>;

/**
 * A reference to a query function.
 *
 * @public
 */
export type Query<Name extends string, Args extends any[], Return> = (
  ...args: Args
) => Promise<Return>;

/**
 * A reference to a mutation function.
 *
 * @public
 */
export type Mutation<Name extends string, Args extends any[], Return> = (
  ...args: Args
) => Promise<Return>;

/**
 * A reference to an action function.
 *
 * @public
 */
export type Action<Name extends string, Args extends any[], Return> = (
  ...args: Args
) => Promise<Return>;

/**
 * A reference to an HTTP action.
 *
 * @public
 */
export type HttpAction<Return> = (
  request: Request
) => Promise<Response | Return>;

/**
 * Helper to get a query builder for a given function.
 *
 * @public
 */
export declare const query: QueryBuilder<DataModel, "public">;

/**
 * Helper to get a mutation builder for a given function.
 *
 * @public
 */
export declare const mutation: MutationBuilder<DataModel, "public">;

/**
 * Helper to get an action builder for a given function.
 *
 * @public
 */
export declare const action: ActionBuilder<DataModel, "public">;

/**
 * Helper to get an HTTP action builder.
 *
 * @public
 */
export declare const httpAction: HttpActionBuilder;

/**
 * Helper to get an internal action builder.
 *
 * @public
 */
export declare const internalAction: ActionBuilder<DataModel, "internal">;

/**
 * Helper to get an internal mutation builder.
 *
 * @public
 */
export declare const internalMutation: MutationBuilder<DataModel, "internal">;

/**
 * Helper to get an internal query builder.
 *
 * @public
 */
export declare const internalQuery: QueryBuilder<DataModel, "internal">;

/* prettier-ignore-end */

