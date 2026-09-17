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
      createdAt: now,
      updatedAt: now,
    });

    return {
      userId,
    };
  },
});