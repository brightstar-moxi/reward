
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

async function verifyPassword(
  password: string,
  storedHash: string
) {
  const [saltHex, hashHex] = storedHash.split(":");

  if (!saltHex || !hashHex) return false;

  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
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
    key,
    256
  );

  const computedHash = Array.from(new Uint8Array(derivedBits))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return computedHash === hashHex;
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
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
    key,
    256
  );

  const saltHex = Array.from(salt)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `${saltHex}:${hashHex}`;
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You are not authenticated." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "Please provide both passwords." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Your new password must be different." },
        { status: 400 }
      );
    }

    const user = await convex.query(
      api.sessions.getCurrentUser,
      { token }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Your session is invalid or expired." },
        { status: 401 }
      );
    }

    const account = await convex.query(
      api.users.getByEmail,
      { email: user.email }
    );

    if (!account) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(
      currentPassword,
      account.passwordHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await convex.mutation(
      api.users.updatePassword,
      { token, passwordHash }
    );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to change password.",
      },
      { status: 400 }
    );
  }
}
