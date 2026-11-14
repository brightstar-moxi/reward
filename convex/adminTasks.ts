
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

const taskType = v.union(
  v.literal("daily_login"),
  v.literal("watch_video"),
  v.literal("visit_website"),
  v.literal("youtube_subscribe"),
  v.literal("social_like"),
  v.literal("social_comment"),
  v.literal("follow"),
  v.literal("custom")
);

// Retrieve all tasks, including inactive tasks.
export const getAllTasks = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const tasks = await ctx.db.query("tasks").collect();

    return tasks.sort(
      (a, b) => a.day - b.day || b.createdAt - a.createdAt
    );
  },
});

// Create a task for any day from 1 to 100.
export const createTask = mutation({
  args: {
    token: v.string(),
    day: v.number(),
    title: v.string(),
    description: v.string(),
    type: taskType,
    reward: v.number(),
    targetUrl: v.optional(v.string()),
    requiresProof: v.boolean(),
    instructions: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    if (!Number.isInteger(args.day) || args.day < 1 || args.day > 100) {
      throw new Error("Task day must be between 1 and 100.");
    }

    if (!Number.isFinite(args.reward) || args.reward <= 0) {
      throw new Error("Task reward must be greater than zero.");
    }

    if (!args.title.trim() || !args.description.trim()) {
      throw new Error("Task title and description are required.");
    }

    const now = Date.now();

    const taskId = await ctx.db.insert("tasks", {
      day: args.day,
      title: args.title.trim(),
      description: args.description.trim(),
      type: args.type,
      reward: args.reward,
      targetUrl: args.targetUrl,
      requiresProof: args.requiresProof,
      instructions: args.instructions.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Task created successfully.",
      taskId,
    };
  },
});

// Edit an existing task.
export const updateTask = mutation({
  args: {
    token: v.string(),
    taskId: v.id("tasks"),
    day: v.number(),
    title: v.string(),
    description: v.string(),
    type: taskType,
    reward: v.number(),
    targetUrl: v.union(v.string(), v.null()),
    requiresProof: v.boolean(),
    instructions: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found.");
    }

    if (!Number.isInteger(args.day) || args.day < 1 || args.day > 100) {
      throw new Error("Task day must be between 1 and 100.");
    }

    if (!Number.isFinite(args.reward) || args.reward <= 0) {
      throw new Error("Task reward must be greater than zero.");
    }

    if (!args.title.trim() || !args.description.trim()) {
      throw new Error("Task title and description are required.");
    }

    await ctx.db.patch(args.taskId, {
      day: args.day,
      title: args.title.trim(),
      description: args.description.trim(),
      type: args.type,
      reward: args.reward,
      targetUrl: args.targetUrl === null ? undefined : args.targetUrl,
      requiresProof: args.requiresProof,
      instructions: args.instructions.trim(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Task updated successfully.",
    };
  },
});

// Activate or deactivate a task.
export const updateTaskStatus = mutation({
  args: {
    token: v.string(),
    taskId: v.id("tasks"),
    isActive: v.boolean(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found.");
    }

    await ctx.db.patch(args.taskId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: args.isActive
        ? "Task activated successfully."
        : "Task deactivated successfully.",
    };
  },
});

// Delete a task only if it has no submission history.
export const deleteTask = mutation({
  args: {
    token: v.string(),
    taskId: v.id("tasks"),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found.");
    }

    const submissions = await ctx.db
      .query("taskSubmissions")
      .collect();

    const hasSubmissions = submissions.some(
      (submission) => submission.taskId === args.taskId
    );

    if (hasSubmissions) {
      throw new Error(
        "This task has submission history. Deactivate it instead of deleting it."
      );
    }

    await ctx.db.delete(args.taskId);

    return {
      success: true,
      message: "Task deleted successfully.",
    };
  },
});
