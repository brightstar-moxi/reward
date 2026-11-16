
import { v } from "convex/values";
import { query } from "./_generated/server";
import { authenticateAdmin } from "./adminSubmissions";

/**
 * Get platform-wide wallet statistics.
 */
export const getWalletOverview = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const wallets = await ctx.db
      .query("wallets")
      .collect();

    return {
      totalWallets: wallets.length,

      totalBalance: wallets.reduce(
        (total, wallet) => total + wallet.balance,
        0
      ),

      totalEarned: wallets.reduce(
        (total, wallet) => total + wallet.totalEarned,
        0
      ),

      totalWithdrawn: wallets.reduce(
        (total, wallet) => total + wallet.totalWithdrawn,
        0
      ),
    };
  },
});

/**
 * Get all users and their wallet information.
 */
export const getAllWallets = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [users, wallets] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("wallets").collect(),
    ]);

    const walletMap = new Map(
      wallets.map((wallet) => [
        wallet.userId.toString(),
        wallet,
      ])
    );

    return users.map((user) => {
      const wallet = walletMap.get(user._id.toString());

      return {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userStatus: user.status,

        balance: wallet?.balance ?? 0,
        totalEarned: wallet?.totalEarned ?? 0,
        totalWithdrawn: wallet?.totalWithdrawn ?? 0,

        walletExists: Boolean(wallet),
        updatedAt: wallet?.updatedAt ?? null,
      };
    });
  },
});
