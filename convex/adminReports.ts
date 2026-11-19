
import { query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

export const getOverview = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    // Fetch platform records
    const users = await ctx.db.query("users").collect();
    const tasks = await ctx.db.query("tasks").collect();
    const submissions = await ctx.db.query("taskSubmissions").collect();
    const wallets = await ctx.db.query("wallets").collect();
    const transactions = await ctx.db.query("walletTransactions").collect();
    const withdrawals = await ctx.db.query("withdrawals").collect();

    // Exclude admin accounts from user statistics
    const regularUsers = users.filter(
      (user) => user.role === "user"
    );

    const activeUsers = regularUsers.filter(
      (user) => user.status === "active"
    );

    const suspendedUsers = regularUsers.filter(
      (user) => user.status === "suspended"
    );

    // Referral statistics
    const referredUsers = regularUsers.filter(
      (user) => Boolean(user.referredBy)
    );

    // Task statistics
    const activeTasks = tasks.filter(
      (task) => task.isActive
    );

    // Submission statistics
    const pendingSubmissions = submissions.filter(
      (item) => item.status === "pending"
    );

    const approvedSubmissions = submissions.filter(
      (item) => item.status === "approved"
    );

    const rejectedSubmissions = submissions.filter(
      (item) => item.status === "rejected"
    );

    // Exclude test transactions from financial reports
    const realTransactions = transactions.filter(
      (transaction) => transaction.isTest !== true
    );

    const rewardTransactions = realTransactions.filter(
      (transaction) => transaction.type === "reward"
    );

    const totalRewardsIssued = rewardTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    // Wallet statistics
    const totalWalletBalance = wallets.reduce(
      (total, wallet) => total + wallet.balance,
      0
    );

    const totalEarned = wallets.reduce(
      (total, wallet) => total + wallet.totalEarned,
      0
    );

    // Withdrawal statistics
    const pendingWithdrawals = withdrawals.filter(
      (item) => item.status === "pending"
    );

    const processingWithdrawals = withdrawals.filter(
      (item) => item.status === "processing"
    );

    const paidWithdrawals = withdrawals.filter(
      (item) => item.status === "paid"
    );

    const rejectedWithdrawals = withdrawals.filter(
      (item) => item.status === "rejected"
    );

    const totalWithdrawn = paidWithdrawals.reduce(
      (total, item) => total + item.amount,
      0
    );

    return {
      users: {
        total: regularUsers.length,
        active: activeUsers.length,
        suspended: suspendedUsers.length,
        referred: referredUsers.length,
      },

      tasks: {
        total: tasks.length,
        active: activeTasks.length,
      },

      submissions: {
        total: submissions.length,
        pending: pendingSubmissions.length,
        approved: approvedSubmissions.length,
        rejected: rejectedSubmissions.length,
      },

      rewards: {
        totalIssued: totalRewardsIssued,
        transactions: rewardTransactions.length,
      },

      wallets: {
        total: wallets.length,
        totalBalance: totalWalletBalance,
        totalEarned,
      },

      withdrawals: {
        total: withdrawals.length,
        pending: pendingWithdrawals.length,
        processing: processingWithdrawals.length,
        paid: paidWithdrawals.length,
        rejected: rejectedWithdrawals.length,
        totalPaid: totalWithdrawn,
      },
    };
  },
});



export const getReferralReport = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    // Read central platform settings
    const settings = await ctx.db
      .query("platformSettings")
      .first();

    const qualificationDays =
      settings?.referralQualificationDays ?? 30;

    const requiredReferrals =
      settings?.requiredReferrals ?? 10;

    // Get registered users
    const users = await ctx.db
      .query("users")
      .collect();

    const regularUsers = users.filter(
      (user) => user.role === "user"
    );

    const referredUsers = regularUsers.filter(
      (user) => Boolean(user.referredBy)
    );

    // Check each referred user's qualification
    const referralResults = await Promise.all(
      referredUsers.map(async (user) => {
        const activities = await ctx.db
          .query("userActivities")
          .withIndex("by_user", (q) =>
            q.eq("userId", user._id)
          )
          .collect();

        const completedDays = activities.filter(
          (activity) => activity.status === "completed"
        ).length;

        const qualified =
          user.status === "active" &&
          completedDays >= qualificationDays;

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          referredBy: user.referredBy,
          status: user.status,
          completedDays,
          qualified,
        };
      })
    );

    // Group referrals by their referrer's referral code
    const referrerResults = await Promise.all(
      regularUsers.map(async (referrer) => {
        const referrals = referralResults.filter(
          (referral) =>
            referral.referredBy === referrer.referralCode
        );

        const qualifiedCount = referrals.filter(
          (referral) => referral.qualified
        ).length;

        return {
          userId: referrer._id,
          name: referrer.name,
          email: referrer.email,
          referralCode: referrer.referralCode,
          totalReferrals: referrals.length,
          qualifiedReferrals: qualifiedCount,
          unqualifiedReferrals:
            referrals.length - qualifiedCount,
          meetsReferralRequirement:
            referrer.status === "active" &&
            qualifiedCount >= requiredReferrals,
        };
      })
    );

    const activeReferrers = referrerResults.filter(
      (referrer) => referrer.totalReferrals > 0
    );

    const qualifiedReferrals = referralResults.filter(
      (referral) => referral.qualified
    );

    return {
      summary: {
        totalReferred: referredUsers.length,
        qualified: qualifiedReferrals.length,
        unqualified:
          referredUsers.length - qualifiedReferrals.length,
        totalReferrers: activeReferrers.length,
        qualifiedReferrers: activeReferrers.filter(
          (referrer) => referrer.meetsReferralRequirement
        ).length,
        qualificationDays,
        requiredReferrals,
      },

      topReferrers: activeReferrers
        .sort(
          (a, b) =>
            b.qualifiedReferrals - a.qualifiedReferrals
        )
        .slice(0, 10),

      referralDetails: referralResults,
    };
  },
});


export const getTaskPerformanceReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [tasks, submissions, transactions] = await Promise.all([
      ctx.db.query("tasks").collect(),
      ctx.db.query("taskSubmissions").collect(),
      ctx.db.query("walletTransactions").collect(),
    ]);

    const rewardTransactions = transactions.filter(
      (transaction) =>
        transaction.type === "reward" &&
        transaction.isTest !== true
    );

    const taskResults = tasks.map((task) => {
      const taskSubmissions = submissions.filter(
        (submission) => submission.taskId === task._id
      );

      const approved = taskSubmissions.filter(
        (submission) => submission.status === "approved"
      ).length;

      const pending = taskSubmissions.filter(
        (submission) => submission.status === "pending"
      ).length;

      const rejected = taskSubmissions.filter(
        (submission) => submission.status === "rejected"
      ).length;

      const totalRewards = rewardTransactions
        .filter((transaction) => transaction.taskId === task._id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        taskId: task._id,
        title: task.title,
        day: task.day,
        reward: task.reward,
        isActive: task.isActive,
        totalSubmissions: taskSubmissions.length,
        approved,
        pending,
        rejected,
        totalRewards,
      };
    });

    return {
      summary: {
        totalTasks: tasks.length,
        activeTasks: tasks.filter((task) => task.isActive).length,
        inactiveTasks: tasks.filter((task) => !task.isActive).length,
        totalSubmissions: submissions.length,
        approved: submissions.filter(
          (submission) => submission.status === "approved"
        ).length,
        pending: submissions.filter(
          (submission) => submission.status === "pending"
        ).length,
        rejected: submissions.filter(
          (submission) => submission.status === "rejected"
        ).length,
        totalRewardsPaid: rewardTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        ),
      },

      tasks: taskResults.sort(
        (a, b) => b.approved - a.approved
      ),
    };
  },
});



export const getWithdrawalReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const withdrawals = await ctx.db
      .query("withdrawals")
      .collect();

    const users = await ctx.db
      .query("users")
      .collect();

    const userMap = new Map(
      users.map((user) => [user._id, user])
    );

    const totalRequested = withdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amount,
      0
    );

    const totalPaid = withdrawals
      .filter((withdrawal) => withdrawal.status === "paid")
      .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    const totalPending = withdrawals
      .filter((withdrawal) => withdrawal.status === "pending")
      .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    const totalProcessing = withdrawals
      .filter((withdrawal) => withdrawal.status === "processing")
      .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    const totalRejected = withdrawals
      .filter((withdrawal) => withdrawal.status === "rejected")
      .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    const withdrawalDetails = withdrawals
      .map((withdrawal) => {
        const user = userMap.get(withdrawal.userId);

        return {
          id: withdrawal._id,
          userName: user?.name ?? "Unknown User",
          userEmail: user?.email ?? "Unknown Email",
          amount: withdrawal.amount,
          status: withdrawal.status,
          bankName: withdrawal.bankName,
          accountName: withdrawal.accountName,
          accountNumber: withdrawal.accountNumber,
          paymentReference: withdrawal.paymentReference,
          requestedAt: withdrawal.requestedAt,
          paidAt: withdrawal.paidAt,
        };
      })
      .sort((a, b) => b.requestedAt - a.requestedAt);

    return {
      summary: {
        totalRequests: withdrawals.length,
        pending: withdrawals.filter((w) => w.status === "pending").length,
        processing: withdrawals.filter((w) => w.status === "processing").length,
        paid: withdrawals.filter((w) => w.status === "paid").length,
        rejected: withdrawals.filter((w) => w.status === "rejected").length,
        totalRequested,
        totalPaid,
        totalPending,
        totalProcessing,
        totalRejected,
        averageWithdrawal:
          withdrawals.length > 0
            ? Math.round(totalRequested / withdrawals.length)
            : 0,
      },
      withdrawals: withdrawalDetails,
    };
  },
});




export const getWalletReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [wallets, transactions, users] = await Promise.all([
      ctx.db.query("wallets").collect(),
      ctx.db.query("walletTransactions").collect(),
      ctx.db.query("users").collect(),
    ]);

    // Exclude test transactions from financial totals.
    const realTransactions = transactions.filter(
      (transaction) => transaction.isTest !== true
    );

    const userMap = new Map(
      users.map((user) => [user._id, user])
    );

    const calculateTotal = (type: string) =>
      realTransactions
        .filter((transaction) => transaction.type === type)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const countType = (type: string) =>
      realTransactions.filter(
        (transaction) => transaction.type === type
      ).length;

    const recentTransactions = realTransactions
      .map((transaction) => {
        const user = userMap.get(transaction.userId);

        return {
          id: transaction._id,
          userName: user?.name ?? "Unknown User",
          userEmail: user?.email ?? "Unknown Email",
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          reference: transaction.reference,
          createdAt: transaction.createdAt,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100);

    return {
      summary: {
        totalWallets: wallets.length,

        totalBalance: wallets.reduce(
          (sum, wallet) => sum + wallet.balance,
          0
        ),

        totalEarned: wallets.reduce(
          (sum, wallet) => sum + wallet.totalEarned,
          0
        ),

        totalWithdrawn: wallets.reduce(
          (sum, wallet) => sum + wallet.totalWithdrawn,
          0
        ),

        totalTransactions: realTransactions.length,

        rewards: {
          count: countType("reward"),
          amount: calculateTotal("reward"),
        },

        withdrawals: {
          count: countType("withdrawal"),
          amount: calculateTotal("withdrawal"),
        },

        penalties: {
          count: countType("penalty"),
          amount: calculateTotal("penalty"),
        },

        refunds: {
          count: countType("refund"),
          amount: calculateTotal("refund"),
        },
      },

      recentTransactions,
    };
  },
});
