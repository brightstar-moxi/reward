// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// export const getPending = query({
//   args: {
//     token: v.string(),
//   },

//   handler: async (ctx, args) => {
//     const tokenHash = await hashToken(args.token);

//     const session = await ctx.db
//       .query("sessions")
//       .withIndex("by_token_hash", (q) =>
//         q.eq("tokenHash", tokenHash)
//       )
//       .unique();

//     if (!session) {
//       throw new Error(
//         "You are not authenticated."
//       );
//     }

//     if (session.expiresAt < Date.now()) {
//       throw new Error(
//         "Your session has expired."
//       );
//     }

//     const admin = await ctx.db.get(
//       session.userId
//     );

//     if (!admin || admin.status !== "active") {
//       throw new Error(
//         "Your account is not active."
//       );
//     }

//     if (admin.role !== "admin") {
//       throw new Error(
//         "Admin access required."
//       );
//     }

//     const submissions = await ctx.db
//       .query("taskSubmissions")
//       .withIndex("by_status", (q) =>
//         q.eq("status", "pending")
//       )
//       .collect();

//     return await Promise.all(
//       submissions.map(async (submission) => {
//         const user = await ctx.db.get(
//           submission.userId
//         );

//         const task = await ctx.db.get(
//           submission.taskId
//         );

//         return {
//           id: submission._id,
//           status: submission.status,
//           submittedAt:
//             submission.submittedAt,

//           user: user
//             ? {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//               }
//             : null,

//           task: task
//             ? {
//                 id: task._id,
//                 title: task.title,
//                 reward: task.reward,
//                 day: task.day,
//               }
//             : null,

//           proofStorageId:
//             submission.proofStorageId,
//         };
//       })
//     );
//   },
// });



// export const getProofUrl = query({
//   args: {
//     token: v.string(),
//     storageId: v.id("_storage"),
//   },

//   handler: async (ctx, args) => {
//     const tokenHash = await hashToken(args.token);

//     const session = await ctx.db
//       .query("sessions")
//       .withIndex("by_token_hash", (q) =>
//         q.eq("tokenHash", tokenHash)
//       )
//       .unique();

//     if (!session) {
//       throw new Error(
//         "You are not authenticated."
//       );
//     }

//     if (session.expiresAt < Date.now()) {
//       throw new Error(
//         "Your session has expired."
//       );
//     }

//     const admin = await ctx.db.get(
//       session.userId
//     );

//     if (
//       !admin ||
//       admin.status !== "active"
//     ) {
//       throw new Error(
//         "Your account is not active."
//       );
//     }

//     if (admin.role !== "admin") {
//       throw new Error(
//         "Admin access required."
//       );
//     }

//     const url = await ctx.storage.getUrl(
//       args.storageId
//     );

//     return {
//       url,
//     };
//   },
// });



// export const approve = mutation({
//   args: {
//     token: v.string(),
//     submissionId: v.id("taskSubmissions"),
//   },

//   handler: async (ctx, args) => {
//     // 1. Authenticate admin
//     const tokenHash = await hashToken(args.token);

//     const session = await ctx.db
//       .query("sessions")
//       .withIndex("by_token_hash", (q) =>
//         q.eq("tokenHash", tokenHash)
//       )
//       .unique();

//     if (!session) {
//       throw new Error(
//         "You are not authenticated."
//       );
//     }

//     if (session.expiresAt < Date.now()) {
//       throw new Error(
//         "Your session has expired."
//       );
//     }

//     // 2. Get admin
//     const admin = await ctx.db.get(
//       session.userId
//     );

//     if (
//       !admin ||
//       admin.status !== "active"
//     ) {
//       throw new Error(
//         "Your account is not active."
//       );
//     }

//     if (admin.role !== "admin") {
//       throw new Error(
//         "Admin access required."
//       );
//     }

//     // 3. Get submission
//     const submission = await ctx.db.get(
//       args.submissionId
//     );

//     if (!submission) {
//       throw new Error(
//         "Submission not found."
//       );
//     }

//     // 4. Only pending submissions can be approved
//     if (submission.status !== "pending") {
//       throw new Error(
//         "This submission has already been reviewed."
//       );
//     }

//     // 5. Approve submission
//     await ctx.db.patch(
//       args.submissionId,
//       {
//         status: "approved",
//         reviewedAt: Date.now(),
//         reviewedBy: admin._id,
//       }
//     );

// //     const now = Date.now();

// // await ctx.db.patch(args.submissionId, {
// //   status: "rejected",
// //   adminNote: args.adminNote?.trim() || undefined,
// //   reviewedAt: now,
// //   reviewedBy: admin._id,
// //   rejectedAt: now,
// //   retryAvailableAt: now + 60 * 1000,
// // });

//     return {
//       success: true,
//       status: "approved",
//     };
//   },
// });


// export const reject = mutation({
//   args: {
//     token: v.string(),
//     submissionId: v.id("taskSubmissions"),
//      adminNote: v.optional(v.string()),
//   },

//   handler: async (ctx, args) => {
//     // 1. Authenticate admin
//     const tokenHash = await hashToken(args.token);
// const now = Date.now();

// await ctx.db.patch(
//   args.submissionId,
//   {
//     status: "rejected",

//     adminNote:
//       args.adminNote?.trim() || undefined,

//     reviewedAt: now,

//     reviewedBy: admin._id,

//     rejectedAt: now,

//     retryAvailableAt:
//       now + 60 * 1000,
//   }
// );
//     const session = await ctx.db
//       .query("sessions")
//       .withIndex("by_token_hash", (q) =>
//         q.eq("tokenHash", tokenHash)
//       )
//       .unique();

//     if (!session) {
//       throw new Error(
//         "You are not authenticated."
//       );
//     }

//     if (session.expiresAt < Date.now()) {
//       throw new Error(
//         "Your session has expired."
//       );
//     }

//     // 2. Verify admin
//     const admin = await ctx.db.get(
//       session.userId
//     );

//     if (
//       !admin ||
//       admin.status !== "active"
//     ) {
//       throw new Error(
//         "Your account is not active."
//       );
//     }

//     if (admin.role !== "admin") {
//       throw new Error(
//         "Admin access required."
//       );
//     }

//     // 3. Get submission
//     const submission = await ctx.db.get(
//       args.submissionId
//     );

//     if (!submission) {
//       throw new Error(
//         "Submission not found."
//       );
//     }

//     // 4. Only pending submissions can be rejected
//     if (submission.status !== "pending") {
//       throw new Error(
//         "This submission has already been reviewed."
//       );
//     }

//     // 5. Reject submission
//     // await ctx.db.patch(
//     //   args.submissionId,
//     //   {
//     //     status: "rejected",
//     //     adminNote:
//     //       args.adminNote?.trim() || undefined,
//     //     reviewedAt: Date.now(),
//     //     reviewedBy: admin._id,
//     //   }
//     // );


// const now = Date.now();

// await ctx.db.patch(
//   args.submissionId,
//   {
//     status: "rejected",

//     adminNote:
//       args.adminNote?.trim() || undefined,

//     reviewedAt: now,

//     reviewedBy: admin._id,

//     rejectedAt: now,

//     retryAvailableAt:
//       now + 60 * 1000,
//   }
// );


//     return {
//       success: true,
//       status: "rejected",
//     };
//   },
// });

// async function hashToken(token: string) {
//   const data =
//     new TextEncoder().encode(token);

//   const hash = await crypto.subtle.digest(
//     "SHA-256",
//     data
//   );

//   return Array.from(new Uint8Array(hash))
//     .map((byte) =>
//       byte.toString(16).padStart(2, "0")
//     )
//     .join("");
// }


// export const reviewSubmission = mutation({
//   args: {
//     token: v.string(),

//     submissionId: v.id(
//       "taskSubmissions"
//     ),

//     decision: v.union(
//       v.literal("approved"),
//       v.literal("rejected")
//     ),

//     adminNote: v.optional(v.string()),
//   },

//   handler: async (ctx, args) => {
//     /*
//      * 1. Authenticate admin
//      */

//     const tokenHash = await hashToken(
//       args.token
//     );

//     const session = await ctx.db
//       .query("sessions")
//       .withIndex("by_token_hash", (q) =>
//         q.eq("tokenHash", tokenHash)
//       )
//       .unique();

//     if (!session) {
//       throw new Error(
//         "You are not authenticated."
//       );
//     }

//     if (session.expiresAt < Date.now()) {
//       throw new Error(
//         "Your session has expired."
//       );
//     }

//     const admin = await ctx.db.get(
//       session.userId
//     );

//     if (
//       !admin ||
//       admin.status !== "active"
//     ) {
//       throw new Error(
//         "Your account is not active."
//       );
//     }

//     if (admin.role !== "admin") {
//       throw new Error(
//         "Admin access required."
//       );
//     }

//     /*
//      * 2. Get submission
//      */

//     const submission =
//       await ctx.db.get(
//         args.submissionId
//       );

//     if (!submission) {
//       throw new Error(
//         "Submission not found."
//       );
//     }

//     /*
//      * 3. Prevent reviewing the same
//      *    submission twice.
//      */

//     if (submission.status !== "pending") {
//       throw new Error(
//         "This submission has already been reviewed."
//       );
//     }

//     /*
//      * 4. Get task
//      */

//     const task = await ctx.db.get(
//       submission.taskId
//     );

//     if (!task) {
//       throw new Error(
//         "Task not found."
//       );
//     }

//     const now = Date.now();

//     /*
//      * 5. REJECT
//      */

//     // if (args.decision === "rejected") {
//     //   await ctx.db.patch(
//     //     args.submissionId,
//     //     {
//     //       status: "rejected",
//     //       adminNote: args.adminNote,
//     //       reviewedAt: now,
//     //       reviewedBy: admin._id,
//     //     }
//     //   );

// if (args.decision === "rejected") {
//   await ctx.db.patch(
//     args.submissionId,
//     {
//       status: "rejected",
//       adminNote: args.adminNote?.trim() || undefined,
//       reviewedAt: now,
//       reviewedBy: admin._id,
//       rejectedAt: now,
//       retryAvailableAt: now + 60 * 1000,
//     }
//   );

//       return {
//         success: true,
//         status: "rejected",
//       };
//     }

//     /*
//      * 6. APPROVE
//      */

//     await ctx.db.patch(
//       args.submissionId,
//       {
//         status: "approved",
//         adminNote: args.adminNote,
//         reviewedAt: now,
//         reviewedBy: admin._id,
//       }
//     );

//     /*
//      * 7. Create wallet reward transaction
//      */

//     await ctx.db.insert(
//       "walletTransactions",
//       {
//         userId: submission.userId,

//         type: "reward",

//         amount: task.reward,

//         description:
//           `Day ${task.day} - ${task.title}`,

//         taskId: task._id,

//         submissionId:
//           submission._id,

//         createdAt: now,
//       }
//     );

//     return {
//       success: true,
//       status: "approved",
//       reward: task.reward,
//     };
//   },
// });









import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function authenticateAdmin(ctx: any, token: string) {
  const tokenHash = await hashToken(token);

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token_hash", (q: any) =>
      q.eq("tokenHash", tokenHash)
    )
    .unique();

  if (!session) {
    throw new Error("You are not authenticated.");
  }

  if (session.expiresAt < Date.now()) {
    throw new Error("Your session has expired.");
  }

  const admin = await ctx.db.get(session.userId);

  if (!admin || admin.status !== "active") {
    throw new Error("Your account is not active.");
  }

  if (admin.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return admin;
}

async function creditTaskReward(
  ctx: any,
  submission: any,
  task: any,
  now: number
) {
  if (!Number.isFinite(task.reward) || task.reward <= 0) {
    throw new Error("The task reward must be greater than zero.");
  }

  // Prevent a duplicate reward for this submission.
  const existingTransaction = await ctx.db
    .query("walletTransactions")
    .withIndex("by_submission", (q: any) =>
      q.eq("submissionId", submission._id)
    )
    .unique();

  if (existingTransaction) {
    throw new Error(
      "A reward transaction already exists for this submission."
    );
  }

  // Find the user's wallet.
  let wallet = await ctx.db
    .query("wallets")
    .withIndex("by_user", (q: any) =>
      q.eq("userId", submission.userId)
    )
    .unique();

  // Create the wallet if it does not exist.
  if (!wallet) {
    const walletId = await ctx.db.insert("wallets", {
      userId: submission.userId,
      balance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      createdAt: now,
      updatedAt: now,
    });

    wallet = await ctx.db.get(walletId);

    if (!wallet) {
      throw new Error("Could not create the user's wallet.");
    }
  }

  // Update the wallet balance and lifetime earnings.
  await ctx.db.patch(wallet._id, {
    balance: wallet.balance + task.reward,
    totalEarned: wallet.totalEarned + task.reward,
    updatedAt: now,
  });

  // Record the reward in the transaction history.
await ctx.db.insert("walletTransactions", {
  userId: submission.userId,
  type: "reward",
  amount: task.reward,
  description: `Day ${task.day} - ${task.title}`,
  reference: `TASK-${submission._id}`,
  taskId: task._id,
  submissionId: submission._id,
  createdAt: now,
});
}

export const getPending = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const submissions = await ctx.db
      .query("taskSubmissions")
      .withIndex("by_status", (q) =>
        q.eq("status", "pending")
      )
      .collect();

    return await Promise.all(
      submissions.map(async (submission) => {
        const user = await ctx.db.get(submission.userId);
        const task = await ctx.db.get(submission.taskId);

        return {
          id: submission._id,
          status: submission.status,
          submittedAt: submission.submittedAt,

          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,

          task: task
            ? {
                id: task._id,
                title: task.title,
                reward: task.reward,
                day: task.day,
              }
            : null,

          proofStorageId: submission.proofStorageId,
        };
      })
    );
  },
});

export const getProofUrl = query({
  args: {
    token: v.string(),
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const url = await ctx.storage.getUrl(args.storageId);

    return { url };
  },
});

export const approve = mutation({
  args: {
    token: v.string(),
    submissionId: v.id("taskSubmissions"),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new Error("Submission not found.");
    }

    if (submission.status !== "pending") {
      throw new Error(
        "This submission has already been reviewed."
      );
    }

    const task = await ctx.db.get(submission.taskId);

    if (!task) {
      throw new Error("Task not found.");
    }

    const now = Date.now();

    await creditTaskReward(ctx, submission, task, now);

    await ctx.db.patch(args.submissionId, {
      status: "approved",
      reviewedAt: now,
      reviewedBy: admin._id,
    });

    return {
      success: true,
      status: "approved",
      reward: task.reward,
    };
  },
});

export const reject = mutation({
  args: {
    token: v.string(),
    submissionId: v.id("taskSubmissions"),
    adminNote: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new Error("Submission not found.");
    }

    if (submission.status !== "pending") {
      throw new Error(
        "This submission has already been reviewed."
      );
    }

    const now = Date.now();

    await ctx.db.patch(args.submissionId, {
      status: "rejected",
      adminNote: args.adminNote?.trim() || undefined,
      reviewedAt: now,
      reviewedBy: admin._id,
      rejectedAt: now,
      retryAvailableAt: now + 60 * 1000,
    });

    return {
      success: true,
      status: "rejected",
    };
  },
});


function getNigeriaDayStart(timestamp: number): number {
  const nigeriaOffset = 60 * 60 * 1000;
  const date = new Date(timestamp + nigeriaOffset);

  return (
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ) - nigeriaOffset
  );
}



function getParticipationDay(
  createdAt: number,
  timestamp: number
): number {
  const dayLength = 24 * 60 * 60 * 1000;

  const registrationDay =
    getNigeriaDayStart(createdAt);

  const currentCalendarDay =
    getNigeriaDayStart(timestamp);

  return (
    Math.floor(
      (currentCalendarDay - registrationDay) /
        dayLength
    ) + 1
  );
}
  
async function updateUserActivity(
  ctx: any,
  userId: any,
  day: number,
  now: number
) {
  // Get all active tasks assigned to this day.
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_day_active", (q: any) =>
      q.eq("day", day).eq("isActive", true)
    )
    .collect();

  // A day with no active tasks cannot qualify as completed.
  if (tasks.length === 0) return;

  // Every active task must have an approved submission.
  for (const task of tasks) {
    const submission = await ctx.db
      .query("taskSubmissions")
      .withIndex("by_user_task", (q: any) =>
        q.eq("userId", userId).eq("taskId", task._id)
      )
      .unique();

    if (!submission || submission.status !== "approved") {
      return;
    }
  }

  // Find the user's activity record for this day.
  const activity = await ctx.db
    .query("userActivities")
    .withIndex("by_user_day", (q: any) =>
      q.eq("userId", userId).eq("day", day)
    )
    .unique();

  if (activity) {
    if (activity.status !== "completed") {
      await ctx.db.patch(activity._id, {
        status: "completed",
        completedAt: now,
        updatedAt: now,
      });
    }
    return;
  }

  // Create the completed activity record.
  await ctx.db.insert("userActivities", {
    userId,
    day,
    status: "completed",
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  });
}


export const reviewSubmission = mutation({
  args: {
    token: v.string(),
    submissionId: v.id("taskSubmissions"),
    decision: v.union(
      v.literal("approved"),
      v.literal("rejected")
    ),
    adminNote: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const admin = await authenticateAdmin(ctx, args.token);

    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new Error("Submission not found.");
    }

    if (submission.status !== "pending") {
      throw new Error(
        "This submission has already been reviewed."
      );
    }

    const task = await ctx.db.get(submission.taskId);

    if (!task) {
      throw new Error("Task not found.");
    }

    const now = Date.now();

    if (args.decision === "rejected") {
      await ctx.db.patch(args.submissionId, {
        status: "rejected",
        adminNote: args.adminNote?.trim() || undefined,
        reviewedAt: now,
        reviewedBy: admin._id,
        rejectedAt: now,
        retryAvailableAt: now + 60 * 1000,
      });

      return {
        success: true,
        status: "rejected",
      };
    }

    // await creditTaskReward(ctx, submission, task, now);

    // await ctx.db.patch(args.submissionId, {
    //   status: "approved",
    //   adminNote: args.adminNote?.trim() || undefined,
    //   reviewedAt: now,
    //   reviewedBy: admin._id,
    // });

    // return {
    //   success: true,
    //   status: "approved",
    //   reward: task.reward,
    // };

    
await creditTaskReward(ctx, submission, task, now);

await ctx.db.patch(args.submissionId, {
  status: "approved",
  adminNote: args.adminNote?.trim() || undefined,
  reviewedAt: now,
  reviewedBy: admin._id,
});

await updateUserActivity(
  ctx,
  submission.userId,
  task.day,
  now
);

return {
  success: true,
  status: "approved",
  reward: task.reward,
};

  },
});
