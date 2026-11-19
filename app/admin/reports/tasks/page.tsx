
"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ListTodo, CheckCircle, Clock, XCircle, Wallet } from "lucide-react";

type TaskReport = {
  summary: {
    totalTasks: number;
    activeTasks: number;
    inactiveTasks: number;
    totalSubmissions: number;
    approved: number;
    pending: number;
    rejected: number;
    totalRewardsPaid: number;
  };
  tasks: {
    taskId: string;
    title: string;
    day: number;
    reward: number;
    isActive: boolean;
    totalSubmissions: number;
    approved: number;
    pending: number;
    rejected: number;
    totalRewards: number;
  }[];
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TaskPerformanceReportsPage() {
  const [report, setReport] = useState<TaskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reports/tasks", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load task report.");
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
    return <div className="p-6 text-gray-500">Loading task reports...</div>;
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

  const { summary, tasks } = report;

  const cards = [
    { title: "Total Tasks", value: summary.totalTasks, icon: ListTodo },
    { title: "Active Tasks", value: summary.activeTasks, icon: CheckCircle },
    { title: "Total Submissions", value: summary.totalSubmissions, icon: Clock },
    { title: "Approved", value: summary.approved, icon: CheckCircle },
    { title: "Pending", value: summary.pending, icon: Clock },
    { title: "Rejected", value: summary.rejected, icon: XCircle },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Task Performance Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor task activity, submissions, and reward payments.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Tasks</p>
          <p className="mt-2 text-2xl font-bold">
            {summary.inactiveTasks}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wallet size={18} />
            Total Rewards Paid
          </div>
          <p className="mt-2 text-2xl font-bold">
            {formatMoney(summary.totalRewardsPaid)}
          </p>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Individual Task Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Task</th>
                <th className="p-3">Day</th>
                <th className="p-3">Reward</th>
                <th className="p-3">Submissions</th>
                <th className="p-3">Approved</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Rejected</th>
                <th className="p-3">Rewards Paid</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.taskId} className="border-b">
                  <td className="p-3 font-medium">{task.title}</td>
                  <td className="p-3">{task.day}</td>
                  <td className="p-3">{formatMoney(task.reward)}</td>
                  <td className="p-3">{task.totalSubmissions}</td>
                  <td className="p-3 text-green-600">{task.approved}</td>
                  <td className="p-3 text-yellow-600">{task.pending}</td>
                  <td className="p-3 text-red-600">{task.rejected}</td>
                  <td className="p-3">{formatMoney(task.totalRewards)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        task.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
