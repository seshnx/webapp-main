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
import type * as enhancedPresence from "../enhancedPresence.js";
import type * as enhancedSchema from "../enhancedSchema.js";
import type * as marketplace from "../marketplace.js";
import type * as migrateProfileFields from "../migrateProfileFields.js";
import type * as migrations from "../migrations.js";
import type * as moderation from "../moderation.js";
import type * as notifications from "../notifications.js";
import type * as partners from "../partners.js";
import type * as presence from "../presence.js";
import type * as sbookings from "../sbookings.js";
import type * as schema_expanded from "../schema_expanded.js";
import type * as social from "../social.js";
import type * as storage from "../storage.js";
import type * as studioManager from "../studioManager.js";
import type * as studios from "../studios.js";
import type * as users from "../users.js";
import type * as utils_slugs from "../utils/slugs.js";
import type * as wallets from "../wallets.js";

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
  enhancedPresence: typeof enhancedPresence;
  enhancedSchema: typeof enhancedSchema;
  marketplace: typeof marketplace;
  migrateProfileFields: typeof migrateProfileFields;
  migrations: typeof migrations;
  moderation: typeof moderation;
  notifications: typeof notifications;
  partners: typeof partners;
  presence: typeof presence;
  sbookings: typeof sbookings;
  schema_expanded: typeof schema_expanded;
  social: typeof social;
  storage: typeof storage;
  studioManager: typeof studioManager;
  studios: typeof studios;
  users: typeof users;
  "utils/slugs": typeof utils_slugs;
  wallets: typeof wallets;
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
