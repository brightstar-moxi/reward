
// "use client";

// import {
//   Menu,
//   Bell,
//   UserCircle,
// } from "lucide-react";
// import { useState } from "react";

// export default function DashboardHeader() {
//   const [sidebarOpen, setSidebarOpen] =
//     useState(false);

//   return (
//     <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
//       <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         <button
//           type="button"
//           onClick={() => setSidebarOpen(true)}
//           className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
//           aria-label="Open dashboard menu"
//         >
//           <Menu size={22} />
//         </button>

//         <div className="hidden lg:block">
//           <h1 className="text-lg font-semibold text-gray-900">
//             Dashboard
//           </h1>
//         </div>

//         <div className="ml-auto flex items-center gap-3">
//           <button
//             type="button"
//             className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
//             aria-label="Notifications"
//           >
//             <Bell size={20} />

//             <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
//           </button>

//           <button
//             type="button"
//             className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
//           >
//             <UserCircle
//               size={30}
//               className="text-gray-400"
//             />

//             <span className="hidden text-sm font-medium text-gray-700 sm:block">
//               Account
//             </span>
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

// "use client";

// import {
//   Menu,
//   Bell,
//   UserCircle,
// } from "lucide-react";

// interface DashboardHeaderProps {
//   onMenuClick: () => void;
// }

// export default function DashboardHeader({
//   onMenuClick,
// }: DashboardHeaderProps) {
//   return (
//     <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
//       <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         <button
//           type="button"
//           onClick={onMenuClick}
//           className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
//           aria-label="Open dashboard menu"
//         >
//           <Menu size={22} />
//         </button>

//         <div className="hidden lg:block">
//           <h1 className="text-lg font-semibold text-gray-900">
//             Dashboard
//           </h1>
//         </div>

//         <div className="ml-auto flex items-center gap-3">
//           <button
//             type="button"
//             className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
//             aria-label="Notifications"
//           >
//             <Bell size={20} />

//             <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
//           </button>

//           <button
//             type="button"
//             className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
//           >
//             <UserCircle
//               size={30}
//               className="text-gray-400"
//             />

//             <span className="hidden text-sm font-medium text-gray-700 sm:block">
//               Account
//             </span>
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }





"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Bell,
  UserCircle,
  X,
  Megaphone,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);

  const announcements = useQuery(
    api.adminContent.getPublishedAnnouncements,
    {}
  );

  const hasAnnouncements =
    announcements !== undefined && announcements.length > 0;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
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
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((open) => !open)}
              className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
            >
              <Bell size={20} />

              {hasAnnouncements && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
              )}
            </button>

            {notificationOpen && (
              // <div className="absolute right-0 top-full z-50 mt-3 w-[min(90vw,24rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
               <div className="fixed left-1/2 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 sm:translate-x-0">
               <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close notifications"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {announcements === undefined ? (
                    <p className="p-5 text-center text-sm text-gray-500">
                      Loading notifications...
                    </p>
                  ) : announcements.length === 0 ? (
                    <p className="p-5 text-center text-sm text-gray-500">
                      You have no notifications.
                    </p>
                  ) : (
                    announcements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className="border-b border-gray-100 p-4 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-green-50 p-2 text-green-600">
                            <Megaphone size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {announcement.title}
                            </h4>

                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                              {announcement.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* <button
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
          </button> */}
          <Link
  href="/dashboard/profile"
  className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
  aria-label="My Profile"
>
  <UserCircle size={30} className="text-gray-400" />
  <span className="hidden text-sm font-medium text-gray-700 sm:block">
    Account
  </span>
</Link>
        </div>
      </div>
    </header>
  );
}
