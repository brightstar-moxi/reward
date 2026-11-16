
// import { query } from "./_generated/server";
// import { v } from "convex/values";
// import { authenticateAdmin } from "./adminSubmissions";

// export const getAllRewards = query({
//   args: {
//     token: v.string(),
//   },

//   handler: async (ctx, args) => {
//     await authenticateAdmin(ctx, args.token);

//     const transactions = await ctx.db
//       .query("walletTransactions")
//       .withIndex("by_user")
//       .collect();

//     const rewards = transactions
//       .filter((transaction) => transaction.type === "reward")
//       .sort((a, b) => b.createdAt - a.createdAt);

//     const results = await Promise.all(
//       rewards.map(async (transaction) => {
//         const user = await ctx.db.get(transaction.userId);

//         const task = transaction.taskId
//           ? await ctx.db.get(transaction.taskId)
//           : null;

//         return {
//           id: transaction._id,
//           userId: transaction.userId,
//           userName: user?.name ?? "Unknown user",
//           userEmail: user?.email ?? "",
//           amount: transaction.amount,
//           description: transaction.description,
//           reference: transaction.reference ?? "",
//           taskTitle: task?.title ?? "Unavailable task",
//           taskDay: task?.day ?? null,
//           createdAt: transaction.createdAt,
//         };
//       })
//     );

//     return {
//       totalRewards: rewards.reduce(
//         (total, transaction) => total + transaction.amount,
//         0
//       ),
//       totalTransactions: rewards.length,
//       rewards: results,
//     };
//   },
// });





import { query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

export const getAllRewards = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    // Retrieve only reward transactions.
    const rewards = await ctx.db
      .query("walletTransactions")
      .withIndex("by_type", (q) => q.eq("type", "reward"))
      .collect();

    rewards.sort((a, b) => b.createdAt - a.createdAt);

 const genuineRewards = rewards
  .filter((transaction) => transaction.isTest !== true)
  .sort((a, b) => b.createdAt - a.createdAt);

const results = await Promise.all(
  genuineRewards.map(async (transaction) => {
    const user = await ctx.db.get(transaction.userId);

    const task = transaction.taskId
      ? await ctx.db.get(transaction.taskId)
      : null;

    return {
      id: transaction._id,
      userId: transaction.userId,
      userName: user?.name ?? "Unknown user",
      userEmail: user?.email ?? "",
      amount: transaction.amount,
      description: transaction.description,
      reference: transaction.reference ?? "",
      taskTitle: task?.title ?? "Unavailable task",
      taskDay: task?.day ?? null,
      createdAt: transaction.createdAt,
    };
  })
);

return {
  totalRewards: genuineRewards.reduce(
    (total, transaction) => total + transaction.amount,
    0
  ),
  totalTransactions: genuineRewards.length,
  rewards: results,
};
  },
});
