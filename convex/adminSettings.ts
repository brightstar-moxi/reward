
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

const DEFAULT_SETTINGS = {
  totalJourneyDays: 100,
  withdrawalQualificationDays: 30,
  referralQualificationDays: 30,
  requiredReferrals: 10,
  minimumWithdrawal: 10000,
};

export const getSettings = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const settings = await ctx.db
      .query("platformSettings")
      .first();

    return settings ?? DEFAULT_SETTINGS;
  },
});

export const updateSettings = mutation({
  args: {
    token: v.string(),
    totalJourneyDays: v.number(),
    withdrawalQualificationDays: v.number(),
    referralQualificationDays: v.number(),
    requiredReferrals: v.number(),
    minimumWithdrawal: v.number(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const {
      token,
      totalJourneyDays,
      withdrawalQualificationDays,
      referralQualificationDays,
      requiredReferrals,
      minimumWithdrawal,
    } = args;

    const values = [
      totalJourneyDays,
      withdrawalQualificationDays,
      referralQualificationDays,
      requiredReferrals,
      minimumWithdrawal,
    ];

    if (
      values.some(
        (value) => !Number.isSafeInteger(value) || value <= 0
      )
    ) {
      throw new Error("All settings must be positive whole numbers.");
    }

    if (
      withdrawalQualificationDays > totalJourneyDays ||
      referralQualificationDays > totalJourneyDays
    ) {
      throw new Error(
        "Qualification days cannot exceed total journey days."
      );
    }

    const existing = await ctx.db
      .query("platformSettings")
      .first();

    const updatedAt = Date.now();

    const settings = {
      totalJourneyDays,
      withdrawalQualificationDays,
      referralQualificationDays,
      requiredReferrals,
      minimumWithdrawal,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, settings);
    } else {
      await ctx.db.insert("platformSettings", settings);
    }

    return {
      success: true,
      settings,
    };
  },
});
