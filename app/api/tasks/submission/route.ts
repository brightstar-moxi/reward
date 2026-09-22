import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "You are not authenticated.",
        },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const taskId =
      searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        {
          error: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    const submission =
      await convex.query(
        api.taskSubmissions.getMySubmission,
        {
          token: sessionToken,
          taskId: taskId as Id<"tasks">,
        }
      );

    return NextResponse.json({
      submission,
    });
  } catch (error) {
    console.error(
      "Get submission error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to check task submission.",
      },
      { status: 500 }
    );
  }
}