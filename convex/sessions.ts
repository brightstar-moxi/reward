import { mutation } from "./_generated/server";
import { v } from "convex/values";

function generateToken() {
  const bytes = new Uint8Array(32);

  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export const create = mutation({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const token = generateToken();

    const expiresAt =
      Date.now() + 1000 * 60 * 60 * 24 * 30;

    await ctx.db.insert("sessions", {
      userId: args.userId,
      tokenHash: token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      token,
    };
  },
});