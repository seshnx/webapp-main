/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as users from "../users.js";
import type * as social from "../social.js";
import type * as bookings from "../bookings.js";
import type * as edu from "../edu.js";
import type * as broadcasts from "../broadcasts.js";
import type * as marketplace from "../marketplace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  users: typeof users;
  social: typeof social;
  bookings: typeof bookings;
  edu: typeof edu;
  broadcasts: typeof broadcasts;
  marketplace: typeof marketplace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 *
 * @public
 */
declare const api: FilterApi<typeof fullApi, "public">;
declare const internal: FilterApi<typeof fullApi, "internal">;

export { api, internal };
