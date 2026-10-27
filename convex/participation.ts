
import { v } from "convex/values";
import { query } from "./_generated/server";

// Nigeria uses UTC+1 throughout the year.
const NIGERIA_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function nigeriaDayStart(timestamp: number): number {
  const shifted = new Date(timestamp + NIGERIA_OFFSET_MS);

  return (
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate()
    ) - NIGERIA_OFFSET_MS
  );
}

function nigeriaDateKey(timestamp: number): string {
  return new Date(timestamp + NIGERIA_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

async function getSessionUser(ctx: any, token: string) {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);

  const tokenHash = Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token_hash", (q: any) =>
      q.eq("tokenHash", tokenHash)
    )
    .unique();

  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }

  const user = await ctx.db.get(session.userId);

  if (!user || user.status !== "active") {
    return null;
  }

  return user;
}

export const getMyParticipation = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx, args.token);

    if (!user) {
      throw new Error("Your session is invalid or expired.");
    }

    const todayStart = nigeriaDayStart(Date.now());
    const registrationDayStart = nigeriaDayStart(user.createdAt);

    const elapsedDays = Math.floor(
      (todayStart - registrationDayStart) / DAY_MS
    );

    const currentDay = Math.min(
      100,
      Math.max(1, elapsedDays + 1)
    );

    return {
      currentDay,
      totalDays: 100,
      registrationDate: nigeriaDateKey(user.createdAt),
      todayDate: nigeriaDateKey(Date.now()),
      completedCalendarDays: currentDay - 1,
      isDay100: currentDay === 100,
    };
  },
});

export const getMyDailyEarnings = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx, args.token);

    if (!user) {
      throw new Error("Your session is invalid or expired.");
    }

    const todayStart = nigeriaDayStart(Date.now());
    const registrationDayStart = nigeriaDayStart(user.createdAt);

    const currentDay = Math.min(
      100,
      Math.max(
        1,
        Math.floor(
          (todayStart - registrationDayStart) / DAY_MS
        ) + 1
      )
    );

    const transactions = await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q: any) =>
        q.eq("userId", user._id)
      )
      .order("desc")
      .collect();

    const dailyTotals = new Map<
      string,
      { amount: number; transactionCount: number }
    >();

    for (const transaction of transactions) {
      if (transaction.type !== "reward") continue;

      const date = nigeriaDateKey(transaction.createdAt);
      const existing = dailyTotals.get(date) ?? {
        amount: 0,
        transactionCount: 0,
      };

      existing.amount += transaction.amount;
      existing.transactionCount += 1;

      dailyTotals.set(date, existing);
    }

    const days = Array.from(
      { length: currentDay },
      (_, index) => {
        const dayNumber = index + 1;
        const dateTimestamp =
          registrationDayStart + index * DAY_MS;
        const date = nigeriaDateKey(dateTimestamp);
        const totals = dailyTotals.get(date);

        return {
          dayNumber,
          date,
          earnings: totals?.amount ?? 0,
          approvedRewardCount:
            totals?.transactionCount ?? 0,
          isToday: dayNumber === currentDay,
        };
      }
    ).reverse();

    return {
      currentDay,
      totalEarned: days.reduce(
        (total, day) => total + day.earnings,
        0
      ),
      days,
    };
  },
});
