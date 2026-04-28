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
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as kiosk from "../kiosk.js";
import type * as labels from "../labels.js";
import type * as marketplace from "../marketplace.js";
import type * as messages from "../messages.js";
import type * as messenger from "../messenger.js";
import type * as migrate from "../migrate.js";
import type * as migrateExtended from "../migrateExtended.js";
import type * as migrateProfileFields from "../migrateProfileFields.js";
import type * as migrations from "../migrations.js";
import type * as moderation from "../moderation.js";
import type * as notifications from "../notifications.js";
import type * as partners from "../partners.js";
import type * as posts from "../posts.js";
import type * as presence from "../presence.js";
import type * as profileUpdates from "../profileUpdates.js";
import type * as reactions from "../reactions.js";
import type * as readReceipts from "../readReceipts.js";
import type * as sbookings from "../sbookings.js";
import type * as schema_expanded from "../schema_expanded.js";
import type * as schools from "../schools.js";
import type * as settings from "../settings.js";
import type * as social from "../social.js";
import type * as socialEnhanced from "../socialEnhanced.js";
import type * as socialNotifications from "../socialNotifications.js";
import type * as socialSearch from "../socialSearch.js";
import type * as storage from "../storage.js";
import type * as studioManager from "../studioManager.js";
import type * as studios from "../studios.js";
import type * as techShops from "../techShops.js";
import type * as users from "../users.js";
import type * as utils_slugs from "../utils/slugs.js";
import type * as utils_users from "../utils/users.js";
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
  follows: typeof follows;
  http: typeof http;
  kiosk: typeof kiosk;
  labels: typeof labels;
  marketplace: typeof marketplace;
  messages: typeof messages;
  messenger: typeof messenger;
  migrate: typeof migrate;
  migrateExtended: typeof migrateExtended;
  migrateProfileFields: typeof migrateProfileFields;
  migrations: typeof migrations;
  moderation: typeof moderation;
  notifications: typeof notifications;
  partners: typeof partners;
  posts: typeof posts;
  presence: typeof presence;
  profileUpdates: typeof profileUpdates;
  reactions: typeof reactions;
  readReceipts: typeof readReceipts;
  sbookings: typeof sbookings;
  schema_expanded: typeof schema_expanded;
  schools: typeof schools;
  settings: typeof settings;
  social: typeof social;
  socialEnhanced: typeof socialEnhanced;
  socialNotifications: typeof socialNotifications;
  socialSearch: typeof socialSearch;
  storage: typeof storage;
  studioManager: typeof studioManager;
  studios: typeof studios;
  techShops: typeof techShops;
  users: typeof users;
  "utils/slugs": typeof utils_slugs;
  "utils/users": typeof utils_users;
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
