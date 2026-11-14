import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Convex URL is not configured.");
  }

  return new ConvexHttpClient(convexUrl);
}

async function authenticateAdmin(
  convex: ConvexHttpClient,
  token: string
) {
  const user = await convex.query(
    api.sessions.getCurrentUser,
    { token }
  );

  if (!user || user.role !== "admin") {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    const isAdmin = await authenticateAdmin(convex, token);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const userId = request.nextUrl.searchParams.get("userId");

    if (userId) {
      const user = await convex.query(
        api.adminUsers.getUserById,
        {
          token,
          userId: userId as Id<"users">,
        }
      );

      return NextResponse.json({
        success: true,
        user,
      });
    }

    const users = await convex.query(
      api.adminUsers.getAllUsers,
      { token }
    );

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve users.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    const isAdmin = await authenticateAdmin(convex, token);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    // const body = await request.json();

    // const { userId, action } = body;

    // if (!userId || !["suspend", "activate"].includes(action)) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "A valid user ID and action are required.",
    //     },
    //     { status: 400 }
    //   );
    // }


    const body = await request.json().catch(() => null);

if (
  !body ||
  typeof body.userId !== "string" ||
  !["suspend", "activate"].includes(body.action)
) {
  return NextResponse.json(
    {
      success: false,
      message: "A valid user ID and action are required.",
    },
    { status: 400 }
  );
}

const { userId, action } = body;
    const args = {
      token,
      userId: userId as Id<"users">,
    };

    const result =
      action === "suspend"
        ? await convex.mutation(
            api.adminUsers.suspendUser,
            args
          )
        : await convex.mutation(
            api.adminUsers.activateUser,
            args
          );

    return NextResponse.json({
  ...result,
  success: true,
});
  } catch (error) {
    console.error("Admin user update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update user.",
      },
      { status: 500 }
    );
  }
}