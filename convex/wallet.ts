
import { v } from "convex/values";
import {
  query,
  mutation,
} from "./_generated/server";

async function getSessionUser(
  ctx: any,
  token: string
) {
  const data = new TextEncoder().encode(token);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const tokenHash = Array.from(
    new Uint8Array(hash)
  )
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token_hash", (q: any) =>
      q.eq("tokenHash", tokenHash)
    )
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  const user = await ctx.db.get(session.userId);

  if (!user || user.status !== "active") {
    return null;
  }

  return user;
}

/**
 * Get the current user's wallet.
 */
export const getMyWallet = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx, args.token);

    if (!user) {
      throw new Error("Your session is invalid or expired.");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .unique();

    if (!wallet) {
      return {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      };
    }

    return {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
    };
  },
});

/**
 * Create the current user's wallet if it doesn't exist.
 */
export const ensureMyWallet = mutation({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx, args.token);

    if (!user) {
      throw new Error("Your session is invalid or expired.");
    }

    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .unique();

    if (existingWallet) {
      return { success: true };
    }

    const now = Date.now();

    await ctx.db.insert("wallets", {
      userId: user._id,
      balance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Get the current user's transaction history.
 */
export const getMyTransactions = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx, args.token);

    if (!user) {
      throw new Error("Your session is invalid or expired.");
    }

    return await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .order("desc")
      .collect();
  },
});
