
import { query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

export const getAllReferrals = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    // Retrieve users and activity records.
    const users = await ctx.db.query("users").collect();
    const activities = await ctx.db.query("userActivities").collect();

    // Build a lookup for users by their referral code.
    const usersByReferralCode = new Map(
      users.map((user) => [user.referralCode, user])
    );

    // Count unique completed days for each user.
    const completedDaysByUser = new Map<string, Set<number>>();

    for (const activity of activities) {
      if (activity.status !== "completed") {
        continue;
      }

      const userId = activity.userId.toString();

      if (!completedDaysByUser.has(userId)) {
        completedDaysByUser.set(userId, new Set());
      }

      completedDaysByUser.get(userId)!.add(activity.day);
    }

    // Group referred users by the referral code they used.
    const referralsByCode = new Map<string, typeof users>();

    for (const user of users) {
      if (user.role !== "user" || !user.referredBy) {
        continue;
      }

      const code = user.referredBy;

      if (!referralsByCode.has(code)) {
        referralsByCode.set(code, []);
      }

      referralsByCode.get(code)!.push(user);
    }

    const referralGroups = [];

    for (const [referralCode, referredUsers] of referralsByCode) {
      const referrer = usersByReferralCode.get(referralCode);

      const referralDetails = referredUsers.map((user) => {
        const completedDays =
          completedDaysByUser.get(user._id.toString())?.size ?? 0;

        const qualified =
          user.status === "active" && completedDays >= 10;

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          completedDays,
          qualified,
          joinedAt: user.createdAt,
        };
      });

      referralGroups.push({
        referrerId: referrer?._id ?? null,
        referrerName: referrer?.name ?? "Unknown referrer",
        referrerEmail: referrer?.email ?? "",
        referralCode,
        totalReferrals: referralDetails.length,
        activeReferrals: referralDetails.filter(
          (referral) => referral.status === "active"
        ).length,
        qualifiedReferrals: referralDetails.filter(
          (referral) => referral.qualified
        ).length,
        referrals: referralDetails.sort(
          (a, b) => b.joinedAt - a.joinedAt
        ),
      });
    }

    referralGroups.sort(
      (a, b) => b.totalReferrals - a.totalReferrals
    );

    const allReferrals = referralGroups.flatMap(
      (group) => group.referrals
    );

    return {
      totalReferrers: referralGroups.length,
      totalReferrals: allReferrals.length,
      activeReferrals: allReferrals.filter(
        (referral) => referral.status === "active"
      ).length,
      qualifiedReferrals: allReferrals.filter(
        (referral) => referral.qualified
      ).length,
      referralGroups,
    };
  },
});
