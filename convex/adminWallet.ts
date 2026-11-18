
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authenticateAdmin } from "./adminSubmissions";

/**
 * Get platform-wide wallet statistics.
 */

export const getWalletOverview = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [wallets, rewardTransactions] = await Promise.all([
      ctx.db.query("wallets").collect(),
      ctx.db
        .query("walletTransactions")
        .withIndex("by_type", (q) =>
          q.eq("type", "reward")
        )
        .collect(),
    ]);

    const genuineRewards = rewardTransactions.filter(
      (transaction) => transaction.isTest !== true
    );

    return {
      totalWallets: wallets.length,

      totalBalance: wallets.reduce(
        (total, wallet) => total + wallet.balance,
        0
      ),

      totalEarned: genuineRewards.reduce(
        (total, transaction) => total + transaction.amount,
        0
      ),

      totalWithdrawn: wallets.reduce(
        (total, wallet) => total + wallet.totalWithdrawn,
        0
      ),
    };
  },
});

/**
 * Get all users and their wallet information.
 */
export const getAllWallets = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [users, wallets] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("wallets").collect(),
    ]);

    const walletMap = new Map(
      wallets.map((wallet) => [
        wallet.userId.toString(),
        wallet,
      ])
    );

    return users.map((user) => {
      const wallet = walletMap.get(user._id.toString());

      return {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userStatus: user.status,

        balance: wallet?.balance ?? 0,
        totalEarned: wallet?.totalEarned ?? 0,
        totalWithdrawn: wallet?.totalWithdrawn ?? 0,

        walletExists: Boolean(wallet),
        updatedAt: wallet?.updatedAt ?? null,
      };
    });
  },
});



export const getUserTransactions = query({
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

    const transactions = await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId)
      )
      .order("desc")
      .collect();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      transactions,
    };
  },
});



/**
 * Manually credit a user's wallet.
 */
export const creditUserWallet = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      throw new Error("Enter a valid credit amount.");
    }

    const reason = args.reason.trim();

    if (!reason || reason.length > 250) {
      throw new Error("Provide a reason between 1 and 250 characters.");
    }

    const user = await ctx.db.get(args.userId);

    if (!user || user.status !== "active") {
      throw new Error("User not found or account is inactive.");
    }

    const now = Date.now();

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId)
      )
      .unique();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        createdAt: now,
        updatedAt: now,
      });

      wallet = await ctx.db.get(walletId);

      if (!wallet) {
        throw new Error("Could not create wallet.");
      }
    }

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + args.amount,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      type: "refund",
      amount: args.amount,
      description: `Admin credit: ${reason}`,
      reference: `ADMIN-CREDIT-${args.userId}-${now}`,
      adminUserId: admin._id,
      isTest: false,
      createdAt: now,
    });

    return {
      success: true,
      message: "Wallet credited successfully.",
    };
  },
});

/**
 * Manually debit a user's wallet.
 */
export const debitUserWallet = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      throw new Error("Enter a valid debit amount.");
    }

    const reason = args.reason.trim();

    if (!reason || reason.length > 250) {
      throw new Error("Provide a reason between 1 and 250 characters.");
    }

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId)
      )
      .unique();

    if (!wallet || wallet.balance < args.amount) {
      throw new Error("Insufficient wallet balance.");
    }

    const now = Date.now();

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - args.amount,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      type: "penalty",
      amount: -args.amount,
      description: `Admin debit: ${reason}`,
      reference: `ADMIN-DEBIT-${args.userId}-${now}`,
      adminUserId: admin._id,
      isTest: false,
      createdAt: now,
    });

    return {
      success: true,
      message: "Wallet debited successfully.",
    };
  },
});
