
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    // Protect cookie-authenticated actions against cross-origin requests.
    const origin = request.headers.get("origin");

    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { success: false, message: "Invalid request origin." },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      throw new Error("Convex URL is not configured.");
    }

    const convex = new ConvexHttpClient(convexUrl);

    let result;

    switch (body.action) {
      case "startProcessing":
        result = await convex.mutation(
          api.adminWithdrawals.startProcessing,
          {
            token,
            withdrawalId: body.withdrawalId,
          }
        );
        break;

      case "markPaid":
        if (typeof body.paymentReference !== "string") {
          return NextResponse.json(
            { success: false, message: "Payment reference is required." },
            { status: 400 }
          );
        }

        result = await convex.mutation(
          api.adminWithdrawals.markPaid,
          {
            token,
            withdrawalId: body.withdrawalId,
            paymentReference: body.paymentReference,
          }
        );
        break;

      case "rejectWithdrawal":
        if (typeof body.adminNote !== "string") {
          return NextResponse.json(
            { success: false, message: "Rejection reason is required." },
            { status: 400 }
          );
        }

        result = await convex.mutation(
          api.adminWithdrawals.rejectWithdrawal,
          {
            token,
            withdrawalId: body.withdrawalId,
            adminNote: body.adminNote,
          }
        );
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid withdrawal action." },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Withdrawal action error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process withdrawal action.",
      },
      { status: 400 }
    );
  }
}
