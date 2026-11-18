
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to continue.",
        },
        { status: 401 }
      );
    }

    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );

    const data = await convex.query(
      api.adminWallet.getUserTransactions,
      {
        token,
        userId: userId as any,
      }
    );

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve wallet transactions.",
      },
      { status: 500 }
    );
  }
}
