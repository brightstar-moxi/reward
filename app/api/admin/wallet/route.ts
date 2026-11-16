
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to continue.",
        },
        { status: 401 }
      );
    }

    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );

    const [overview, wallets] = await Promise.all([
      convex.query(api.adminWallet.getWalletOverview, {
        token,
      }),
      convex.query(api.adminWallet.getAllWallets, {
        token,
      }),
    ]);

    return NextResponse.json({
      success: true,
      overview,
      wallets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve wallet information.",
      },
      { status: 500 }
    );
  }
}
