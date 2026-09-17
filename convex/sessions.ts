// import { mutation, query,} from "./_generated/server";
// import { v } from "convex/values";

// function generateToken() {
//   const bytes = new Uint8Array(32);

//   crypto.getRandomValues(bytes);

//   return Array.from(bytes)
//     .map((byte) =>
//       byte.toString(16).padStart(2, "0")
//     )
//     .join("");
// }

// export const create = mutation({
//   args: {
//     userId: v.id("users"),
//   },

//   handler: async (ctx, args) => {
//     const token = generateToken();

//     const expiresAt =
//       Date.now() + 1000 * 60 * 60 * 24 * 30;

//     await ctx.db.insert("sessions", {
//       userId: args.userId,
//       tokenHash: token,
//       expiresAt,
//       createdAt: Date.now(),
//     });

//     return {
//       token,
//     };
//   },
// });





// import {
//   mutation,
//   query,
// } from "./_generated/server";

// import { v } from "convex/values";

// export const create = mutation({
//   args: {
//     userId: v.id("users"),
//   },

//   handler: async (ctx, args) => {
//     const tokenBytes = new Uint8Array(32);

//     crypto.getRandomValues(tokenBytes);

//     const token = Array.from(tokenBytes)
//       .map((byte) =>
//         byte.toString(16).padStart(2, "0")
//       )
//       .join("");

//     const now = Date.now();

//     const expiresAt =
//       now + 30 * 24 * 60 * 60 * 1000;

//     await ctx.db.insert("sessions", {
//       userId: args.userId,
//       tokenHash: token,
//       expiresAt,
//       createdAt: now,
//     });

//     return {
//       token,
//     };
//   },
// });

// export const getCurrentUser = query({
//   args: {
//     token: v.string(),
//   },

//   handler: async (ctx, args) => {
//     const session = await ctx.db
//       .query("sessions")
//       .filter((q) =>
//         q.eq(
//           q.field("tokenHash"),
//           args.token
//         )
//       )
//       .first();

//     if (!session) {
//       return null;
//     }

//     if (session.expiresAt < Date.now()) {
//       return null;
//     }

//     const user = await ctx.db.get(
//       session.userId
//     );

//     if (!user || user.status !== "active") {
//       return null;
//     }

//     return {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       referralCode: user.referralCode,
//     };
//   },
// });

// export const remove = mutation({
//   args: {
//     token: v.string(),
//   },

//   handler: async (ctx, args) => {
//     const session = await ctx.db
//       .query("sessions")
//       .filter((q) =>
//         q.eq(
//           q.field("tokenHash"),
//           args.token
//         )
//       )
//       .first();

//     if (session) {
//       await ctx.db.delete(session._id);
//     }

//     return {
//       success: true,
//     };
//   },
// });







// latest code

import {
  mutation,
  query,
} from "./_generated/server";

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
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const tokenBytes = new Uint8Array(32);

    crypto.getRandomValues(tokenBytes);

    const token = Array.from(tokenBytes)
      .map((byte) =>
        byte.toString(16).padStart(2, "0")
      )
      .join("");

    const tokenHash = await hashToken(token);

    const now = Date.now();

    const expiresAt =
      now + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("sessions", {
      userId: args.userId,
      tokenHash,
      expiresAt,
      createdAt: now,
    });

    return {
      token,
    };
  },
});

export const getCurrentUser = query({
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

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
    };
  },
});

export const remove = mutation({
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

    if (session) {
      await ctx.db.delete(session._id);
    }

    return {
      success: true,
    };
  },
});