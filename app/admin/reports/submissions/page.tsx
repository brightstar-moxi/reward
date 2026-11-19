
"use client";

import { useEffect, useState } from "react";

type SubmissionReport = {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    rejectionRate: number;
  };
  recentSubmissions: {
    id: string;
    userName: string;
    userEmail: string;
    taskTitle: string;
    status: string;
    submittedAt: number;
    reviewedAt?: number;
    adminNote?: string;
  }[];
};

export default function SubmissionReportPage() {
  const [report, setReport] = useState<SubmissionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reports/submissions",
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
    return <div className="p-6">Loading submission report...</div>;
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

  const { summary, recentSubmissions } = report;

  const stats = [
    { label: "Total Submissions", value: summary.total },
    { label: "Pending", value: summary.pending },
    { label: "Approved", value: summary.approved },
    { label: "Rejected", value: summary.rejected },
    { label: "Approval Rate", value: `${summary.approvalRate}%` },
    { label: "Rejection Rate", value: `${summary.rejectionRate}%` },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Submission Reports</h1>
          <p className="text-sm text-gray-500">
            Overview of user task submissions and review results.
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
          <h2 className="font-semibold">Recent Submissions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Task</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Reviewed</th>
                <th className="p-4">Admin Note</th>
              </tr>
            </thead>

            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-t">
                    <td className="p-4">
                      <p className="font-medium">{submission.userName}</p>
                      <p className="text-xs text-gray-500">
                        {submission.userEmail}
                      </p>
                    </td>

                    <td className="p-4">{submission.taskTitle}</td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          submission.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : submission.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {submission.reviewedAt
                        ? new Date(submission.reviewedAt).toLocaleString()
                        : "Not reviewed"}
                    </td>

                    <td className="p-4">
                      {submission.adminNote || "—"}
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
