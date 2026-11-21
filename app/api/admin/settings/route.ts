
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export async function GET() {
  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const settings = await convex.query(
   api.platformSettings.getAdminSettings,
      { token }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get platform settings error:", error);

    return NextResponse.json(
      { error: "Failed to load platform settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const settings = await convex.mutation(
    api.platformSettings.updateSettings,
      {
        token,
        totalJourneyDays: body.totalJourneyDays,
        withdrawalQualificationDays: body.withdrawalQualificationDays,
        referralQualificationDays: body.referralQualificationDays,
        requiredReferrals: body.requiredReferrals,
        minimumWithdrawal: body.minimumWithdrawal,
        dailyLoginReward: body.dailyLoginReward,
      }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update platform settings error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update platform settings",
      },
      { status: 400 }
    );
  }
}
