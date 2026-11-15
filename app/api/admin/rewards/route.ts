
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Convex URL is not configured.");
  }

  return new ConvexHttpClient(convexUrl);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    const user = await convex.query(
      api.sessions.getCurrentUser,
      { token }
    );

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const data = await convex.query(
      api.adminRewards.getAllRewards,
      { token }
    );

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin rewards fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve rewards.",
      },
      { status: 500 }
    );
  }
}
