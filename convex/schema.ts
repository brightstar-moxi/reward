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
  }).index("by_email", ["email"]),

 sessions: defineTable({
  userId: v.id("users"),
  tokenHash: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
}).index("by_token_hash", ["tokenHash"]),
});