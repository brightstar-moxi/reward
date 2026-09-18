import {
  mutation,
  query,
} from "./_generated/server";

import { v } from "convex/values";

export const getByDay = query({
  args: {
    day: v.number(),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_day_active", (q) =>
        q
          .eq("day", args.day)
          .eq("isActive", true)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
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
  },

  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("tasks", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});



export const getById = query({
  args: {
    taskId: v.id("tasks"),
  },

  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (!task || !task.isActive) {
      return null;
    }

    return task;
  },
});