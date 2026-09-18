// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     name: v.string(),
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

//     referralCode: v.string(),
//     referredBy: v.optional(v.string()),

//     createdAt: v.number(),
//     updatedAt: v.number(),
//   }).index("by_email", ["email"]),

//   sessions: defineTable({
//     userId: v.id("users"),
//     tokenHash: v.string(),
//     expiresAt: v.number(),
//     createdAt: v.number(),
//   }).index("by_token_hash", ["tokenHash"]),
// });


import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),

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
  }).index("by_email", ["email"])
    .index("by_referral_code", ["referralCode"])
  .index("by_referred_by", ["referredBy"]),

 sessions: defineTable({
  userId: v.id("users"),
  tokenHash: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
}).index("by_token_hash", ["tokenHash"]),

dailyActivities: defineTable({
  day: v.number(),
  title: v.string(),
  description: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_day", ["day"]),

userActivities: defineTable({
  userId: v.id("users"),
  day: v.number(),
  status: v.union(
    v.literal("available"),
    v.literal("in_progress"),
    v.literal("completed")
  ),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_day", ["userId", "day"]),
});


