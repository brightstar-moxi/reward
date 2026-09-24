import { mutation } from "./_generated/server";
import { v } from "convex/values";

async function hashPassword(password: string) {
  const encoder = new TextEncoder();

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 310000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const saltHex = Array.from(salt)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");

  const hashHex = Array.from(
    new Uint8Array(derivedBits)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");

  return `${saltHex}:${hashHex}`;
}

export const createAdmin = mutation({
  args: {},

  handler: async (ctx) => {
    const email = "admin@giveaway.com";
    const password = "TiplinAdmin@123*";

    /*
     * Prevent duplicate admin creation.
     */

    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", email)
      )
      .unique();

    if (existingAdmin) {
      if (existingAdmin.role === "admin") {
        return {
          success: true,
          message: "Admin account already exists.",
          userId: existingAdmin._id,
        };
      }

      throw new Error(
        "This email already belongs to a normal user."
      );
    }

    const now = Date.now();

    const passwordHash =
      await hashPassword(password);

    const userId = await ctx.db.insert(
      "users",
      {
        name: "Platform Admin",
        email,
        passwordHash,

        role: "admin",
        status: "active",

        referralCode: "ADMIN001",

        createdAt: now,
        updatedAt: now,
      }
    );

    return {
      success: true,
      message: "Admin account created successfully.",
      userId,
      email,
      password,
    };
  },
});