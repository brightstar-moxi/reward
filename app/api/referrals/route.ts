
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "@/convex/_generated/api";

// export async function GET() {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("session_token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         { error: "Please log in to continue." },
//         { status: 401 }
//       );
//     }

//     const convex = new ConvexHttpClient(
//       process.env.NEXT_PUBLIC_CONVEX_URL!
//     );

//     const referrals = await convex.query(
//       api.users.getMyReferrals,
//       { token }
//     );

//     return NextResponse.json(referrals, {
//       headers: {
//         "Cache-Control": "no-store",
//       },
//     });
//   } catch (error) {
//     console.error("Failed to load referrals:", error);

//     return NextResponse.json(
//       { error: "Unable to load referral information." },
//       { status: 500 }
//     );
//   }
// }





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
        { error: "Please log in to continue." },
        { status: 401 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      throw new Error("Convex URL is not configured.");
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Verify that the current user is an administrator.
    const user = await convex.query(
      api.sessions.getCurrentUser,
      { token }
    );

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    // Retrieve all referral information.
    const referrals = await convex.query(
      api.adminReferrals.getAllReferrals,
      { token }
    );

    return NextResponse.json(
      {
        success: true,
        ...referrals,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load admin referrals:", error);

    return NextResponse.json(
      { error: "Unable to load referral information." },
      { status: 500 }
    );
  }
}
