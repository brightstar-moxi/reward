
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You are not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      typeof body.claimId !== "string" ||
      !["approved", "rejected"].includes(body.decision)
    ) {
      return NextResponse.json(
        { error: "Invalid review details." },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.dailyLogin.review, {
      token,
      claimId: body.claimId,
      decision: body.decision,
      adminNote:
        typeof body.adminNote === "string"
          ? body.adminNote
          : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to review Daily Login claim.",
      },
      { status: 400 }
    );
  }
}
