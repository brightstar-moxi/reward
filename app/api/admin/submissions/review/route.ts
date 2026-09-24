import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function POST(
  request: Request
) {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "session_token"
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "You are not authenticated.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const submissionId =
      String(
        body.submissionId ?? ""
      );

    const decision =
      String(
        body.decision ?? ""
      );

    const adminNote =
      body.adminNote
        ? String(body.adminNote)
        : undefined;

    if (
      !submissionId ||
      (decision !== "approved" &&
        decision !== "rejected")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid review request.",
        },
        { status: 400 }
      );
    }

    const result =
      await convex.mutation(
        api.adminSubmissions.reviewSubmission,
        {
          token,
          submissionId:
            submissionId as any,
          decision:
            decision as
              | "approved"
              | "rejected",
          adminNote,
        }
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "Submission review error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to review submission.",
      },
      { status: 500 }
    );
  }
}