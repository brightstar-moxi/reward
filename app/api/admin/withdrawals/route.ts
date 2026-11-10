
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      throw new Error("Convex URL is not configured.");
    }

    const convex = new ConvexHttpClient(convexUrl);

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

    const withdrawals = await convex.query(
      api.adminWithdrawals.getAllWithdrawals,
      { token }
    );

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("Fetch withdrawals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve withdrawal requests.",
      },
      { status: 500 }
    );
  }
}
