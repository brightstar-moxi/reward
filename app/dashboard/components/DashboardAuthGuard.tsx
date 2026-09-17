
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  referralCode: string;
}

export default function DashboardAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!data.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
}
