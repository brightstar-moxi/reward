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




export const getMyDailyTasks = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    // Validate the user's session.
    const tokenBytes = new TextEncoder().encode(args.token);
    const hash = await crypto.subtle.digest(
      "SHA-256",
      tokenBytes
    );

    const tokenHash = Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session || session.expiresAt <= Date.now()) {
      throw new Error("Your session is invalid or expired.");
    }

    const user = await ctx.db.get(session.userId);

    if (!user || user.status !== "active") {
      throw new Error("Your account is unavailable.");
    }

    // Calculate the participation day using Nigeria time (UTC+1).
    const now = Date.now();
    const nigeriaOffset = 60 * 60 * 1000;
    const dayLength = 24 * 60 * 60 * 1000;

    const getNigeriaDayStart = (timestamp: number) => {
      const date = new Date(timestamp + nigeriaOffset);

      return (
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate()
        ) - nigeriaOffset
      );
    };

    const registrationDay = getNigeriaDayStart(user.createdAt);
    const currentCalendarDay = getNigeriaDayStart(now);

    const currentDay = Math.min(
      100,
      Math.max(
        1,
        Math.floor(
          (currentCalendarDay - registrationDay) / dayLength
        ) + 1
      )
    );

    // Get active tasks assigned to this participation day.
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_day_active", (q) =>
        q.eq("day", currentDay).eq("isActive", true)
      )
      .collect();

    // Attach each task's latest submission, if one exists.
    const dailyTasks = await Promise.all(
      tasks.map(async (task) => {
        const submissions = await ctx.db
          .query("taskSubmissions")
          .withIndex("by_user_task", (q) =>
            q.eq("userId", user._id).eq("taskId", task._id)
          )
          .collect();

        const latestSubmission = submissions.sort(
          (a, b) => b.submittedAt - a.submittedAt
        )[0];

        return {
          ...task,
          submissionStatus: latestSubmission?.status ?? "not_started",
          submittedAt: latestSubmission?.submittedAt ?? null,
          retryAvailableAt:
            latestSubmission?.retryAvailableAt ?? null,
          adminNote: latestSubmission?.adminNote ?? null,
        };
      })
    );

    const completedTasks = dailyTasks.filter(
      (task) => task.submissionStatus === "approved"
    ).length;

    return {
      currentDay,
      totalDays: 100,
      totalTasks: dailyTasks.length,
      completedTasks,
      tasks: dailyTasks,
    };
  },
});
