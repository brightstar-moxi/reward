// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const token = request.cookies.get("session_token")?.value;

//   if (!token) {
//     return NextResponse.json(
//       { authenticated: false },
//       { status: 401 }
//     );
//   }

//   // Verify the session using your existing authentication logic.
//   // Do not return the raw session token to the browser.

//   return NextResponse.json({
//     authenticated: true,
//   });
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
        { authenticated: false },
        { status: 401 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      throw new Error("Convex URL is not configured.");
    }

    const convex = new ConvexHttpClient(convexUrl);

    const user = await convex.query(
      api.sessions.getCurrentUser,
      { token }
    );

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { authenticated: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin session verification failed:", error);

    return NextResponse.json(
      { authenticated: false, message: "Session verification failed." },
      { status: 500 }
    );
  }
}
