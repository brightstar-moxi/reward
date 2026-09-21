// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { ConvexHttpClient } from "convex/browser";

// import { api } from "@/convex/_generated/api";

// const convex = new ConvexHttpClient(
//   process.env.NEXT_PUBLIC_CONVEX_URL!
// );

// export async function POST(request: Request) {
//   try {
//     const cookieStore = await cookies();

//     const sessionToken =
//       cookieStore.get("session_token")?.value;

//     if (!sessionToken) {
//       return NextResponse.json(
//         {
//           error: "You are not authenticated.",
//         },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();

//     const taskId = String(
//       body.taskId ?? ""
//     );

//     const proofStorageId =
//       body.proofStorageId || undefined;

//     if (!taskId) {
//       return NextResponse.json(
//         {
//           error: "Task ID is required.",
//         },
//         { status: 400 }
//       );
//     }

//     const result = await convex.mutation(
//       api.taskSubmissions.create,
//       {
//         token: sessionToken,
//         taskId: taskId as any,
//         proofStorageId,
//       }
//     );

//     return NextResponse.json({
//       success: true,
//       submissionId: result.submissionId,
//       status: result.status,
//     });
//   } catch (error) {
//     console.error(
//       "Task submission error:",
//       error
//     );

//     const message =
//       error instanceof Error
//         ? error.message
//         : "Unable to submit task.";

//     return NextResponse.json(
//       { error: message },
//       { status: 400 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function POST(request: Request) {
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

    const body = await request.json();

    const taskId = String(
      body.taskId ?? ""
    );

    if (!taskId) {
      return NextResponse.json(
        {
          error: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    const result = await convex.mutation(
      api.taskSubmissions.create,
      {
        token: sessionToken,
        taskId: taskId as Id<"tasks">,
        proofStorageId:
          body.proofStorageId || undefined,
      }
    );

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      status: result.status,
    });
  } catch (error) {
    console.error(
      "Task submission error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit task.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}