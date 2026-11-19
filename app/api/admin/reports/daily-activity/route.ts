
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reports = await convex.query(
      api.adminReports.getDailyActivityReport,
      { token }
    );

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Daily activity report error:", error);

    return NextResponse.json(
      { error: "Failed to load daily activity report" },
      { status: 500 }
    );
  }
}
