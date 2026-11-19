
"use client";

import { useEffect, useState } from "react";

type RewardDistributionReport = {
  summary: {
    totalRewards: number;
    totalTransactions: number;
    averageReward: number;
    rewardsLast30Days: number;
    transactionsLast30Days: number;
  };
  taskDistribution: {
    taskId: string;
    taskTitle: string;
    count: number;
    amount: number;
  }[];
  recentPayments: {
    id: string;
    userName: string;
    userEmail: string;
    taskTitle: string;
    amount: number;
    description: string;
    createdAt: number;
  }[];
};

const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;

export default function RewardDistributionReportPage() {
  const [report, setReport] =
    useState<RewardDistributionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reports/reward-distribution",
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
    return <div className="p-6">Loading reward distribution report...</div>;
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

  const { summary, taskDistribution, recentPayments } = report;

  const stats = [
    { label: "Total Rewards Paid", value: formatNaira(summary.totalRewards) },
    { label: "Reward Transactions", value: summary.totalTransactions },
    { label: "Average Reward", value: formatNaira(summary.averageReward) },
    { label: "Rewards in Last 30 Days", value: formatNaira(summary.rewardsLast30Days) },
    { label: "Transactions in Last 30 Days", value: summary.transactionsLast30Days },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Reward Distribution Report
          </h1>
          <p className="text-sm text-gray-500">
            Track reward payments and their distribution across tasks.
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
          <h2 className="font-semibold">Rewards by Task</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Task</th>
                <th className="p-4">Transactions</th>
                <th className="p-4">Total Rewards</th>
              </tr>
            </thead>
            <tbody>
              {taskDistribution.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">
                    No reward distributions found.
                  </td>
                </tr>
              ) : (
                taskDistribution.map((item) => (
                  <tr key={item.taskId} className="border-t">
                    <td className="p-4 font-medium">{item.taskTitle}</td>
                    <td className="p-4">{item.count}</td>
                    <td className="p-4 font-semibold">
                      {formatNaira(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Recent Reward Payments</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Task / Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No reward payments found.
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-t">
                    <td className="p-4">
                      <p className="font-medium">{payment.userName}</p>
                      <p className="text-xs text-gray-500">
                        {payment.userEmail}
                      </p>
                    </td>
                    <td className="p-4">{payment.taskTitle}</td>
                    <td className="p-4 font-semibold">
                      {formatNaira(payment.amount)}
                    </td>
                    <td className="p-4">
                      {new Date(payment.createdAt).toLocaleString()}
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
