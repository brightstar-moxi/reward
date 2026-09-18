import {
  mutation,
  query,
} from "./_generated/server";

import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    taskId: v.id("tasks"),
    proofStorageId: v.optional(v.id("_storage")),
  },

  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (!task || !task.isActive) {
      throw new Error("This task is no longer available.");
    }

    if (task.requiresProof && !args.proofStorageId) {
      throw new Error(
        "Proof is required for this task."
      );
    }

    const existing = await ctx.db
      .query("taskSubmissions")
      .withIndex("by_user_task", (q) =>
        q
          .eq("userId", args.userId)
          .eq("taskId", args.taskId)
      )
      .first();

    if (existing) {
      throw new Error(
        "You have already submitted this task."
      );
    }

    return await ctx.db.insert(
      "taskSubmissions",
      {
        userId: args.userId,
        taskId: args.taskId,

        proofStorageId:
          args.proofStorageId,

        status: "pending",

        submittedAt: Date.now(),
      }
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},

  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});