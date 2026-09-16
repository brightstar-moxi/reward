
// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     fullName: v.string(),
//     email: v.string(),
//     passwordHash: v.string(),

//     role: v.union(
//       v.literal("user"),
//       v.literal("admin")
//     ),

//     status: v.union(
//       v.literal("active"),
//       v.literal("suspended")
//     ),

//     createdAt: v.number(),
//     updatedAt: v.number(),
//   }).index("by_email", ["email"]),
// });


import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.string(),

    role: v.union(
      v.literal("user"),
      v.literal("admin")
    ),

    status: v.union(
      v.literal("active"),
      v.literal("suspended")
    ),

    referralCode: v.string(),

    referredBy: v.optional(v.string()),

    createdAt: v.number(),

    updatedAt: v.number(),
  }).index("by_referral_code", ["referralCode"]),

  // Convex Auth tables
  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
  })
    .index("userId", ["userId"])
    .index("providerAndAccountId", [
      "provider",
      "providerAccountId",
    ]),

  authSessions: defineTable({
    userId: v.id("users"),
    expiration: v.number(),
  }).index("userId", ["userId"]),
});

