import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function POST() {
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

    const uploadUrl =
      await convex.mutation(
        api.taskSubmissions.generateUploadUrl,
        {
          token: sessionToken,
        }
      );

    return NextResponse.json({
      uploadUrl,
    });
  } catch (error) {
    console.error(
      "Upload URL error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare file upload.",
      },
      { status: 500 }
    );
  }
}