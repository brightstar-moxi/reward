// import {
//   mutation,
//   query,
// } from "./_generated/server";

// import { v } from "convex/values";

// export const create = mutation({
//   args: {
//     userId: v.id("users"),
//     taskId: v.id("tasks"),
//     proofStorageId: v.optional(v.id("_storage")),
//   },

//   handler: async (ctx, args) => {
//     const task = await ctx.db.get(args.taskId);

//     if (!task || !task.isActive) {
//       throw new Error("This task is no longer available.");
//     }

//     if (task.requiresProof && !args.proofStorageId) {
//       throw new Error(
//         "Proof is required for this task."
//       );
//     }

//     const existing = await ctx.db
//       .query("taskSubmissions")
//       .withIndex("by_user_task", (q) =>
//         q
//           .eq("userId", args.userId)
//           .eq("taskId", args.taskId)
//       )
//       .first();

//     if (existing) {
//       throw new Error(
//         "You have already submitted this task."
//       );
//     }

//     return await ctx.db.insert(
//       "taskSubmissions",
//       {
//         userId: args.userId,
//         taskId: args.taskId,

//         proofStorageId:
//           args.proofStorageId,

//         status: "pending",

//         submittedAt: Date.now(),
//       }
//     );
//   },
// });

// export const generateUploadUrl = mutation({
//   args: {},

//   handler: async (ctx) => {
//     return await ctx.storage.generateUploadUrl();
//   },
// });




import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export const create = mutation({
  args: {
    token: v.string(),
    taskId: v.id("tasks"),
    proofStorageId: v.optional(
      v.id("_storage")
    ),
  },

  handler: async (ctx, args) => {
    // Authenticate user from session token
    const tokenHash = await hashToken(args.token);

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session) {
      throw new Error(
        "You are not authenticated."
      );
    }

    if (session.expiresAt < Date.now()) {
      throw new Error(
        "Your session has expired."
      );
    }

    // Get authenticated user
    const user = await ctx.db.get(
      session.userId
    );

    if (!user || user.status !== "active") {
      throw new Error(
        "Your account is not active."
      );
    }

    // Get task
    const task = await ctx.db.get(
      args.taskId
    );

    if (!task || !task.isActive) {
      throw new Error(
        "This task is no longer available."
      );
    }

    // Check proof requirement
    if (
      task.requiresProof &&
      !args.proofStorageId
    ) {
      throw new Error(
        "Proof is required for this task."
      );
    }

    // Prevent duplicate submissions
    // const existing = await ctx.db
    //   .query("taskSubmissions")
    //   .withIndex("by_user_task", (q) =>
    //     q
    //       .eq("userId", user._id)
    //       .eq("taskId", args.taskId)
    //   )
    //   .first();

    // if (existing) {
    //   throw new Error(
    //     "You have already submitted this task."
    //   );
    // }



    const existing = await ctx.db
  .query("taskSubmissions")
  .withIndex("by_user_task", (q) =>
    q
      .eq("userId", user._id)
      .eq("taskId", args.taskId)
  )
  .first();

if (existing) {
  /*
   * Approved submissions cannot be submitted again.
   */
  if (existing.status === "approved") {
    throw new Error(
      "You have already completed this task."
    );
  }

  /*
   * Pending submissions cannot be submitted again.
   */
  if (existing.status === "pending") {
    throw new Error(
      "Your submission is still under review."
    );
  }

  /*
   * Rejected submission.
   * Check the one-minute retry cooldown.
   */
  if (existing.status === "rejected") {
    const retryAvailableAt =
      existing.retryAvailableAt;

    if (
      retryAvailableAt &&
      Date.now() < retryAvailableAt
    ) {
      const remainingSeconds = Math.ceil(
        (retryAvailableAt - Date.now()) /
          1000
      );

      throw new Error(
        `Please wait ${remainingSeconds} seconds before trying again.`
      );
    }

    /*
     * Cooldown has finished.
     * Reuse the existing submission record.
     */
    await ctx.db.patch(existing._id, {
      proofStorageId:
        args.proofStorageId,

      proofUrl: undefined,

      status: "pending",

      adminNote: undefined,

      submittedAt: Date.now(),

      reviewedAt: undefined,

      reviewedBy: undefined,

      rejectedAt: undefined,

      retryAvailableAt: undefined,
    });

    return {
      submissionId: existing._id,
      status: "pending" as const,
    };
  }
}

    // Create submission
    const submissionId =
      await ctx.db.insert(
        "taskSubmissions",
        {
          userId: user._id,
          taskId: args.taskId,
          proofStorageId:
            args.proofStorageId,
          status: "pending",
          submittedAt: Date.now(),
        }
      );

    return {
      submissionId,
      status: "pending" as const,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    // Authenticate before allowing an upload URL
    const tokenHash = await hashToken(args.token);

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session) {
      throw new Error(
        "You are not authenticated."
      );
    }

    if (session.expiresAt < Date.now()) {
      throw new Error(
        "Your session has expired."
      );
    }

    const user = await ctx.db.get(
      session.userId
    );

    if (!user || user.status !== "active") {
      throw new Error(
        "Your account is not active."
      );
    }

    return await ctx.storage.generateUploadUrl();
  },
});


export const getMySubmission = query({
  args: {
    token: v.string(),
    taskId: v.id("tasks"),
  },

  handler: async (ctx, args) => {
    const tokenHash = await hashToken(args.token);

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(
      session.userId
    );

    if (!user || user.status !== "active") {
      return null;
    }

    const submission = await ctx.db
      .query("taskSubmissions")
      .withIndex("by_user_task", (q) =>
        q
          .eq("userId", user._id)
          .eq("taskId", args.taskId)
      )
      .first();

    if (!submission) {
      return null;
    }

    // return {
    //   id: submission._id,
    //   status: submission.status,
    //   proofStorageId:
    //     submission.proofStorageId,
    //   submittedAt:
    //     submission.submittedAt,
    // };


    return {
  id: submission._id,
  status: submission.status,

  proofStorageId:
    submission.proofStorageId,

  submittedAt:
    submission.submittedAt,

  rejectedAt:
    submission.rejectedAt,

  retryAvailableAt:
    submission.retryAvailableAt,
};
  },
});