import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "You are not authenticated.",
        },
        { status: 401 }
      );
    }

    const submissions =
      await convex.query(
        api.adminSubmissions.getPending,
        {
          token,
        }
      );

    return NextResponse.json({
      submissions,
    });
  } catch (error) {
    console.error(
      "Admin submissions error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load submissions.",
      },
      { status: 500 }
    );
  }
}