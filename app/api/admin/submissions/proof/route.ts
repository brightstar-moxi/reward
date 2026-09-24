import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function GET(
  request: Request
) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "You are not authenticated.",
        },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const storageId =
      searchParams.get("storageId");

    if (!storageId) {
      return NextResponse.json(
        {
          error: "Storage ID is required.",
        },
        { status: 400 }
      );
    }

    const result =
      await convex.query(
        api.adminSubmissions.getProofUrl,
        {
          token,
          storageId: storageId as any,
        }
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Proof URL error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load proof.",
      },
      { status: 500 }
    );
  }
}