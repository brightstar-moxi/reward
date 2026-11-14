
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

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

async function authenticateAdmin(
  convex: ConvexHttpClient,
  token: string
) {
  const user = await convex.query(
    api.sessions.getCurrentUser,
    { token }
  );

  return Boolean(user && user.role === "admin");
}

// GET: Retrieve all tasks
export async function GET() {
  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    if (!(await authenticateAdmin(convex, token))) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const tasks = await convex.query(
      api.adminTasks.getAllTasks,
      { token }
    );

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Admin tasks fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve tasks.",
      },
      { status: 500 }
    );
  }
}

// POST: Create a task
export async function POST(request: NextRequest) {
  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    if (!(await authenticateAdmin(convex, token))) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const taskId = await convex.mutation(
      api.adminTasks.createTask,
      {
        token,
        day: Number(body.day),
        title: body.title,
        description: body.description,
        type: body.type,
        reward: Number(body.reward),
        targetUrl: body.targetUrl || undefined,
        requiresProof: body.requiresProof,
        instructions: body.instructions,
      }
    );

    return NextResponse.json({
      success: true,
      taskId,
      message: "Task created successfully.",
    });
  } catch (error) {
    console.error("Admin task creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create task.",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update task or change its active status
export async function PATCH(request: NextRequest) {
  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    if (!(await authenticateAdmin(convex, token))) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || typeof body.taskId !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid task ID is required." },
        { status: 400 }
      );
    }

    if (typeof body.isActive === "boolean") {
      await convex.mutation(
        api.adminTasks.updateTaskStatus,
        {
          token,
          taskId: body.taskId as Id<"tasks">,
          isActive: body.isActive,
        }
      );
    } else {
      await convex.mutation(
        api.adminTasks.updateTask,
        {
          token,
          taskId: body.taskId as Id<"tasks">,
          day: Number(body.day),
          title: body.title,
          description: body.description,
          type: body.type,
          reward: Number(body.reward),
          targetUrl: body.targetUrl || null,
          requiresProof: body.requiresProof,
          instructions: body.instructions,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
    });
  } catch (error) {
    console.error("Admin task update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update task.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    if (!(await authenticateAdmin(convex, token))) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.taskId !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid task ID is required." },
        { status: 400 }
      );
    }

    await convex.mutation(
      api.adminTasks.deleteTask,
      {
        token,
        taskId: body.taskId as Id<"tasks">,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Admin task deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete task.",
      },
      { status: 500 }
    );
  }
}
