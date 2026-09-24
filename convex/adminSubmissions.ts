import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPending = query({
  args: {
    token: v.string(),
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
      throw new Error(
        "You are not authenticated."
      );
    }

    if (session.expiresAt < Date.now()) {
      throw new Error(
        "Your session has expired."
      );
    }

    const admin = await ctx.db.get(
      session.userId
    );

    if (!admin || admin.status !== "active") {
      throw new Error(
        "Your account is not active."
      );
    }

    if (admin.role !== "admin") {
      throw new Error(
        "Admin access required."
      );
    }

    const submissions = await ctx.db
      .query("taskSubmissions")
      .withIndex("by_status", (q) =>
        q.eq("status", "pending")
      )
      .collect();

    return await Promise.all(
      submissions.map(async (submission) => {
        const user = await ctx.db.get(
          submission.userId
        );

        const task = await ctx.db.get(
          submission.taskId
        );

        return {
          id: submission._id,
          status: submission.status,
          submittedAt:
            submission.submittedAt,

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

          proofStorageId:
            submission.proofStorageId,
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

    const admin = await ctx.db.get(
      session.userId
    );

    if (
      !admin ||
      admin.status !== "active"
    ) {
      throw new Error(
        "Your account is not active."
      );
    }

    if (admin.role !== "admin") {
      throw new Error(
        "Admin access required."
      );
    }

    const url = await ctx.storage.getUrl(
      args.storageId
    );

    return {
      url,
    };
  },
});



export const approve = mutation({
  args: {
    token: v.string(),
    submissionId: v.id("taskSubmissions"),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate admin
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

    // 2. Get admin
    const admin = await ctx.db.get(
      session.userId
    );

    if (
      !admin ||
      admin.status !== "active"
    ) {
      throw new Error(
        "Your account is not active."
      );
    }

    if (admin.role !== "admin") {
      throw new Error(
        "Admin access required."
      );
    }

    // 3. Get submission
    const submission = await ctx.db.get(
      args.submissionId
    );

    if (!submission) {
      throw new Error(
        "Submission not found."
      );
    }

    // 4. Only pending submissions can be approved
    if (submission.status !== "pending") {
      throw new Error(
        "This submission has already been reviewed."
      );
    }

    // 5. Approve submission
    await ctx.db.patch(
      args.submissionId,
      {
        status: "approved",
        reviewedAt: Date.now(),
        reviewedBy: admin._id,
      }
    );

    return {
      success: true,
      status: "approved",
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
    // 1. Authenticate admin
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

    // 2. Verify admin
    const admin = await ctx.db.get(
      session.userId
    );

    if (
      !admin ||
      admin.status !== "active"
    ) {
      throw new Error(
        "Your account is not active."
      );
    }

    if (admin.role !== "admin") {
      throw new Error(
        "Admin access required."
      );
    }

    // 3. Get submission
    const submission = await ctx.db.get(
      args.submissionId
    );

    if (!submission) {
      throw new Error(
        "Submission not found."
      );
    }

    // 4. Only pending submissions can be rejected
    if (submission.status !== "pending") {
      throw new Error(
        "This submission has already been reviewed."
      );
    }

    // 5. Reject submission
    await ctx.db.patch(
      args.submissionId,
      {
        status: "rejected",
        adminNote:
          args.adminNote?.trim() || undefined,
        reviewedAt: Date.now(),
        reviewedBy: admin._id,
      }
    );

    return {
      success: true,
      status: "rejected",
    };
  },
});

async function hashToken(token: string) {
  const data =
    new TextEncoder().encode(token);

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


export const reviewSubmission = mutation({
  args: {
    token: v.string(),

    submissionId: v.id(
      "taskSubmissions"
    ),

    decision: v.union(
      v.literal("approved"),
      v.literal("rejected")
    ),

    adminNote: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    /*
     * 1. Authenticate admin
     */

    const tokenHash = await hashToken(
      args.token
    );

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

    const admin = await ctx.db.get(
      session.userId
    );

    if (
      !admin ||
      admin.status !== "active"
    ) {
      throw new Error(
        "Your account is not active."
      );
    }

    if (admin.role !== "admin") {
      throw new Error(
        "Admin access required."
      );
    }

    /*
     * 2. Get submission
     */

    const submission =
      await ctx.db.get(
        args.submissionId
      );

    if (!submission) {
      throw new Error(
        "Submission not found."
      );
    }

    /*
     * 3. Prevent reviewing the same
     *    submission twice.
     */

    if (submission.status !== "pending") {
      throw new Error(
        "This submission has already been reviewed."
      );
    }

    /*
     * 4. Get task
     */

    const task = await ctx.db.get(
      submission.taskId
    );

    if (!task) {
      throw new Error(
        "Task not found."
      );
    }

    const now = Date.now();

    /*
     * 5. REJECT
     */

    if (args.decision === "rejected") {
      await ctx.db.patch(
        args.submissionId,
        {
          status: "rejected",
          adminNote: args.adminNote,
          reviewedAt: now,
          reviewedBy: admin._id,
        }
      );

      return {
        success: true,
        status: "rejected",
      };
    }

    /*
     * 6. APPROVE
     */

    await ctx.db.patch(
      args.submissionId,
      {
        status: "approved",
        adminNote: args.adminNote,
        reviewedAt: now,
        reviewedBy: admin._id,
      }
    );

    /*
     * 7. Create wallet reward transaction
     */

    await ctx.db.insert(
      "walletTransactions",
      {
        userId: submission.userId,

        type: "reward",

        amount: task.reward,

        description:
          `Day ${task.day} - ${task.title}`,

        taskId: task._id,

        submissionId:
          submission._id,

        createdAt: now,
      }
    );

    return {
      success: true,
      status: "approved",
      reward: task.reward,
    };
  },
});