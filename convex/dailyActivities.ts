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
      .query("dailyActivities")
      .withIndex("by_day", (q) =>
        q.eq("day", args.day)
      )
      .unique();
  },
});

export const create = mutation({
  args: {
    day: v.number(),
    title: v.string(),
    description: v.string(),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyActivities")
      .withIndex("by_day", (q) =>
        q.eq("day", args.day)
      )
      .unique();

    if (existing) {
      throw new Error(
        `Day ${args.day} already exists.`
      );
    }

    const now = Date.now();

    return await ctx.db.insert(
      "dailyActivities",
      {
        day: args.day,
        title: args.title,
        description: args.description,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
  },
});


export const getAll = query({
  args: {},

  handler: async (ctx) => {
    return await ctx.db
      .query("dailyActivities")
      .collect();
  },
});