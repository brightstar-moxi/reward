
"use client";

import {
  Menu,
  Bell,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

export default function DashboardHeader() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open dashboard menu"
        >
          <Menu size={22} />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900">
            Dashboard
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
          >
            <UserCircle
              size={30}
              className="text-gray-400"
            />

            <span className="hidden text-sm font-medium text-gray-700 sm:block">
              Account
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

