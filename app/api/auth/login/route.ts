import { NextResponse } from "next/server";
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

  if (!saltHex || !hashHex) {
    return false;
  }

  const encoder = new TextEncoder();

  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)!.map((byte) =>
      parseInt(byte, 16)
    )
  );

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 310000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

  const derivedHash = Array.from(
    new Uint8Array(derivedBits)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");

  return derivedHash === hashHex;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await convex.query(
      api.users.getByEmail,
      { email }
    );

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        {
          error: "Your account is currently suspended.",
        },
        { status: 403 }
      );
    }

    const validPassword = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const session = await convex.mutation(
      api.sessions.create,
      {
        userId: user._id,
      }
    );

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      "session_token",
      session.token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign in. Please try again.",
      },
      { status: 500 }
    );
  }
}