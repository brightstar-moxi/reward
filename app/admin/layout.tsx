// "use client";

// import { ReactNode, useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";

// type CurrentUser = {
//   id: string;
//   name: string;
//   email: string;
//   role: "user" | "admin";
//   status: "active" | "suspended";
// };

// export default function AdminLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();

//   const [user, setUser] =
//     useState<CurrentUser | null>(null);

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     /*
//      * Don't protect the admin login page.
//      */
//     if (pathname === "/admin/login") {
//       setLoading(false);
//       return;
//     }

//     const checkAdmin = async () => {
//       try {
//         const response = await fetch(
//           "/api/auth/me",
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//           }
//         );

//         if (!response.ok) {
//           router.replace("/admin/login");
//           return;
//         }

//         const data = await response.json();

//         if (!data.user) {
//           router.replace("/admin/login");
//           return;
//         }

//         if (data.user.role !== "admin") {
//           router.replace("/dashboard");
//           return;
//         }

//         if (data.user.status !== "active") {
//           router.replace("/admin/login");
//           return;
//         }

//         setUser(data.user);
//       } catch (error) {
//         console.error(
//           "Admin authentication error:",
//           error
//         );

//         router.replace("/admin/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAdmin();
//   }, [pathname, router]);

//   /*
//    * Admin login should render normally.
//    */
//   if (pathname === "/admin/login") {
//     return <>{children}</>;
//   }

//   /*
//    * While checking authentication.
//    */
//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

//           <p className="mt-4 text-sm text-gray-500">
//             Checking admin access...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /*
//    * Don't render protected pages until
//    * the admin has been verified.
//    */
//   if (!user || user.role !== "admin") {
//     return null;
//   }

//   return <>{children}</>;
// }




"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
};

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Tasks", href: "/admin/tasks" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Rewards", href: "/admin/rewards" },
  { label: "Referrals", href: "/admin/referrals" },
  { label: "Wallet", href: "/admin/wallet" },
  { label: "Withdrawals", href: "/admin/withdrawals" },
  { label: "Content", href: "/admin/content" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

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
        console.error("Admin authentication error:", error);
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

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

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <Link href="/admin" className="text-lg font-bold text-gray-900">
          Admin Panel
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700"
        >
          {sidebarOpen ? "Close Menu" : "Menu"}
        </button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b px-6 py-6">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            Admin Panel
          </Link>
          <p className="mt-1 text-xs text-gray-500">
            Giveaway Platform
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          {adminLinks.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-5 py-4">
          <p className="truncate text-sm font-semibold text-gray-800">
            {user.name}
          </p>
          <p className="truncate text-xs text-gray-500">
            {user.email}
          </p>
          <p className="mt-2 text-xs font-medium text-green-700">
            Administrator
          </p>
        </div>
      </aside>

      {/* Main Content */}
     <main className="min-h-screen min-w-0 w-full pl-0 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
