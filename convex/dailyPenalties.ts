
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const applyMissedDayPenalty = mutation({
  args: {
    token: v.string(),
    dayKey: v.string(),
  },

  handler: async (ctx, args) => {
    const encoder = new TextEncoder();
    const tokenBytes = encoder.encode(args.token);
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      tokenBytes
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

    // Validate YYYY-MM-DD and reject today's or future dates.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.dayKey)) {
      throw new Error("Invalid day key.");
    }

    const [year, month, day] = args.dayKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error("Invalid calendar date.");
    }

    const nigeriaOffset = 60 * 60 * 1000;
    const today = new Date(Date.now() + nigeriaOffset);
    const todayKey = [
      today.getUTCFullYear(),
      String(today.getUTCMonth() + 1).padStart(2, "0"),
      String(today.getUTCDate()).padStart(2, "0"),
    ].join("-");

    if (args.dayKey >= todayKey) {
      throw new Error("Only a previous calendar day can be assessed.");
    }

    // Do not assess a date before registration.
    const registrationDate = new Date(
      user.createdAt + nigeriaOffset
    );
    const registrationKey = [
      registrationDate.getUTCFullYear(),
      String(registrationDate.getUTCMonth() + 1).padStart(2, "0"),
      String(registrationDate.getUTCDate()).padStart(2, "0"),
    ].join("-");

    if (args.dayKey < registrationKey) {
      throw new Error("This date is before your registration.");
    }

    // Prevent duplicate penalties for this user and date.
    const existingPenalty = await ctx.db
      .query("dailyPenalties")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", user._id).eq("dayKey", args.dayKey)
      )
      .unique();

    if (existingPenalty) {
      return { success: true, alreadyApplied: true };
    }

    // Convert the calendar date into the user's participation day.
    const dayLength = 24 * 60 * 60 * 1000;
    const registrationStart =
      Date.UTC(
        registrationDate.getUTCFullYear(),
        registrationDate.getUTCMonth(),
        registrationDate.getUTCDate()
      ) - nigeriaOffset;

    const targetStart =
      Date.UTC(year, month - 1, day) - nigeriaOffset;

    const participationDay =
      Math.floor((targetStart - registrationStart) / dayLength) + 1;

    // A completed activity day is not a missed day.
    const activity = await ctx.db
      .query("userActivities")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", user._id).eq("day", participationDay)
      )
      .unique();

    if (activity?.status === "completed") {
      throw new Error("This participation day was completed.");
    }

    const now = Date.now();
    const penaltyAmount = 100;

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // A penalty must never make the wallet negative.
    if (!wallet || wallet.balance < penaltyAmount) {
      return {
        success: false,
        insufficientBalance: true,
        message: "Insufficient wallet balance for this penalty.",
      };
    }

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - penaltyAmount,
      updatedAt: now,
    });

    await ctx.db.insert("dailyPenalties", {
      userId: user._id,
      dayKey: args.dayKey,
      amount: penaltyAmount,
      reason: `Missed participation day ${participationDay}`,
      createdAt: now,
    });

    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      type: "withdrawal",
      amount: -penaltyAmount,
      description: `Missed-day penalty for ${args.dayKey}`,
      reference: `PENALTY-${user._id}-${args.dayKey}`,
      createdAt: now,
    });

    return {
      success: true,
      alreadyApplied: false,
      amount: penaltyAmount,
    };
  },
});
