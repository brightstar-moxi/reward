// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// export const create = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//     passwordHash: v.string(),
//   },

//  handler: async (ctx, args) => {
//   const existingUser = await ctx.db
//     .query("users")
//     .filter((q) =>
//       q.eq(q.field("email"), args.email)
//     )
//     .first();

//   if (existingUser) {
//     throw new Error(
//       "An account with this email already exists."
//     );
//   }

//   // ...

//     if (existingUser) {
//       throw new Error(
//         "An account with this email already exists."
//       );
//     }

//     const now = Date.now();

//     const referralCode =
//       `${args.name
//         .replace(/\s+/g, "")
//         .slice(0, 4)
//         .toUpperCase()}-${Math.random()
//         .toString(36)
//         .slice(2, 8)
//         .toUpperCase()}`;

//     const userId = await ctx.db.insert("users", {
//       name: args.name,
//       email: args.email,
//       passwordHash: args.passwordHash,

//       role: "user",
//       status: "active",

//       referralCode,

//       createdAt: now,
//       updatedAt: now,
//     });

//     return {
//       userId,
//     };
//   },


// });

// export const getByEmail = query({
//   args: {
//     email: v.string(),
//   },

//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("users")
//       .filter((q) =>
//         q.eq(q.field("email"), args.email)
//       )
//       .first();
//   },
// });


import {
    mutation,
    query,
} from "./_generated/server";

import { v } from "convex/values";

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        referralCode: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) =>
                q.eq("email", args.email)
            )
            .unique();

        if (existingUser) {
            throw new Error(
                "An account with this email already exists."
            );
        }
        let referredBy: string | undefined;

        if (args.referralCode) {
            const referrer = await ctx.db
                .query("users")
                .withIndex("by_referral_code", (q) =>
                    q.eq("referralCode", args.referralCode!)
                )
                .unique();

            if (!referrer) {
                throw new Error("Invalid referral code.");
            }

            referredBy = referrer.referralCode;
        }
        const now = Date.now();

        const referralCode =
            `${args.name
                .replace(/\s+/g, "")
                .slice(0, 4)
                .toUpperCase()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)
                    .toUpperCase()}`;

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            passwordHash: args.passwordHash,
            role: "user",
            status: "active",
            referralCode,
            referredBy,
            createdAt: now,
            updatedAt: now,
        });

        return {
            userId,
        };
    },
});

export const getByEmail = query({
    args: {
        email: v.string(),
    },

    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) =>
                q.eq("email", args.email)
            )
            .unique();

        if (!user) {
            return null;
        }

        return user;
    },
});



export const getMyReferrals = query({
  args: {
    token: v.string(),
  },

  handler: async (ctx, args) => {
    const tokenBytes = new TextEncoder().encode(args.token);
    const hash = await crypto.subtle.digest("SHA-256", tokenBytes);

    const tokenHash = Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token_hash", (q) =>
        q.eq("tokenHash", tokenHash)
      )
      .unique();

    if (!session || session.expiresAt <= Date.now()) {
      throw new Error("Your session is invalid or expired.");
    }

    const user = await ctx.db.get(session.userId);

    if (!user || user.status !== "active") {
      throw new Error("Your account is unavailable.");
    }

    const referrals = await ctx.db
      .query("users")
      .withIndex("by_referred_by", (q) =>
        q.eq("referredBy", user.referralCode)
      )
      .collect();

    return {
      referralCode: user.referralCode,
      totalReferrals: referrals.length,
      referrals: referrals.map((referral) => ({
        id: referral._id,
        name: referral.name,
        joinedAt: referral.createdAt,
        status: referral.status,
      })),
    };
  },
});
