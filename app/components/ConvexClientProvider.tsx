
// "use client";

// import { ConvexReactClient } from "convex/react";
// import { ConvexProvider } from "convex/react";
// import { ReactNode, useMemo } from "react";

// interface ConvexClientProviderProps {
//   children: ReactNode;
// }

// export default function ConvexClientProvider({
//   children,
// }: ConvexClientProviderProps) {
//   const convex = useMemo(() => {
//     const url = process.env.NEXT_PUBLIC_CONVEX_URL;

//     if (!url) {
//       throw new Error(
//         "NEXT_PUBLIC_CONVEX_URL is not configured."
//       );
//     }

//     return new ConvexReactClient(url);
//   }, []);

//   return (
//     <ConvexProvider client={convex}>
//       {children}
//     </ConvexProvider>
//   );
// }

// "use client";

// import { ConvexReactClient } from "convex/react";
// import { ConvexAuthProvider } from "@convex-dev/auth/react";
// import { ReactNode, useMemo } from "react";

// interface ConvexClientProviderProps {
//   children: ReactNode;
// }

// export default function ConvexClientProvider({
//   children,
// }: ConvexClientProviderProps) {
//   const convex = useMemo(() => {
//     const url = process.env.NEXT_PUBLIC_CONVEX_URL;

//     if (!url) {
//       throw new Error(
//         "NEXT_PUBLIC_CONVEX_URL is not configured."
//       );
//     }

//     return new ConvexReactClient(url);
//   }, []);

//   return (
//     <ConvexAuthProvider client={convex}>
//       {children}
//     </ConvexAuthProvider>
//   );
// }


"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

interface Props {
  children: ReactNode;
}

export default function ConvexClientProvider({
  children,
}: Props) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
    }

    return new ConvexReactClient(url);
  }, []);

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}