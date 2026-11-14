
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

// Retrieve all registered users.
export const getAllUsers = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const users = await ctx.db.query("users").collect();

    return users
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
  },
});

// Retrieve one user's details.
export const getUserById = query({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .unique();

    const referrals = await ctx.db
      .query("users")
      .withIndex("by_referred_by", (q) =>
        q.eq("referredBy", user.referralCode)
      )
      .collect();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      wallet: wallet
        ? {
            balance: wallet.balance,
            totalEarned: wallet.totalEarned,
            totalWithdrawn: wallet.totalWithdrawn,
          }
        : null,
      totalReferrals: referrals.length,
    };
  },
});

// Suspend a normal user and invalidate their sessions.
export const suspendUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    if (admin._id === args.userId) {
      throw new Error("You cannot suspend your own account.");
    }

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.role === "admin") {
      throw new Error("Administrator accounts cannot be suspended here.");
    }

    if (user.status === "suspended") {
      throw new Error("This account is already suspended.");
    }

    const now = Date.now();

    await ctx.db.patch(user._id, {
      status: "suspended",
      updatedAt: now,
    });

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .collect();

    await Promise.all(
      sessions.map((session) =>
        ctx.db.delete(session._id)
      )
    );

    return {
      success: true,
      message: "User suspended successfully.",
    };
  },
});

// Reactivate a suspended normal user.
export const activateUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.role === "admin") {
      throw new Error("This operation is only for normal user accounts.");
    }

    if (user.status === "active") {
      throw new Error("This account is already active.");
    }

    await ctx.db.patch(user._id, {
      status: "active",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "User reactivated successfully.",
    };
  },
});
