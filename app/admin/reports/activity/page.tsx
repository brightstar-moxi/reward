
"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
  Trophy,
} from "lucide-react";

type ActivityReport = {
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    startedUsers: number;
    usersNotStarted: number;
    totalCompletedDays: number;
    averageCompletedDays: number;
    completedJourney: number;
    journeyDays: number;
  };
  topUsers: {
    userId: string;
    name: string;
    email: string;
    status: string;
    completedDays: number;
    started: boolean;
    progressPercentage: number;
    completedJourney: boolean;
  }[];
};

export default function UserActivityReportsPage() {
  const [report, setReport] = useState<ActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reports/activity", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load activity report.");
      }

      setReport(data.report);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading user activity reports...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">
          {error || "No report data available."}
        </p>
        <button
          onClick={loadReport}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, topUsers } = report;

  const cards = [
    { title: "Total Users", value: summary.totalUsers, icon: Users },
    { title: "Active Users", value: summary.activeUsers, icon: UserCheck },
    { title: "Suspended Users", value: summary.suspendedUsers, icon: UserX },
    { title: "Started Journey", value: summary.startedUsers, icon: CalendarCheck },
    { title: "Completed Journey", value: summary.completedJourney, icon: Trophy },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            User Activity Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor user participation and progress through the daily journey.
          </p>
        </div>

        <button
          onClick={loadReport}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{card.title}</p>
                <Icon size={20} className="text-blue-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Users Not Started</p>
          <p className="mt-2 text-2xl font-bold">
            {summary.usersNotStarted}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Completed Days</p>
          <p className="mt-2 text-2xl font-bold">
            {summary.totalCompletedDays.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Average Completed Days</p>
          <p className="mt-2 text-2xl font-bold">
            {summary.averageCompletedDays}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Journey Progress</h2>
          <p className="mt-1 text-sm text-gray-500">
            Current journey length: {summary.journeyDays} days
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Completed Days</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Journey Status</th>
              </tr>
            </thead>

            <tbody>
              {topUsers.map((user) => (
                <tr key={user.userId} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>

                  <td className="p-3 capitalize">{user.status}</td>

                  <td className="p-3">
                    {user.completedDays}/{summary.journeyDays}
                  </td>

                  <td className="min-w-40 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${user.progressPercentage}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {user.progressPercentage}%
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.completedJourney
                          ? "bg-green-100 text-green-700"
                          : user.started
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.completedJourney
                        ? "Completed"
                        : user.started
                          ? "In Progress"
                          : "Not Started"}
                    </span>
                  </td>
                </tr>
              ))}

              {topUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No user activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Showing the top 20 users by completed days.
        </p>
      </section>
    </div>
  );
}
