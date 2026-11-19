
"use client";

import { useEffect, useState } from "react";

type DailyActivityReport = {
  summary: {
    totalUsers: number;
    total: number;
    completed: number;
    inProgress: number;
    available: number;
    completionRate: number;
    journeyDays: number;
  };
  dailyBreakdown: {
    day: number;
    total: number;
    completed: number;
    inProgress: number;
    available: number;
    completionRate: number;
  }[];
};

export default function DailyActivityReportPage() {
  const [report, setReport] = useState<DailyActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reports/daily-activity",
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
    return <div className="p-6">Loading daily activity report...</div>;
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

  const { summary, dailyBreakdown } = report;

  const stats = [
    { label: "Total Users", value: summary.totalUsers },
    { label: "Activity Records", value: summary.total },
    { label: "Completed", value: summary.completed },
    { label: "In Progress", value: summary.inProgress },
    { label: "Available", value: summary.available },
    { label: "Completion Rate", value: `${summary.completionRate}%` },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Daily Activity Reports
          </h1>
          <p className="text-sm text-gray-500">
            Daily progress across the {summary.journeyDays}-day journey.
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

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Activity Breakdown by Day</h2>
          <p className="mt-1 text-sm text-gray-500">
            Activity records grouped by journey day.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Day</th>
                <th className="p-4">Total</th>
                <th className="p-4">Completed</th>
                <th className="p-4">In Progress</th>
                <th className="p-4">Available</th>
                <th className="p-4">Completion Rate</th>
              </tr>
            </thead>

            <tbody>
              {dailyBreakdown.map((day) => (
                <tr key={day.day} className="border-t">
                  <td className="p-4 font-medium">Day {day.day}</td>
                  <td className="p-4">{day.total}</td>
                  <td className="p-4 text-green-600">
                    {day.completed}
                  </td>
                  <td className="p-4 text-blue-600">
                    {day.inProgress}
                  </td>
                  <td className="p-4 text-yellow-600">
                    {day.available}
                  </td>
                  <td className="p-4">{day.completionRate}%</td>
                </tr>
              ))}

              {dailyBreakdown.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No daily activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
