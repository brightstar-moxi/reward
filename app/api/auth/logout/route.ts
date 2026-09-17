import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function POST() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("session_token")?.value;

    if (token) {
      await convex.mutation(
        api.sessions.remove,
        {
          token,
        }
      );
    }

    cookieStore.delete("session_token");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);

    cookieStore.delete("session_token");

    return NextResponse.json({
      success: true,
    });
  }
}