
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function getConvexClient() {
  if (!convexUrl) {
    throw new Error("Convex URL is not configured.");
  }

  return new ConvexHttpClient(convexUrl);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const client = getConvexClient();

    const [pages, faqs, announcements, banners] =
      await Promise.all([
        client.query(api.adminContent.getAllPages, { token }),
        client.query(api.adminContent.getAllFaqs, { token }),
        client.query(api.adminContent.getAllAnnouncements, { token }),
        client.query(api.adminContent.getAllBanners, { token }),
      ]);

    return NextResponse.json({
      success: true,
      pages,
      faqs,
      announcements,
      banners,
    });
  } catch (error) {
    console.error("Admin content GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load content.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    const client = getConvexClient();

    let result;

    switch (action) {
      // Website pages
      case "savePage":
        result = await client.mutation(
          api.adminContent.savePage,
          { token, ...data }
        );
        break;

      case "deletePage":
        result = await client.mutation(
          api.adminContent.deletePage,
          { token, ...data }
        );
        break;

      // FAQs
      case "saveFaq":
        result = await client.mutation(
          api.adminContent.saveFaq,
          { token, ...data }
        );
        break;

      case "deleteFaq":
        result = await client.mutation(
          api.adminContent.deleteFaq,
          { token, ...data }
        );
        break;

      // Announcements
      case "saveAnnouncement":
        result = await client.mutation(
          api.adminContent.saveAnnouncement,
          { token, ...data }
        );
        break;

      case "deleteAnnouncement":
        result = await client.mutation(
          api.adminContent.deleteAnnouncement,
          { token, ...data }
        );
        break;

      // Promotional banners
      case "saveBanner":
        result = await client.mutation(
          api.adminContent.saveBanner,
          { token, ...data }
        );
        break;

      case "deleteBanner":
        result = await client.mutation(
          api.adminContent.deleteBanner,
          { token, ...data }
        );
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action." },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Admin content POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Content operation failed.",
      },
      { status: 500 }
    );
  }
}
