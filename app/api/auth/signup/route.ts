// import { NextResponse } from "next/server";
// import { ConvexHttpClient } from "convex/browser";

// import { api } from "@/convex/_generated/api";

// const convex = new ConvexHttpClient(
//   process.env.NEXT_PUBLIC_CONVEX_URL!
// );

// async function hashPassword(password: string) {
//   const encoder = new TextEncoder();

//   const salt = crypto.getRandomValues(
//     new Uint8Array(16)
//   );

//   const keyMaterial =
//     await crypto.subtle.importKey(
//       "raw",
//       encoder.encode(password),
//       "PBKDF2",
//       false,
//       ["deriveBits"]
//     );

//   const derivedBits =
//     await crypto.subtle.deriveBits(
//       {
//         name: "PBKDF2",
//         salt,
//         iterations: 310000,
//         hash: "SHA-256",
//       },
//       keyMaterial,
//       256
//     );

//   const hash = Array.from(
//     new Uint8Array(derivedBits)
//   )
//     .map((byte) =>
//       byte.toString(16).padStart(2, "0")
//     )
//     .join("");

//   const saltHex = Array.from(salt)
//     .map((byte) =>
//       byte.toString(16).padStart(2, "0")
//     )
//     .join("");

//   return `${saltHex}:${hash}`;
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const name = String(body.name ?? "").trim();
//     const email = String(body.email ?? "")
//       .trim()
//       .toLowerCase();
//     const password = String(body.password ?? "");

//     if (!name || !email || !password) {
//       return NextResponse.json(
//         {
//           error: "All fields are required.",
//         },
//         { status: 400 }
//       );
//     }

//     if (password.length < 8) {
//       return NextResponse.json(
//         {
//           error:
//             "Password must be at least 8 characters.",
//         },
//         { status: 400 }
//       );
//     }

//     const passwordHash =
//       await hashPassword(password);

//     const result = await convex.mutation(
//       api.users.create,
//       {
//         name,
//         email,
//         passwordHash,
//       }
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         userId: result.userId,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Signup error:", error);

//     const message =
//       error instanceof Error
//         ? error.message
//         : "Unable to create account.";

//     return NextResponse.json(
//       { error: message },
//       { status: 400 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

async function hashPassword(password: string) {
  const encoder = new TextEncoder();

  const salt = crypto.getRandomValues(
    new Uint8Array(16)
  );

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 310000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

  const hash = Array.from(
    new Uint8Array(derivedBits)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");

  const saltHex = Array.from(salt)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");

  return `${saltHex}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    const referralCode = String(
      body.referralCode ?? ""
    )
      .trim()
      .toUpperCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const passwordHash =
      await hashPassword(password);

    const result = await convex.mutation(
      api.users.create,
      {
        name,
        email,
        passwordHash,
        referralCode:
          referralCode || undefined,
      }
    );

    return NextResponse.json(
      {
        success: true,
        userId: result.userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create account.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}