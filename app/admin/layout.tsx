"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*
     * Don't protect the admin login page.
     */
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!data.user) {
          router.replace("/admin/login");
          return;
        }

        if (data.user.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        if (data.user.status !== "active") {
          router.replace("/admin/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(
          "Admin authentication error:",
          error
        );

        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [pathname, router]);

  /*
   * Admin login should render normally.
   */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  /*
   * While checking authentication.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="mt-4 text-sm text-gray-500">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Don't render protected pages until
   * the admin has been verified.
   */
  if (!user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}