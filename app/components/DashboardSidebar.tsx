
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  Users,
  Banknote,
  Settings,
  X,
  User
} from "lucide-react";
import LogoutButton from "./auth/LogoutButton";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
   {
  name: "Profile",
  href: "/dashboard/profile",
  icon: User,
},
  {
    name: "Daily Tasks",
    href: "/dashboard/tasks",
    icon: ListChecks,
  },
  {
    name: "My Earnings",
    href: "/dashboard/earnings",
    icon: Wallet,
  },
  {
    name: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
  },
  {
    name: "Withdraw",
    href: "/dashboard/withdraw",
    icon: Banknote,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
 
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({
  open = false,
  onClose,
}: DashboardSidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-64
          border-r
          border-gray-200
          bg-white
          transition-transform
          duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-5">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-green-600"
            >
              Reward<span className="text-gray-900">Hub</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-600"
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
<LogoutButton/>
          <div className="border-t p-4">
            <p className="text-xs text-gray-400">
              RewardHub
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Complete tasks. Earn rewards.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
