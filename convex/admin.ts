import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const makeAdmin = mutation({
  args: {
    email: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", args.email.toLowerCase())
      )
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(user._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      userId: user._id,
      email: user.email,
      role: "admin",
    };
  },
});