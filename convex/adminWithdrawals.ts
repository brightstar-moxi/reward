
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


