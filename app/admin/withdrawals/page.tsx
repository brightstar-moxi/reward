// "use client";

// import { useState } from "react";
// import {
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Wallet,
//   Search,
// } from "lucide-react";

// const filters = [
//   "All",
//   "Pending",
//   "Processing",
//   "Paid",
//   "Rejected",
// ];

// export default function AdminWithdrawalsPage() {
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [search, setSearch] = useState("");

//   return (
//     <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8">
//           <p className="text-sm font-medium text-blue-600">
//             Administration
//           </p>

//           <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
//             Withdrawal Management
//           </h1>

//           <p className="mt-2 text-sm text-slate-500">
//             Review withdrawal requests and record payment outcomes.
//           </p>
//         </div>

//         <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <SummaryCard
//             title="Pending Requests"
//             value="—"
//             icon={<Clock size={21} />}
//           />

//           <SummaryCard
//             title="Processing"
//             value="—"
//             icon={<Wallet size={21} />}
//           />

//           <SummaryCard
//             title="Completed Payments"
//             value="—"
//             icon={<CheckCircle2 size={21} />}
//           />
//         </section>

//         <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
//           <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//             <h2 className="text-lg font-semibold text-slate-900">
//               Withdrawal Requests
//             </h2>

//             <div className="relative w-full lg:max-w-xs">
//               <Search
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <input
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//                 placeholder="Search requests..."
//                 className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               />
//             </div>
//           </div>

//           <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
//             {filters.map((filter) => (
//               <button
//                 key={filter}
//                 onClick={() => setActiveFilter(filter)}
//                 className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
//                   activeFilter === filter
//                     ? "bg-blue-600 text-white"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 {filter}
//               </button>
//             ))}
//           </div>

//           <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
//             <Wallet
//               size={36}
//               className="mx-auto mb-3 text-slate-300"
//             />

//             <h3 className="font-semibold text-slate-800">
//               Withdrawal records will appear here
//             </h3>

//             <p className="mt-2 text-sm text-slate-500">
//               Connect this page to your authenticated Convex query
//               to display real requests.
//             </p>
//           </div>

//           <p className="mt-4 text-xs text-slate-400">
//             Filter: {activeFilter}
//           </p>
//         </section>
//       </div>
//     </main>
//   );
// }

// function SummaryCard({
//   title,
//   value,
//   icon,
// }: {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="mb-4 flex items-center justify-between">
//         <p className="text-sm text-slate-500">{title}</p>
//         <span className="text-blue-600">{icon}</span>
//       </div>

//       <p className="text-2xl font-bold text-slate-900">{value}</p>
//     </div>
//   );
// }



"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Search,
  RefreshCw,
} from "lucide-react";

type WithdrawalStatus =
  | "pending"
  | "processing"
  | "paid"
  | "rejected";

type Withdrawal = {
  _id: string;
  amount: number;
  status: WithdrawalStatus;
  bankName: string;
  accountName: string;
  accountNumber: string;
  userName: string;
  userEmail: string;
  requestedAt: number;
  paymentReference?: string;
  adminNote?: string;
};

const filters = [
  "all",
  "pending",
  "processing",
  "paid",
  "rejected",
] as const;

type Filter = (typeof filters)[number];

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/withdrawals", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load withdrawal records."
        );
      }

      setWithdrawals(data.withdrawals);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWithdrawals();
  }, [fetchWithdrawals]);

  const summary = useMemo(
    () => ({
      pending: withdrawals.filter((w) => w.status === "pending").length,
      processing: withdrawals.filter((w) => w.status === "processing").length,
      paid: withdrawals.filter((w) => w.status === "paid").length,
      rejected: withdrawals.filter((w) => w.status === "rejected").length,
    }),
    [withdrawals]
  );

  const filteredWithdrawals = useMemo(() => {
    const term = search.toLowerCase().trim();

    return withdrawals.filter((withdrawal) => {
      const matchesFilter =
        activeFilter === "all" ||
        withdrawal.status === activeFilter;

      const matchesSearch =
        !term ||
        withdrawal.userName.toLowerCase().includes(term) ||
        withdrawal.userEmail.toLowerCase().includes(term) ||
        withdrawal.accountNumber.includes(term) ||
        withdrawal.bankName.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [withdrawals, activeFilter, search]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Withdrawal Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review and manage user withdrawal requests.
            </p>
          </div>

          <button
            onClick={fetchWithdrawals}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Pending Requests"
            value={summary.pending}
            icon={<Clock size={21} />}
          />

          <SummaryCard
            title="Processing"
            value={summary.processing}
            icon={<Wallet size={21} />}
          />

          <SummaryCard
            title="Paid"
            value={summary.paid}
            icon={<CheckCircle2 size={21} />}
          />

          <SummaryCard
            title="Rejected"
            value={summary.rejected}
            icon={<XCircle size={21} />}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Withdrawal Requests
            </h2>

            <div className="relative w-full lg:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user, bank or account..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading withdrawal requests...
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
              <Wallet
                size={36}
                className="mx-auto mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-800">
                No withdrawal requests found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Withdrawal requests will appear here when users submit them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Bank Details</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">
                          {withdrawal.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {withdrawal.userEmail}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {formatNaira(withdrawal.amount)}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {withdrawal.bankName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {withdrawal.accountName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {withdrawal.accountNumber}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(withdrawal.requestedAt)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={withdrawal.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-5 text-xs text-slate-400">
            Showing {filteredWithdrawals.length} of {withdrawals.length} requests
          </p>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="text-blue-600">{icon}</span>
      </div>

      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const styles: Record<WithdrawalStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
