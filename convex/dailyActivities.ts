// import {
//   mutation,
//   query,
// } from "./_generated/server";

// import { v } from "convex/values";

// export const getByDay = query({
//   args: {
//     day: v.number(),
//   },

//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("dailyActivities")
//       .withIndex("by_day", (q) =>
//         q.eq("day", args.day)
//       )
//       .unique();
//   },
// });

// export const create = mutation({
//   args: {
//     day: v.number(),
//     title: v.string(),
//     description: v.string(),
//   },

//   handler: async (ctx, args) => {
//     const existing = await ctx.db
//       .query("dailyActivities")
//       .withIndex("by_day", (q) =>
//         q.eq("day", args.day)
//       )
//       .unique();

//     if (existing) {
//       throw new Error(
//         `Day ${args.day} already exists.`
//       );
//     }

//     const now = Date.now();

//     return await ctx.db.insert(
//       "dailyActivities",
//       {
//         day: args.day,
//         title: args.title,
//         description: args.description,
//         isActive: true,
//         createdAt: now,
//         updatedAt: now,
//       }
//     );
//   },
// });


// export const getAll = query({
//   args: {},

//   handler: async (ctx) => {
//     return await ctx.db
//       .query("dailyActivities")
//       .collect();
//   },
// });





import {
  mutation,
  query,
} from "./_generated/server";

import { v } from "convex/values";

const DEFAULT_JOURNEY_DAYS = 100;

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
    if (!Number.isSafeInteger(args.day) || args.day < 1) {
      throw new Error("Day must be a positive whole number.");
    }

    const settings = await ctx.db
      .query("platformSettings")
      .first();

    const totalJourneyDays =
      settings?.totalJourneyDays ?? DEFAULT_JOURNEY_DAYS;

    if (args.day > totalJourneyDays) {
      throw new Error(
        `Day cannot exceed the configured journey length of ${totalJourneyDays} days.`
      );
    }

    const existing = await ctx.db
      .query("dailyActivities")
      .withIndex("by_day", (q) =>
        q.eq("day", args.day)
      )
      .unique();

    if (existing) {
      throw new Error(`Day ${args.day} already exists.`);
    }

    const now = Date.now();

    return await ctx.db.insert("dailyActivities", {
      day: args.day,
      title: args.title,
      description: args.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
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
