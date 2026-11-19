
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!convexUrl) {
      throw new Error("Convex URL is not configured.");
    }

    const convex = new ConvexHttpClient(convexUrl);

    const report = await convex.query(
      api.adminReports.getWalletReport,
      { token }
    );

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Wallet report error:", error);

    return NextResponse.json(
      { error: "Failed to load wallet report." },
      { status: 500 }
    );
  }
}
