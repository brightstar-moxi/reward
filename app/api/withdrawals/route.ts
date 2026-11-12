
import { NextRequest, NextResponse } from "next/server";
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

    const eligibility = await convex.query(
      api.withdrawals.getEligibility,
      { token }
    );

    return NextResponse.json({
      success: true,
      eligibility,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load withdrawal eligibility.",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = await convex.mutation(
      api.withdrawals.requestWithdrawal,
      {
        token,
        amount: Number(body.amount),
        bankName: String(body.bankName ?? ""),
        accountName: String(body.accountName ?? ""),
        accountNumber: String(body.accountNumber ?? ""),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Your withdrawal request was submitted successfully.",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit withdrawal request.",
      },
      { status: 400 }
    );
  }
}
