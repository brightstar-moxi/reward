
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";


type AdminReports = {
  users: {
    total: number;
    active: number;
    suspended: number;
    referred: number;
  };

  recentUsers: {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}[];

recentTransactions: {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: number;
}[];
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
  dailyLogin: {
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

  dailyAnalytics: {
  date: string;
  registrations: number;
  rewards: number;
  withdrawals: number;
}[];
};

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
;
const [refreshKey, setRefreshKey] = useState(0);;


  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("/api/admin/reports", {
          cache: "no-store",
        });

        const data = await response.json();
        console.log("Daily Analytics:", data.reports?.dailyAnalytics);

        if (!response.ok) {
          throw new Error(data.error || "Failed to load dashboard.");
        }

        setReports(data.reports);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [refreshKey]);

  if (loading) {
    return <div className="p-6">Loading admin dashboard...</div>;
  }

  if (error || !reports) {
    return (
      <div className="p-6 text-red-600">
        {error || "Unable to load dashboard."}
      </div>
    );
  }

  const statistics = [
    {
      title: "Total Users",
      value: reports.users.total.toLocaleString(),
      detail: `${reports.users.active} active users`,
    },
    {
      title: "Suspended Users",
      value: reports.users.suspended.toLocaleString(),
      detail: "Suspended accounts",
    },
    {
      title: "Total Tasks",
      value: reports.tasks.total.toLocaleString(),
      detail: `${reports.tasks.active} active tasks`,
    },
    {
      title: "Pending Submissions",
      value: reports.submissions.pending.toLocaleString(),
      detail: `${reports.submissions.approved} approved`,
    },
    {
      title: "Pending Daily Login Claims",
      value: reports.dailyLogin.pending.toLocaleString(),
      detail: `${reports.dailyLogin.approved} approved`,
    },
    {
      title: "Pending Withdrawals",
      value: reports.withdrawals.pending.toLocaleString(),
      detail: `${reports.withdrawals.processing} processing`,
    },
    {
      title: "Total Rewards Issued",
      value: formatNaira(reports.rewards.totalIssued),
      detail: `${reports.rewards.transactions} transactions`,
    },
    {
      title: "Total Wallet Balance",
      value: formatNaira(reports.wallets.totalBalance),
      detail: `${reports.wallets.total} wallets`,
    },
    {
      title: "Total Withdrawn",
      value: formatNaira(reports.withdrawals.totalPaid),
      detail: `${reports.withdrawals.paid} paid withdrawals`,
    },
  ];

  return (
    <div className="space-y-8 p-6">
     <div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      Admin Dashboard
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      Overview of your giveaway platform.
    </p>
  </div>

  <button
    onClick={() => {
      setLoading(true);
      setError("");
      setRefreshKey((current) => current + 1);
    }}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  >
    Refresh Dashboard
  </button>
</div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {statistics.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {item.title}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {item.value}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {item.detail}
            </p>
          </div>
        ))}
      </div>



{/* Financial Overview */}
<section className="space-y-4">
  <div>
    <h2 className="text-lg font-bold text-gray-900">
      Financial Overview
    </h2>
    <p className="text-sm text-gray-500">
      Summary of platform reward and withdrawal activity.
    </p>
  </div>

  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
    {[
      {
        title: "Total Earned by Users",
        value: reports.wallets.totalEarned,
      },
      {
        title: "Available Wallet Balance",
        value: reports.wallets.totalBalance,
      },
      {
        title: "Total Rewards Issued",
        value: reports.rewards.totalIssued,
      },
      {
        title: "Withdrawals Paid",
        value: reports.withdrawals.totalPaid,
      },
    ].map((item) => (
      <div
        key={item.title}
        className="rounded-xl border border-gray-200 bg-white p-5"
      >
        <p className="text-sm text-gray-500">{item.title}</p>
        <h3 className="mt-3 text-xl font-bold text-gray-900">
          {formatNaira(item.value)}
        </h3>
      </div>
    ))}
  </div>
</section>




{/* Quick Navigation */}
<section className="space-y-4">
  <div>
    <h2 className="text-lg font-bold text-gray-900">
      Quick Navigation
    </h2>
    <p className="text-sm text-gray-500">
      Quickly access your administration modules.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[
      { title: "Manage Users", href: "/admin/users" },
      { title: "Manage Tasks", href: "/admin/tasks" },
      { title: "Task Submissions", href: "/admin/submissions" },
      { title: "Daily Login Claims", href: "/admin/submissions" },
      { title: "Wallet Management", href: "/admin/wallet" },
      { title: "Withdrawals", href: "/admin/withdrawals" },
      { title: "Referrals", href: "/admin/referrals" },
      { title: "Rewards", href: "/admin/rewards" },
      { title: "Reports", href: "/admin/reports" },
      { title: "Content Management", href: "/admin/content" },
      { title: "Platform Settings", href: "/admin/settings" },
    ].map((item) => (
      <Link
        key={item.title}
        href={item.href}
        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm"
      >
        <span className="font-medium text-gray-800">
          {item.title}
        </span>
        <span className="text-gray-400">→</span>
      </Link>
    ))}
  </div>
</section>


{/* Platform Activity Summary */}
<section className="space-y-4">
  <div>
    <h2 className="text-lg font-bold text-gray-900">
      Platform Activity Summary
    </h2>
    <p className="text-sm text-gray-500">
      Current review and processing activity.
    </p>
  </div>

  <div className="grid gap-5 sm:grid-cols-3">
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">
        Task Submissions
      </p>
      <h3 className="mt-2 text-2xl font-bold text-gray-900">
        {reports.submissions.total}
      </h3>
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-yellow-600">
          Pending: {reports.submissions.pending}
        </span>
        <span className="text-green-600">
          Approved: {reports.submissions.approved}
        </span>
      </div>
      <p className="mt-1 text-xs text-red-600">
        Rejected: {reports.submissions.rejected}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">
        Daily Login Claims
      </p>
      <h3 className="mt-2 text-2xl font-bold text-gray-900">
        {reports.dailyLogin.total}
      </h3>
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-yellow-600">
          Pending: {reports.dailyLogin.pending}
        </span>
        <span className="text-green-600">
          Approved: {reports.dailyLogin.approved}
        </span>
      </div>
      <p className="mt-1 text-xs text-red-600">
        Rejected: {reports.dailyLogin.rejected}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">
        Withdrawals
      </p>
      <h3 className="mt-2 text-2xl font-bold text-gray-900">
        {reports.withdrawals.total}
      </h3>
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-yellow-600">
          Pending: {reports.withdrawals.pending}
        </span>
        <span className="text-green-600">
          Paid: {reports.withdrawals.paid}
        </span>
      </div>
      <p className="mt-1 text-xs text-blue-600">
        Processing: {reports.withdrawals.processing}
      </p>
    </div>
  </div>
</section>


{/* Recent Activity */}
<section className="grid gap-6 lg:grid-cols-2">
  {/* Recent Registrations */}
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <div className="mb-5">
      <h2 className="text-lg font-bold text-gray-900">
        Recent Registrations
      </h2>
      <p className="text-sm text-gray-500">
        Latest users to join the platform.
      </p>
    </div>

    <div className="space-y-4">
      {reports.recentUsers.length === 0 ? (
        <p className="text-sm text-gray-500">
          No registered users yet.
        </p>
      ) : (
        reports.recentUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user.email}
              </p>
            </div>

            <p className="shrink-0 text-xs text-gray-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>

  {/* Recent Transactions */}
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <div className="mb-5">
      <h2 className="text-lg font-bold text-gray-900">
        Recent Transactions
      </h2>
      <p className="text-sm text-gray-500">
        Latest wallet transactions.
      </p>
    </div>

    <div className="space-y-4">
      {reports.recentTransactions.length === 0 ? (
        <p className="text-sm text-gray-500">
          No transactions yet.
        </p>
      ) : (
        reports.recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {transaction.description}
              </p>
              <p className="text-xs capitalize text-gray-500">
                {transaction.type.replace("_", " ")}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(transaction.createdAt).toLocaleString()}
              </p>
            </div>

            <p className="shrink-0 text-sm font-bold text-gray-900">
              {formatNaira(transaction.amount)}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
</section>




{/* Platform Analytics */}
<section className="space-y-5">
  <div>
    <h2 className="text-lg font-bold text-gray-900">
      Platform Analytics
    </h2>
    <p className="text-sm text-gray-500">
      Platform performance over the last 7 days.
    </p>
  </div>

  {/* User Registration Growth */}
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <h3 className="mb-5 font-semibold text-gray-900">
      User Registration Growth
    </h3>

    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={reports.dailyAnalytics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => value.slice(5)}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="registrations"
            name="New Users"
            stroke="#2563eb"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="grid gap-5 lg:grid-cols-2">
    {/* Daily Rewards */}
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-5 font-semibold text-gray-900">
        Daily Rewards Issued
      </h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reports.dailyAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis tickFormatter={(value) => `₦${value}`} />
            <Tooltip />
            <Bar
              dataKey="rewards"
              name="Rewards"
              fill="#16a34a"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Daily Withdrawals */}
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-5 font-semibold text-gray-900">
        Daily Withdrawals Paid
      </h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reports.dailyAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis tickFormatter={(value) => `₦${value}`} />
            <Tooltip />
            <Bar
              dataKey="withdrawals"
              name="Withdrawals"
              fill="#d97706"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</section>


    </div>
  );
}
