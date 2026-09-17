import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMyReferrals = query({
  args: {
    referralCode: v.string(),
  },

  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("users")
      .withIndex("by_referred_by", (q) =>
        q.eq("referredBy", args.referralCode)
      )
      .collect();

    return referrals.map((user) => ({
      id: user._id,
      name: user.name,
      status: user.status,
      createdAt: user.createdAt,
    }));
  },
});