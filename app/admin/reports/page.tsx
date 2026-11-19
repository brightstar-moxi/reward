
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  FileCheck,
  Coins,
  Wallet,
  ArrowDownToLine,
  RefreshCw,
} from "lucide-react";

type ReportsData = {
  users: {
    total: number;
    active: number;
    suspended: number;
    referred: number;
  };
  tasks: {
    total: number;
    active: number;
  };
  submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  rewards: {
    totalIssued: number;
    transactions: number;
  };
  wallets: {
    total: number;
    totalBalance: number;
    totalEarned: number;
  };
  withdrawals: {
    total: number;
    pending: number;
    processing: number;
    paid: number;
    rejected: number;
    totalPaid: number;
  };
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-NG").format(value);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon size={20} className="text-green-600" />
      </div>

      <h3 className="mt-3 text-2xl font-bold text-gray-900">
        {value}
      </h3>

      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">
        {formatNumber(value)}
      </span>
    </div>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reports", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load reports.");
      }

      setReports(data.reports);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  if (error || !reports) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">
          {error || "Reports are unavailable."}
        </p>

        <button
          onClick={loadReports}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your platform's users, activities and finances.
          </p>
        </div>

        <button
          onClick={loadReports}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* User statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          User Statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Users" value={formatNumber(reports.users.total)} icon={Users} />
          <StatCard title="Active Users" value={formatNumber(reports.users.active)} icon={UserCheck} />
          <StatCard title="Suspended Users" value={formatNumber(reports.users.suspended)} icon={UserX} />
          <StatCard title="Referred Users" value={formatNumber(reports.users.referred)} icon={Users} />
        </div>
      </section>

      {/* Task and submission statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Task and Submission Statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Tasks" value={formatNumber(reports.tasks.total)} icon={ClipboardList} />
          <StatCard title="Active Tasks" value={formatNumber(reports.tasks.active)} icon={ClipboardList} />
          <StatCard title="Total Submissions" value={formatNumber(reports.submissions.total)} icon={FileCheck} />
          <StatCard title="Pending Submissions" value={formatNumber(reports.submissions.pending)} icon={FileCheck} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">Submission Status</h3>
            <div className="mt-2">
              <StatusRow label="Approved" value={reports.submissions.approved} />
              <StatusRow label="Rejected" value={reports.submissions.rejected} />
              <StatusRow label="Pending" value={reports.submissions.pending} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">Reward Statistics</h3>
            <div className="mt-2">
              <StatusRow label="Reward transactions" value={reports.rewards.transactions} />
              <StatusRow label="Total rewards issued" value={reports.rewards.totalIssued} />
            </div>
          </div>
        </div>
      </section>

      {/* Financial statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Financial Statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Wallet Balance"
            value={formatMoney(reports.wallets.totalBalance)}
            icon={Wallet}
          />
          <StatCard
            title="Total Earned"
            value={formatMoney(reports.wallets.totalEarned)}
            icon={Coins}
          />
          <StatCard
            title="Total Rewards Issued"
            value={formatMoney(reports.rewards.totalIssued)}
            icon={Coins}
          />
          <StatCard
            title="Total Paid Withdrawals"
            value={formatMoney(reports.withdrawals.totalPaid)}
            icon={ArrowDownToLine}
          />
          <StatCard
            title="Total Wallets"
            value={formatNumber(reports.wallets.total)}
            icon={Wallet}
          />
          <StatCard
            title="Total Withdrawal Requests"
            value={formatNumber(reports.withdrawals.total)}
            icon={ArrowDownToLine}
          />
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900">
            Withdrawal Status
          </h3>

          <div className="mt-2">
            <StatusRow label="Pending" value={reports.withdrawals.pending} />
            <StatusRow label="Processing" value={reports.withdrawals.processing} />
            <StatusRow label="Paid" value={reports.withdrawals.paid} />
            <StatusRow label="Rejected" value={reports.withdrawals.rejected} />
          </div>
        </div>
      </section>
    </div>
  );
}
