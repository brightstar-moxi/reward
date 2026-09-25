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




  tasks: defineTable({
  day: v.number(),

  title: v.string(),
  description: v.string(),

  type: v.union(
    v.literal("daily_login"),
    v.literal("watch_video"),
    v.literal("visit_website"),
    v.literal("youtube_subscribe"),
    v.literal("social_like"),
    v.literal("social_comment"),
    v.literal("follow"),
    v.literal("custom")
  ),

  reward: v.number(),

  targetUrl: v.optional(v.string()),

  requiresProof: v.boolean(),

  instructions: v.string(),

  isActive: v.boolean(),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_day", ["day"])
  .index("by_day_active", ["day", "isActive"]),

//   taskSubmissions: defineTable({
//   userId: v.id("users"),
//   taskId: v.id("tasks"),

//   proofUrl: v.optional(v.string()),
//   proofStorageId: v.optional(v.id("_storage")),

//   status: v.union(
//     v.literal("pending"),
//     v.literal("approved"),
//     v.literal("rejected")
//   ),

//   adminNote: v.optional(v.string()),

//   submittedAt: v.number(),
//   reviewedAt: v.optional(v.number()),
//   reviewedBy: v.optional(v.id("users")),
// })
//   .index("by_user", ["userId"])
//   .index("by_task", ["taskId"])
//   .index("by_user_task", ["userId", "taskId"])
//   .index("by_status", ["status"]),



taskSubmissions: defineTable({
  userId: v.id("users"),
  taskId: v.id("tasks"),

  proofUrl: v.optional(v.string()),
  proofStorageId: v.optional(v.id("_storage")),

  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),

  adminNote: v.optional(v.string()),

  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
  reviewedBy: v.optional(v.id("users")),

  // Retry information after rejection
  rejectedAt: v.optional(v.number()),
  retryAvailableAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_task", ["taskId"])
  .index("by_user_task", ["userId", "taskId"])
  .index("by_status", ["status"]),


  walletTransactions: defineTable({
  userId: v.id("users"),

  type: v.union(
    v.literal("reward"),
    v.literal("withdrawal")
  ),

  amount: v.number(),

  description: v.string(),

  taskId: v.optional(v.id("tasks")),

  submissionId: v.optional(
    v.id("taskSubmissions")
  ),

  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_submission", ["submissionId"]),
});


