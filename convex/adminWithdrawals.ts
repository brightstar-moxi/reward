
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

export const startProcessing = mutation({
  args: {
    token: v.string(),
    withdrawalId: v.id("withdrawals"),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const withdrawal = await ctx.db.get(args.withdrawalId);

    if (!withdrawal) {
      throw new Error("Withdrawal request not found.");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("Only pending requests can be processed.");
    }

    await ctx.db.patch(args.withdrawalId, {
      status: "processing",
      reviewedAt: Date.now(),
    });

    return {
      success: true,
      status: "processing",
    };
  },
});


export const markPaid = mutation({
  args: {
    token: v.string(),
    withdrawalId: v.id("withdrawals"),
    paymentReference: v.string(),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    const withdrawal = await ctx.db.get(args.withdrawalId);

    if (!withdrawal) {
      throw new Error("Withdrawal request not found.");
    }

    if (withdrawal.status !== "processing") {
      throw new Error(
        "Only withdrawals being processed can be marked as paid."
      );
    }

    const paymentReference = args.paymentReference.trim();

    if (!paymentReference) {
      throw new Error("Enter the payment reference.");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", withdrawal.userId)
      )
      .unique();

    if (!wallet) {
      throw new Error("User wallet not found.");
    }

    const now = Date.now();

    await ctx.db.patch(withdrawal._id, {
      status: "paid",
      paymentReference,
      reviewedAt: now,
      reviewedBy: admin._id,
      paidAt: now,
    });

    await ctx.db.patch(wallet._id, {
      totalWithdrawn: wallet.totalWithdrawn + withdrawal.amount,
      updatedAt: now,
    });

    return {
      success: true,
      status: "paid",
    };
  },
});


export const rejectWithdrawal = mutation({
  args: {
    token: v.string(),
    withdrawalId: v.id("withdrawals"),
    adminNote: v.string(),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    const withdrawal = await ctx.db.get(args.withdrawalId);

    if (!withdrawal) {
      throw new Error("Withdrawal request not found.");
    }

    if (
      withdrawal.status !== "pending" &&
      withdrawal.status !== "processing"
    ) {
      throw new Error(
        "Only pending or processing withdrawals can be rejected."
      );
    }

    const adminNote = args.adminNote.trim();

    if (!adminNote) {
      throw new Error("Provide a reason for rejecting the withdrawal.");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) =>
        q.eq("userId", withdrawal.userId)
      )
      .unique();

    if (!wallet) {
      throw new Error("User wallet not found.");
    }

    const now = Date.now();
    const refundReference = `WITHDRAWAL-REFUND-${withdrawal._id}`;

    const existingRefund = await ctx.db
      .query("walletTransactions")
      .withIndex("by_reference", (q) =>
        q.eq("reference", refundReference)
      )
      .unique();

    if (existingRefund) {
      throw new Error(
        "A refund transaction already exists. Review this withdrawal before proceeding."
      );
    }

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + withdrawal.amount,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: withdrawal.userId,
      type: "refund",
      amount: withdrawal.amount,
      description: "Refund for rejected withdrawal",
      reference: refundReference,
      createdAt: now,
    });

    await ctx.db.patch(withdrawal._id, {
      status: "rejected",
      adminNote,
      reviewedAt: now,
      reviewedBy: admin._id,
    });

    return {
      success: true,
      status: "rejected",
      refundedAmount: withdrawal.amount,
    };
  },
});


export const getAllWithdrawals = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    if (!admin) {
      throw new Error("Unauthorized.");
    }

    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_status")
      .order("desc")
      .collect();

    return await Promise.all(
      withdrawals.map(async (withdrawal) => {
        const user = await ctx.db.get(withdrawal.userId);

        return {
          ...withdrawal,
          userName: user?.name ?? "Unknown user",
          userEmail: user?.email ?? "Unknown email",
        };
      })
    );
  },
});



//testing

export const createTestWithdrawal = mutation({
  args: {
    token: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    // Only allow this mutation when explicitly enabled in development.
    if (process.env.ALLOW_TEST_WITHDRAWALS !== "true") {
      throw new Error("Test withdrawals are disabled.");
    }

    await authenticateAdmin(ctx, args.token);

    const email = args.email.trim().toLowerCase();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Test user not found.");
    }

    if (user.status !== "active") {
      throw new Error("Test user account is not active.");
    }

    // Prevent multiple active test withdrawals.
    const pending = await ctx.db
      .query("withdrawals")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "pending")
      )
      .first();

    const processing = await ctx.db
      .query("withdrawals")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "processing")
      )
      .first();

    if (pending || processing) {
      throw new Error("This user already has an active withdrawal.");
    }

    const now = Date.now();
    const testCredit = 15000;
    const withdrawalAmount = 10000;
    const reference = `TEST-${user._id}-${now}`;

    // Get or create the user's wallet.
    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingWallet) {
      await ctx.db.patch(existingWallet._id, {
        balance: existingWallet.balance + testCredit,
        totalEarned: existingWallet.totalEarned + testCredit,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("wallets", {
        userId: user._id,
        balance: testCredit,
        totalEarned: testCredit,
        totalWithdrawn: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Record the test wallet credit.
    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      type: "reward",
      amount: testCredit,
      description: "Development test wallet credit",
      reference: `${reference}-CREDIT`,
      createdAt: now,
    });

    // Create the pending withdrawal.
    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId: user._id,
      amount: withdrawalAmount,
      status: "pending",
      bankName: "TEST BANK",
      accountName: user.name,
      accountNumber: "0000000000",
      requestedAt: now,
    });

    // Reserve the withdrawal amount.
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!wallet || wallet.balance < withdrawalAmount) {
      throw new Error("Insufficient test wallet balance.");
    }

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - withdrawalAmount,
      updatedAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      type: "withdrawal",
      amount: -withdrawalAmount,
      description: "Development test withdrawal",
      reference: `${reference}-WITHDRAWAL`,
      createdAt: now,
    });

    return {
      success: true,
      message: "Test withdrawal created successfully.",
      withdrawalId,
      userEmail: user.email,
      amount: withdrawalAmount,
    };
  },
});

