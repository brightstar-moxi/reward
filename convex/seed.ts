import { mutation } from "./_generated/server";

export const createDay1 = mutation({
  args: {},

  handler: async (ctx) => {
    const existing = await ctx.db
      .query("dailyActivities")
      .withIndex("by_day", (q) =>
        q.eq("day", 1)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();

    return await ctx.db.insert(
      "dailyActivities",
      {
        day: 1,
        title: "Day 1 Activity",
        description:
          "Complete today's activity to participate in the 100-day program.",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
  },
});