
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
        { error: "Please log in to continue." },
        { status: 401 }
      );
    }

    const [participation, earnings] = await Promise.all([
      convex.query(api.participation.getMyParticipation, {
        token,
      }),
      convex.query(api.participation.getMyDailyEarnings, {
        token,
      }),
    ]);

    return NextResponse.json(
      { participation, earnings },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Participation API error:", error);

    return NextResponse.json(
      { error: "Unable to load participation and earnings." },
      { status: 500 }
    );
  }
}
