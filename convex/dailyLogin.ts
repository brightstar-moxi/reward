
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authenticateAdmin } from "./adminSubmissions";

const DEFAULT_DAILY_LOGIN_REWARD = 100;

async function authenticateUser(ctx: any, token: string) {
  const tokenHashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );

  const tokenHash = Array.from(new Uint8Array(tokenHashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token_hash", (q: any) =>
      q.eq("tokenHash", tokenHash)
    )
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const user = await ctx.db.get(session.userId);

  if (!user || user.status !== "active") {
    throw new Error("Your account is unavailable.");
  }

  return user;
}

function getNigeriaDate(timestamp: number) {
  const date = new Date(timestamp + 60 * 60 * 1000);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Get today's claim status for the logged-in user.
export const getMyClaim = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await authenticateUser(ctx, args.token);
    const claimDate = getNigeriaDate(Date.now());

    const claim = await ctx.db
      .query("dailyLoginClaims")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("claimDate", claimDate)
      )
      .unique();

    const settings = await ctx.db.query("platformSettings").first();

    return {
      claim,
      claimDate,
      reward:
        settings?.dailyLoginReward ?? DEFAULT_DAILY_LOGIN_REWARD,
    };
  },
});

// Submit today's Daily Login claim.
export const claim = mutation({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await authenticateUser(ctx, args.token);
    const now = Date.now();
    const claimDate = getNigeriaDate(now);

    const existingClaim = await ctx.db
      .query("dailyLoginClaims")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("claimDate", claimDate)
      )
      .unique();

    if (existingClaim) {
      throw new Error("You have already claimed Daily Login today.");
    }

    const settings = await ctx.db.query("platformSettings").first();
    const reward =
      settings?.dailyLoginReward ?? DEFAULT_DAILY_LOGIN_REWARD;

    if (!Number.isInteger(reward) || reward <= 0) {
      throw new Error("Daily Login reward is not configured correctly.");
    }

    return await ctx.db.insert("dailyLoginClaims", {
      userId: user._id,
      claimDate,
      reward,
      status: "pending",
      submittedAt: now,
    });
  },
});

// Get pending Daily Login claims for admin review.
export const getPending = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const claims = await ctx.db
      .query("dailyLoginClaims")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return await Promise.all(
      claims.map(async (claim) => {
        const user = await ctx.db.get(claim.userId);

        return {
          id: claim._id,
          claimDate: claim.claimDate,
          reward: claim.reward,
          status: claim.status,
          submittedAt: claim.submittedAt,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,
        };
      })
    );
  },
});

// Approve or reject a Daily Login claim.
export const review = mutation({
  args: {
    token: v.string(),
    claimId: v.id("dailyLoginClaims"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    adminNote: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);
    const claim = await ctx.db.get(args.claimId);

    if (!claim) {
      throw new Error("Daily Login claim not found.");
    }

    if (claim.status !== "pending") {
      throw new Error("This claim has already been reviewed.");
    }

    const now = Date.now();

    if (args.decision === "rejected") {
      await ctx.db.patch(claim._id, {
        status: "rejected",
        adminNote: args.adminNote,
        reviewedAt: now,
        reviewedBy: admin._id,
      });

      return { success: true, status: "rejected" };
    }

    if (!Number.isInteger(claim.reward) || claim.reward <= 0) {
      throw new Error("Invalid Daily Login reward.");
    }

    const reference = `DAILY-LOGIN-${claim._id}`;

    const existingTransaction = await ctx.db
      .query("walletTransactions")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .unique();

    if (existingTransaction) {
      throw new Error("This Daily Login reward has already been credited.");
    }

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", claim.userId))
      .unique();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: claim.userId,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        createdAt: now,
        updatedAt: now,
      });

      wallet = await ctx.db.get(walletId);
    }

    if (!wallet) {
      throw new Error("Unable to create or retrieve user wallet.");
    }

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + claim.reward,
      totalEarned: wallet.totalEarned + claim.reward,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: claim.userId,
      type: "reward",
      amount: claim.reward,
      description: `Daily Login Reward - ${claim.claimDate}`,
      reference,
      isTest: false,
      createdAt: now,
    });

    await ctx.db.patch(claim._id, {
      status: "approved",
      adminNote: args.adminNote,
      reviewedAt: now,
      reviewedBy: admin._id,
    });

    return {
      success: true,
      status: "approved",
      reward: claim.reward,
    };
  },
});
