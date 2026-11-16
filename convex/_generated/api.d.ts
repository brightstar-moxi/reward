/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminReferrals from "../adminReferrals.js";
import type * as adminRewards from "../adminRewards.js";
import type * as adminSubmissions from "../adminSubmissions.js";
import type * as adminTasks from "../adminTasks.js";
import type * as adminUsers from "../adminUsers.js";
import type * as adminWallet from "../adminWallet.js";
import type * as adminWithdrawals from "../adminWithdrawals.js";
import type * as dailyActivities from "../dailyActivities.js";
import type * as dailyPenalties from "../dailyPenalties.js";
import type * as participation from "../participation.js";
import type * as platformSettings from "../platformSettings.js";
import type * as referrals from "../referrals.js";
import type * as seed from "../seed.js";
import type * as seedAdmin from "../seedAdmin.js";
import type * as sessions from "../sessions.js";
import type * as taskSubmissions from "../taskSubmissions.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminReferrals: typeof adminReferrals;
  adminRewards: typeof adminRewards;
  adminSubmissions: typeof adminSubmissions;
  adminTasks: typeof adminTasks;
  adminUsers: typeof adminUsers;
  adminWallet: typeof adminWallet;
  adminWithdrawals: typeof adminWithdrawals;
  dailyActivities: typeof dailyActivities;
  dailyPenalties: typeof dailyPenalties;
  participation: typeof participation;
  platformSettings: typeof platformSettings;
  referrals: typeof referrals;
  seed: typeof seed;
  seedAdmin: typeof seedAdmin;
  sessions: typeof sessions;
  taskSubmissions: typeof taskSubmissions;
  tasks: typeof tasks;
  users: typeof users;
  wallet: typeof wallet;
  withdrawals: typeof withdrawals;
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
