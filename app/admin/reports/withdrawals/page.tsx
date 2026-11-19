
"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Banknote,
} from "lucide-react";

type WithdrawalReport = {
  summary: {
    totalRequests: number;
    pending: number;
    processing: number;
    paid: number;
    rejected: number;
    totalRequested: number;
    totalPaid: number;
    totalPending: number;
    totalProcessing: number;
    totalRejected: number;
    averageWithdrawal: number;
  };
  withdrawals: {
    id: string;
    userName: string;
    userEmail: string;
    amount: number;
    status: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    paymentReference?: string;
    requestedAt: number;
    paidAt?: number;
  }[];
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleString("en-NG");
};

export default function WithdrawalReportsPage() {
  const [report, setReport] = useState<WithdrawalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reports/withdrawals", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load withdrawal report.");
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
        Loading withdrawal reports...
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

  const { summary, withdrawals } = report;

  const cards = [
    { title: "Total Requests", value: summary.totalRequests, icon: Wallet },
    { title: "Pending", value: summary.pending, icon: Clock },
    { title: "Processing", value: summary.processing, icon: Banknote },
    { title: "Paid", value: summary.paid, icon: CheckCircle },
    { title: "Rejected", value: summary.rejected, icon: XCircle },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Withdrawal Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor withdrawal requests, payments, and outstanding amounts.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Requested", summary.totalRequested],
          ["Total Paid", summary.totalPaid],
          ["Pending Amount", summary.totalPending],
          ["Average Withdrawal", summary.averageWithdrawal],
        ].map(([title, amount]) => (
          <div key={title} className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-2 text-xl font-bold">
              {formatMoney(Number(amount))}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Withdrawal History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Bank</th>
                <th className="p-3">Account Name</th>
                <th className="p-3">Account Number</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Paid At</th>
                <th className="p-3">Payment Reference</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{withdrawal.userName}</p>
                    <p className="text-xs text-gray-500">
                      {withdrawal.userEmail}
                    </p>
                  </td>
                  <td className="p-3 font-medium">
                    {formatMoney(withdrawal.amount)}
                  </td>
                  <td className="p-3">{withdrawal.bankName}</td>
                  <td className="p-3">{withdrawal.accountName}</td>
                  <td className="p-3">{withdrawal.accountNumber}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-700">
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {formatDate(withdrawal.requestedAt)}
                  </td>
                  <td className="p-3">
                    {formatDate(withdrawal.paidAt)}
                  </td>
                  <td className="p-3">
                    {withdrawal.paymentReference || "—"}
                  </td>
                </tr>
              ))}

              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    No withdrawal records found.
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
