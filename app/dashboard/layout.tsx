
// import DashboardSidebar from "../components/DashboardSidebar";
// import DashboardHeader from "../components/DashboardHeader";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <DashboardSidebar />

//       <div className="lg:pl-64">
//         <DashboardHeader />

//         <main className="p-4 sm:p-6 lg:p-8">
//           {children}
//         </main>
//       </div>
//     </div>
//   );




"use client";

import { useState } from "react";

import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}