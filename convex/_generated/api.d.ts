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
import type * as broadcasts from "../broadcasts.js";
import type * as comments from "../comments.js";
import type * as conversations from "../conversations.js";
import type * as edu from "../edu.js";
import type * as enhancedPresence from "../enhancedPresence.js";
import type * as enhancedSchema from "../enhancedSchema.js";
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as kiosk from "../kiosk.js";
import type * as marketplace from "../marketplace.js";
import type * as messages from "../messages.js";
import type * as migrate from "../migrate.js";
import type * as migrateExtended from "../migrateExtended.js";
import type * as migrateProfileFields from "../migrateProfileFields.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as presence from "../presence.js";
import type * as profileUpdates from "../profileUpdates.js";
import type * as reactions from "../reactions.js";
import type * as readReceipts from "../readReceipts.js";
import type * as schema_expanded from "../schema_expanded.js";
import type * as social from "../social.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  broadcasts: typeof broadcasts;
  comments: typeof comments;
  conversations: typeof conversations;
  edu: typeof edu;
  enhancedPresence: typeof enhancedPresence;
  enhancedSchema: typeof enhancedSchema;
  follows: typeof follows;
  http: typeof http;
  kiosk: typeof kiosk;
  marketplace: typeof marketplace;
  messages: typeof messages;
  migrate: typeof migrate;
  migrateExtended: typeof migrateExtended;
  migrateProfileFields: typeof migrateProfileFields;
  notifications: typeof notifications;
  posts: typeof posts;
  presence: typeof presence;
  profileUpdates: typeof profileUpdates;
  reactions: typeof reactions;
  readReceipts: typeof readReceipts;
  schema_expanded: typeof schema_expanded;
  social: typeof social;
  users: typeof users;
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
