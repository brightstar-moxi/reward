
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
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please sign in again." },
        { status: 401 }
      );
    }

    const withdrawals = await convex.query(
      api.withdrawals.getMyWithdrawals,
      { token }
    );

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load withdrawal history.",
      },
      { status: 400 }
    );
  }
}
