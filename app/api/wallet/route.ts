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
        { error: "Please log in to view your wallet." },
        { status: 401 }
      );
    }

    const [wallet, transactions] = await Promise.all([
      convex.query(api.wallet.getMyWallet, { token }),
      convex.query(api.wallet.getMyTransactions, { token }),
    ]);

    // Nigeria uses UTC+1. Calculate today's start in that timezone.
    const now = new Date();
    const nigeriaNow = new Date(now.getTime() + 60 * 60 * 1000);
    const startOfToday =
      Date.UTC(
        nigeriaNow.getUTCFullYear(),
        nigeriaNow.getUTCMonth(),
        nigeriaNow.getUTCDate()
      ) -
      60 * 60 * 1000;

    const todaysEarnings = transactions
      .filter(
        (transaction) =>
          transaction.type === "reward" &&
          transaction.createdAt >= startOfToday
      )
      .reduce((total, transaction) => total + transaction.amount, 0);

    return NextResponse.json({
      wallet,
      todaysEarnings,
      transactions: transactions.slice(0, 5),
    });
  } catch (error) {
    console.error("Wallet API error:", error);

    return NextResponse.json(
      { error: "Unable to load wallet information." },
      { status: 500 }
    );
  }
}