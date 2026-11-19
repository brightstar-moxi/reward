
"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  Gift,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

type WalletReport = {
  summary: {
    totalWallets: number;
    totalBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    totalTransactions: number;
    rewards: { count: number; amount: number };
    withdrawals: { count: number; amount: number };
    penalties: { count: number; amount: number };
    refunds: { count: number; amount: number };
  };
  recentTransactions: {
    id: string;
    userName: string;
    userEmail: string;
    type: string;
    amount: number;
    description: string;
    reference?: string;
    createdAt: number;
  }[];
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString("en-NG");

export default function WalletReportsPage() {
  const [report, setReport] = useState<WalletReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reports/wallet", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load wallet report.");
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
    return <div className="p-6 text-gray-500">Loading wallet reports...</div>;
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

  const { summary, recentTransactions } = report;

  const cards = [
    { title: "Total Wallets", value: summary.totalWallets, icon: Wallet },
    { title: "Total Transactions", value: summary.totalTransactions, icon: TrendingUp },
    { title: "Total Balance", value: formatMoney(summary.totalBalance), icon: Wallet },
    { title: "Total Earned", value: formatMoney(summary.totalEarned), icon: Gift },
    { title: "Total Withdrawn", value: formatMoney(summary.totalWithdrawn), icon: ArrowDownCircle },
  ];

  const transactionTypes = [
    {
      title: "Rewards",
      data: summary.rewards,
      icon: Gift,
    },
    {
      title: "Withdrawals",
      data: summary.withdrawals,
      icon: ArrowDownCircle,
    },
    {
      title: "Penalties",
      data: summary.penalties,
      icon: AlertTriangle,
    },
    {
      title: "Refunds",
      data: summary.refunds,
      icon: RotateCcw,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Wallet Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor wallet balances and financial transactions.
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
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Transaction Breakdown
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {transactionTypes.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.title}</p>
                  <Icon size={20} className="text-blue-600" />
                </div>
                <p className="mt-3 text-xl font-bold">
                  {formatMoney(item.data.amount)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.data.count.toLocaleString()} transactions
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Recent Wallet Transactions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Description</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{transaction.userName}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.userEmail}
                    </p>
                  </td>
                  <td className="p-3 capitalize">{transaction.type}</td>
                  <td className="p-3 font-medium">
                    {formatMoney(transaction.amount)}
                  </td>
                  <td className="p-3">{transaction.description}</td>
                  <td className="p-3">
                    {transaction.reference || "—"}
                  </td>
                  <td className="p-3">
                    {formatDate(transaction.createdAt)}
                  </td>
                </tr>
              ))}

              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No wallet transactions found.
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
