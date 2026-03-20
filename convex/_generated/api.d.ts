/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookingReminders from "../bookingReminders.js";
import type * as bookings from "../bookings.js";
import type * as comments from "../comments.js";
import type * as conversations from "../conversations.js";
import type * as edu from "../edu.js";
import type * as eduAnnouncements from "../eduAnnouncements.js";
import type * as enhancedSchema from "../enhancedSchema.js";
import type * as migrateProfileFields from "../migrateProfileFields.js";
import type * as schema_expanded from "../schema_expanded.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookingReminders: typeof bookingReminders;
  bookings: typeof bookings;
  comments: typeof comments;
  conversations: typeof conversations;
  edu: typeof edu;
  eduAnnouncements: typeof eduAnnouncements;
  enhancedSchema: typeof enhancedSchema;
  migrateProfileFields: typeof migrateProfileFields;
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
