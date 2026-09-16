
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


// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";
// import { authTables } from "@convex-dev/auth/server";

// export default defineSchema({
//   ...authTables,

//   users: defineTable({
//     name: v.string(),

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
//   }).index("by_referral_code", ["referralCode"]),
// });


import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),

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
});