
"use client";

import { useEffect, useState } from "react";

type UserGrowthReport = {
  summary: {
    totalUsers: number;
    registrationsToday: number;
    registrationsThisMonth: number;
    activeUsers: number;
    suspendedUsers: number;
  };
  dailyRegistrations: {
    date: string;
    registrations: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: number;
  }[];
};

export default function UserGrowthReportPage() {
  const [report, setReport] = useState<UserGrowthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reports/user-growth",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load report");
      }

      setReport(data.reports);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return <div className="p-6">Loading user growth report...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadReport}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!report) return null;

  const { summary, dailyRegistrations, recentUsers } = report;

  const stats = [
    { label: "Total Users", value: summary.totalUsers },
    { label: "Registered Today", value: summary.registrationsToday },
    { label: "Registered This Month", value: summary.registrationsThisMonth },
    { label: "Active Users", value: summary.activeUsers },
    { label: "Suspended Users", value: summary.suspendedUsers },
  ];

  const maxRegistrations = Math.max(
    1,
    ...dailyRegistrations.map((day) => day.registrations)
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Growth Report</h1>
          <p className="text-sm text-gray-500">
            Registration trends and user growth over time.
          </p>
        </div>

        <button
          onClick={loadReport}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Daily Registrations — Last 30 Days
        </h2>

        <div className="mt-6 space-y-3">
          {dailyRegistrations.map((day) => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-gray-500">
                {day.date}
              </span>

              <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
                <div
                  className="h-full rounded bg-blue-600"
                  style={{
                    width: `${
                      (day.registrations / maxRegistrations) * 100
                    }%`,
                  }}
                />
              </div>

              <span className="w-8 text-right text-sm font-medium">
                {day.registrations}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Recently Registered Users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registration Date</th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



