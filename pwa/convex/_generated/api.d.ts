/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clientQr from "../clientQr.js";
import type * as cryptographicQr from "../cryptographicQr.js";
import type * as cryptographicQrInternal from "../cryptographicQrInternal.js";
import type * as events from "../events.js";
import type * as inventory from "../inventory.js";
import type * as itemGroups from "../itemGroups.js";
import type * as merchantEvents from "../merchantEvents.js";
import type * as merchants from "../merchants.js";
import type * as seedTransactions from "../seedTransactions.js";
import type * as topups from "../topups.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clientQr: typeof clientQr;
  cryptographicQr: typeof cryptographicQr;
  cryptographicQrInternal: typeof cryptographicQrInternal;
  events: typeof events;
  inventory: typeof inventory;
  itemGroups: typeof itemGroups;
  merchantEvents: typeof merchantEvents;
  merchants: typeof merchants;
  seedTransactions: typeof seedTransactions;
  topups: typeof topups;
  transactions: typeof transactions;
  users: typeof users;
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
