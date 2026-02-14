/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookings from "../bookings.js";
import type * as comments from "../comments.js";
import type * as conversations from "../conversations.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as presence from "../presence.js";
import type * as profileUpdates from "../profileUpdates.js";
import type * as reactions from "../reactions.js";
import type * as readReceipts from "../readReceipts.js";
import type * as schema_expanded from "../schema_expanded.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  comments: typeof comments;
  conversations: typeof conversations;
  messages: typeof messages;
  notifications: typeof notifications;
  presence: typeof presence;
  profileUpdates: typeof profileUpdates;
  reactions: typeof reactions;
  readReceipts: typeof readReceipts;
  schema_expanded: typeof schema_expanded;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
