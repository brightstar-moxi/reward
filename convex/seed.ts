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


export const createDay1Tasks = mutation({
  args: {},

  handler: async (ctx) => {
    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_day", (q) =>
        q.eq("day", 1)
      )
      .collect();

    if (existing.length > 0) {
      return existing.map((task) => task._id);
    }

    const now = Date.now();

    const tasks = [
      {
        day: 1,
        title: "Daily Login Reward",
        description:
          "Claim your reward for checking in today.",
        type: "daily_login" as const,
        reward: 100,
        requiresProof: false,
        instructions:
          "Click the claim button to complete your daily check-in.",
      },

      {
        day: 1,
        title: "Watch a Video",
        description:
          "Watch the assigned video and complete the task.",
        type: "watch_video" as const,
        reward: 100,
        targetUrl: "https://www.youtube.com/",
        requiresProof: true,
        instructions:
          "Open the video, watch it as instructed, then submit your proof.",
      },

      {
        day: 1,
        title: "Subscribe on YouTube",
        description:
          "Subscribe to the assigned YouTube channel.",
        type: "youtube_subscribe" as const,
        reward: 200,
        targetUrl: "https://www.youtube.com/",
        requiresProof: true,
        instructions:
          "Open the YouTube channel, subscribe, return here and submit a screenshot as proof.",
      },
    ];

    const ids = [];

    for (const task of tasks) {
      const id = await ctx.db.insert("tasks", {
        ...task,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      ids.push(id);
    }

    return ids;
  },
});