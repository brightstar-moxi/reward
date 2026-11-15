import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authenticateAdmin } from "./adminSubmissions";

export const DEFAULT_PLATFORM_SETTINGS = {
  totalJourneyDays: 100,
  withdrawalQualificationDays: 30,
  referralQualificationDays: 30,
  requiredReferrals: 10,
  minimumWithdrawal: 10_000,
};

async function getSettings(ctx: any) {
  const settings = await ctx.db.query("platformSettings").first();

  return settings
    ? {
        totalJourneyDays: settings.totalJourneyDays,
        withdrawalQualificationDays: settings.withdrawalQualificationDays,
        referralQualificationDays: settings.referralQualificationDays,
        requiredReferrals: settings.requiredReferrals,
        minimumWithdrawal: settings.minimumWithdrawal,
      }
    : DEFAULT_PLATFORM_SETTINGS;
}

// Public settings used by platform features.
export const getPublicSettings = query({
  args: {},

  handler: async (ctx) => {
    return await getSettings(ctx);
  },
});

// Settings available to administrators.
export const getAdminSettings = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    return await getSettings(ctx);
  },
});

// Update platform settings.
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

    const values = [
      args.totalJourneyDays,
      args.withdrawalQualificationDays,
      args.referralQualificationDays,
      args.requiredReferrals,
      args.minimumWithdrawal,
    ];

    if (
      values.some(
        (value) => !Number.isInteger(value) || value <= 0
      )
    ) {
      throw new Error("All settings must be positive whole numbers.");
    }

    if (
      args.totalJourneyDays < args.withdrawalQualificationDays ||
      args.totalJourneyDays < args.referralQualificationDays
    ) {
      throw new Error(
        "Journey days cannot be less than qualification requirements."
      );
    }

    const existing = await ctx.db
      .query("platformSettings")
      .first();

    const settings = {
      totalJourneyDays: args.totalJourneyDays,
      withdrawalQualificationDays: args.withdrawalQualificationDays,
      referralQualificationDays: args.referralQualificationDays,
      requiredReferrals: args.requiredReferrals,
      minimumWithdrawal: args.minimumWithdrawal,
      updatedAt: Date.now(),
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