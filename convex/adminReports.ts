
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




export const getUserActivityReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [users, activities, settings] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("userActivities").collect(),
      ctx.db.query("platformSettings").first(),
    ]);

    const regularUsers = users.filter(
      (user) => user.role === "user"
    );

    const journeyDays = settings?.totalJourneyDays ?? 100;

    const userResults = regularUsers.map((user) => {
      const userRecords = activities.filter(
        (activity) => activity.userId === user._id
      );

      const completedDays = userRecords.filter(
        (activity) => activity.status === "completed"
      ).length;

      const started = userRecords.length > 0;

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        completedDays,
        started,
        progressPercentage: Math.min(
          100,
          Math.round((completedDays / journeyDays) * 100)
        ),
        completedJourney: completedDays >= journeyDays,
      };
    });

    const startedUsers = userResults.filter(
      (user) => user.started
    );

    const completedUsers = userResults.filter(
      (user) => user.completedJourney
    );

    const totalCompletedDays = userResults.reduce(
      (sum, user) => sum + user.completedDays,
      0
    );

    return {
      summary: {
        totalUsers: regularUsers.length,
        activeUsers: regularUsers.filter(
          (user) => user.status === "active"
        ).length,
        suspendedUsers: regularUsers.filter(
          (user) => user.status === "suspended"
        ).length,
        startedUsers: startedUsers.length,
        usersNotStarted: regularUsers.length - startedUsers.length,
        totalCompletedDays,
        averageCompletedDays:
          regularUsers.length > 0
            ? Math.round(totalCompletedDays / regularUsers.length)
            : 0,
        completedJourney: completedUsers.length,
        journeyDays,
      },

      topUsers: userResults
        .sort((a, b) => b.completedDays - a.completedDays)
        .slice(0, 20),
    };
  },
});



export const getSubmissionReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [submissions, users, tasks] = await Promise.all([
      ctx.db.query("taskSubmissions").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("tasks").collect(),
    ]);

    const userMap = new Map(
      users.map((user) => [user._id, user])
    );

    const taskMap = new Map(
      tasks.map((task) => [task._id, task])
    );

    const total = submissions.length;
    const pending = submissions.filter(
      (item) => item.status === "pending"
    ).length;
    const approved = submissions.filter(
      (item) => item.status === "approved"
    ).length;
    const rejected = submissions.filter(
      (item) => item.status === "rejected"
    ).length;

    const reviewed = approved + rejected;

    return {
      summary: {
        total,
        pending,
        approved,
        rejected,
        approvalRate:
          reviewed > 0
            ? Math.round((approved / reviewed) * 100)
            : 0,
        rejectionRate:
          reviewed > 0
            ? Math.round((rejected / reviewed) * 100)
            : 0,
      },

      recentSubmissions: submissions
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 100)
        .map((submission) => {
          const user = userMap.get(submission.userId);
          const task = taskMap.get(submission.taskId);

          return {
            id: submission._id,
            userName: user?.name ?? "Unknown User",
            userEmail: user?.email ?? "Unknown Email",
            taskTitle: task?.title ?? "Deleted Task",
            status: submission.status,
            submittedAt: submission.submittedAt,
            reviewedAt: submission.reviewedAt,
            adminNote: submission.adminNote,
          };
        }),
    };
  },
});



export const getDailyActivityReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [activities, users, settings] = await Promise.all([
      ctx.db.query("userActivities").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("platformSettings").first(),
    ]);

    const regularUsers = users.filter(
      (user) => user.role === "user"
    );

    const journeyDays = settings?.totalJourneyDays ?? 100;

    const completed = activities.filter(
      (activity) => activity.status === "completed"
    ).length;

    const inProgress = activities.filter(
      (activity) => activity.status === "in_progress"
    ).length;

    const available = activities.filter(
      (activity) => activity.status === "available"
    ).length;

    const total = activities.length;

    const dailyBreakdown = Array.from(
      { length: journeyDays },
      (_, index) => {
        const day = index + 1;

        const dayActivities = activities.filter(
          (activity) => activity.day === day
        );

        const dayCompleted = dayActivities.filter(
          (activity) => activity.status === "completed"
        ).length;

        return {
          day,
          total: dayActivities.length,
          completed: dayCompleted,
          inProgress: dayActivities.filter(
            (activity) => activity.status === "in_progress"
          ).length,
          available: dayActivities.filter(
            (activity) => activity.status === "available"
          ).length,
          completionRate:
            dayActivities.length > 0
              ? Math.round(
                  (dayCompleted / dayActivities.length) * 100
                )
              : 0,
        };
      }
    );

    return {
      summary: {
        totalUsers: regularUsers.length,
        total,
        completed,
        inProgress,
        available,
        completionRate:
          total > 0
            ? Math.round((completed / total) * 100)
            : 0,
        journeyDays,
      },

      dailyBreakdown,
    };
  },
});



export const getUserGrowthReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const users = await ctx.db.query("users").collect();

    // Exclude admin accounts from user growth statistics.
    const regularUsers = users.filter(
      (user) => user.role === "user"
    );

    // Use Nigeria time (UTC+1).
    const now = Date.now();
    const nigeriaNow = new Date(now + 60 * 60 * 1000);

    const todayStart = Date.UTC(
      nigeriaNow.getUTCFullYear(),
      nigeriaNow.getUTCMonth(),
      nigeriaNow.getUTCDate()
    ) - 60 * 60 * 1000;

    const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

    const monthStart = Date.UTC(
      nigeriaNow.getUTCFullYear(),
      nigeriaNow.getUTCMonth(),
      1
    ) - 60 * 60 * 1000;

    const todayUsers = regularUsers.filter(
      (user) =>
        user.createdAt >= todayStart &&
        user.createdAt < tomorrowStart
    );

    const monthUsers = regularUsers.filter(
      (user) => user.createdAt >= monthStart
    );

    const activeUsers = regularUsers.filter(
      (user) => user.status === "active"
    );

    const suspendedUsers = regularUsers.filter(
      (user) => user.status === "suspended"
    );

    // Registration history for the last 30 days.
    const dailyRegistrations = Array.from(
      { length: 30 },
      (_, index) => {
        const dayStart =
          todayStart - (29 - index) * 24 * 60 * 60 * 1000;

        const nextDayStart = dayStart + 24 * 60 * 60 * 1000;

        const count = regularUsers.filter(
          (user) =>
            user.createdAt >= dayStart &&
            user.createdAt < nextDayStart
        ).length;

        return {
          date: new Date(dayStart).toISOString().slice(0, 10),
          registrations: count,
        };
      }
    );

    return {
      summary: {
        totalUsers: regularUsers.length,
        registrationsToday: todayUsers.length,
        registrationsThisMonth: monthUsers.length,
        activeUsers: activeUsers.length,
        suspendedUsers: suspendedUsers.length,
      },

      dailyRegistrations,

      recentUsers: [...regularUsers]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50)
        .map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
        })),
    };
  },
});




export const getRewardDistributionReport = query({
  args: { token: v.string() },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const [transactions, users, tasks] = await Promise.all([
      ctx.db.query("walletTransactions").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("tasks").collect(),
    ]);

    // Exclude test transactions and keep reward payments only.
    const rewards = transactions.filter(
      (transaction) =>
        transaction.type === "reward" &&
        transaction.isTest !== true
    );

    const userMap = new Map(
      users.map((user) => [user._id, user])
    );

    const taskMap = new Map(
      tasks.map((task) => [task._id, task])
    );

    const totalRewards = rewards.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const recentRewards = rewards.filter(
      (transaction) => transaction.createdAt >= thirtyDaysAgo
    );

    const recentRewardsTotal = recentRewards.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Group reward payments by task.
    const taskDistribution = new Map<
      string,
      { taskId: string; taskTitle: string; count: number; amount: number }
    >();

    for (const transaction of rewards) {
      const taskId = transaction.taskId
        ? String(transaction.taskId)
        : "other";

      const existing = taskDistribution.get(taskId);

      if (existing) {
        existing.count += 1;
        existing.amount += transaction.amount;
      } else {
        const task = transaction.taskId
          ? taskMap.get(transaction.taskId)
          : undefined;

        taskDistribution.set(taskId, {
          taskId,
          taskTitle: task?.title ?? "Other Rewards",
          count: 1,
          amount: transaction.amount,
        });
      }
    }

    return {
      summary: {
        totalRewards,
        totalTransactions: rewards.length,
        averageReward:
          rewards.length > 0
            ? Math.round(totalRewards / rewards.length)
            : 0,
        rewardsLast30Days: recentRewardsTotal,
        transactionsLast30Days: recentRewards.length,
      },

      taskDistribution: Array.from(taskDistribution.values()).sort(
        (a, b) => b.amount - a.amount
      ),

      recentPayments: [...rewards]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50)
        .map((transaction) => {
          const user = userMap.get(transaction.userId);
          const task = transaction.taskId
            ? taskMap.get(transaction.taskId)
            : undefined;

          return {
            id: transaction._id,
            userName: user?.name ?? "Unknown User",
            userEmail: user?.email ?? "Unknown Email",
            taskTitle: task?.title ?? transaction.description,
            amount: transaction.amount,
            description: transaction.description,
            createdAt: transaction.createdAt,
          };
        }),
    };
  },
});
