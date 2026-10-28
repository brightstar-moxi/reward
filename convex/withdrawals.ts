
import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getEligibility = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const tokenHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(args.token)
    );

    const tokenHash = Array.from(
      new Uint8Array(tokenHashBuffer)
    )
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session || session.expiresAt <= Date.now()) {
      throw new Error("Please sign in again.");
    }

    const user = await ctx.db.get(session.userId);

    if (!user || user.status !== "active") {
      throw new Error("Your account is not active.");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .unique();

    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .collect();

    const completedDays = new Set(
      activities
        .filter((activity) => activity.status === "completed")
        .map((activity) => activity.day)
    ).size;

    const referrals = await ctx.db
      .query("users")
      .withIndex("by_referred_by", (q) =>
        q.eq("referredBy", user._id)
      )
      .collect();

    let qualifiedReferrals = 0;

    for (const referral of referrals) {
      const referralActivities = await ctx.db
        .query("userActivities")
        .withIndex("by_user", (q) =>
          q.eq("userId", referral._id)
        )
        .collect();

      const referralCompletedDays = new Set(
        referralActivities
          .filter((activity) => activity.status === "completed")
          .map((activity) => activity.day)
      ).size;

      if (referralCompletedDays >= 10) {
        qualifiedReferrals++;
      }
    }

    const balance = wallet?.balance ?? 0;

    return {
      balance,
      minimumBalance: 10_000,
      completedDays,
      requiredCompletedDays: 30,
      totalReferrals: referrals.length,
      qualifiedReferrals,
      requiredReferrals: 10,
      requiredDaysPerReferral: 10,
      eligible:
        balance >= 10_000 &&
        completedDays >= 30 &&
        qualifiedReferrals >= 10,
    };
  },
});




export const requestWithdrawal = mutation({
  args: {
    token: v.string(),
    amount: v.number(),
    bankName: v.string(),
    accountName: v.string(),
    accountNumber: v.string(),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate the user.
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(args.token)
    );

    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session || session.expiresAt <= Date.now()) {
      throw new Error("Please sign in again.");
    }

    const user = await ctx.db.get(session.userId);

    if (!user || user.status !== "active") {
      throw new Error("Your account is not active.");
    }

    // 2. Validate withdrawal amount and bank details.
    if (
      !Number.isSafeInteger(args.amount) ||
      args.amount < 10_000
    ) {
      throw new Error("The minimum withdrawal is ₦10,000.");
    }

    const bankName = args.bankName.trim();
    const accountName = args.accountName.trim();
    const accountNumber = args.accountNumber.trim();

    if (!bankName || !accountName) {
      throw new Error("Enter your bank name and account name.");
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      throw new Error(
        "Enter a valid 10-digit Nigerian account number."
      );
    }

    // 3. Verify the user's 30 cumulative completed activity days.
    const activities = await ctx.db
      .query("userActivities")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .collect();

    const completedDays = new Set(
      activities
        .filter((activity) => activity.status === "completed")
        .map((activity) => activity.day)
    ).size;

    if (completedDays < 30) {
      throw new Error(
        "You need 30 completed activity days to withdraw."
      );
    }

    // 4. Verify at least 10 qualified referrals.
    const referrals = await ctx.db
      .query("users")
      .withIndex("by_referred_by", (q) =>
        q.eq("referredBy", user._id)
      )
      .collect();

    let qualifiedReferrals = 0;

    for (const referral of referrals) {
      if (referral.status !== "active") {
        continue;
      }

      const referralActivities = await ctx.db
        .query("userActivities")
        .withIndex("by_user", (q) =>
          q.eq("userId", referral._id)
        )
        .collect();

      const referralCompletedDays = new Set(
        referralActivities
          .filter((activity) => activity.status === "completed")
          .map((activity) => activity.day)
      ).size;

      if (referralCompletedDays >= 10) {
        qualifiedReferrals++;
      }
    }

    if (qualifiedReferrals < 10) {
      throw new Error(
        "You need 10 active referred users who have each completed 10 activity days."
      );
    }

    // 5. Prevent multiple active withdrawal requests.
    const existingRequests = await ctx.db
      .query("withdrawals")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id)
      )
      .collect();

    const hasActiveRequest = existingRequests.some(
      (request) =>
        request.status === "pending" ||
        request.status === "processing"
    );

    if (hasActiveRequest) {
      throw new Error(
        "You already have a withdrawal request awaiting processing."
      );
    }

    // 6. Check the wallet balance.
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", user._id)
      )
      .unique();

    if (!wallet || wallet.balance < args.amount) {
      throw new Error("Insufficient wallet balance.");
    }

    // 7. Reserve the funds and record the request atomically.
    const now = Date.now();

    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId: user._id,
      amount: args.amount,
      status: "pending",
      bankName,
      accountName,
      accountNumber,
      requestedAt: now,
    });

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - args.amount,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      type: "withdrawal",
      amount: -args.amount,
      description: "Withdrawal requested",
      reference: `WITHDRAWAL-${withdrawalId}`,
      createdAt: now,
    });

    return {
      success: true,
      withdrawalId,
      status: "pending",
    };
  },
});


