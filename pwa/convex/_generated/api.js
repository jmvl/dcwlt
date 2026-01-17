/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import { anyApi, componentsGeneric } from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api = anyApi;
export const internal = anyApi;
export const components = componentsGeneric();

// Stub type definitions for TypeScript during SSR build
// These will be replaced by real types when Convex is deployed
export const wallets = {
  getBalance: 'wallets.getBalance',
  updateBalance: 'wallets.updateBalance',
  setMockBalance: 'wallets.setMockBalance',
  mockTopUp: 'wallets.mockTopUp',
};

export const users = {
  createFromPrivy: 'users.createFromPrivy',
};

export const topups = {
  recordTopUp: 'topups.recordTopUp',
};
