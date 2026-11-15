
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Reward = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
  reference: string;
  taskTitle: string;
  taskDay: number | null;
  createdAt: number;
};

type RewardsResponse = {
  success: boolean;
  totalRewards: number;
  totalTransactions: number;
  rewards: Reward[];
  message?: string;
};

const PAGE_SIZE = 10;

const formatCurrency = (amount: number) =>
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

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [amountFilter, setAmountFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // const loadRewards = useCallback(async () => {
  //   try {
  //     setError("");

  //     const response = await fetch("/api/admin/rewards", {
  //       cache: "no-store",
  //     });

  //     const data: RewardsResponse = await response.json();

  //     if (!response.ok || !data.success) {
  //       throw new Error(data.message || "Unable to load rewards.");
  //     }

  //     setRewards(data.rewards || []);
  //     setTotalRewards(data.totalRewards || 0);
  //     setTotalTransactions(data.totalTransactions || 0);
  //   } catch (error) {
  //     setError(
  //       error instanceof Error
  //         ? error.message
  //         : "Unable to load rewards."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);



  const loadRewards = useCallback(async () => {
  try {
    setError("");
    setRefreshing(true);

    const response = await fetch("/api/admin/rewards", {
      cache: "no-store",
    });

    const data: RewardsResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load rewards.");
    }

    setRewards(data.rewards || []);
    setTotalRewards(data.totalRewards || 0);
    setTotalTransactions(data.totalTransactions || 0);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Unable to load rewards."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const filteredRewards = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return rewards.filter((reward) => {
      const matchesSearch =
        reward.userName.toLowerCase().includes(searchTerm) ||
        reward.userEmail.toLowerCase().includes(searchTerm) ||
        reward.taskTitle.toLowerCase().includes(searchTerm) ||
        reward.reference.toLowerCase().includes(searchTerm) ||
        reward.description.toLowerCase().includes(searchTerm);

      const matchesAmount =
        amountFilter === "all" ||
        (amountFilter === "under500" && reward.amount < 500) ||
        (amountFilter === "500to999" &&
          reward.amount >= 500 &&
          reward.amount < 1000) ||
        (amountFilter === "1000plus" && reward.amount >= 1000);

      const rewardDate = new Date(reward.createdAt);
      const dateOnly = [
        rewardDate.getFullYear(),
        String(rewardDate.getMonth() + 1).padStart(2, "0"),
        String(rewardDate.getDate()).padStart(2, "0"),
      ].join("-");

      const matchesStartDate =
        !startDate || dateOnly >= startDate;

      const matchesEndDate =
        !endDate || dateOnly <= endDate;

      return (
        matchesSearch &&
        matchesAmount &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [rewards, search, amountFilter, startDate, endDate]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRewards.length / PAGE_SIZE)
  );

  const paginatedRewards = filteredRewards.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, amountFilter, startDate, endDate]);

  const averageReward =
    totalTransactions > 0
      ? totalRewards / totalTransactions
      : 0;

  const latestReward = rewards[0];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading reward transactions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}

          <button
            onClick={loadRewards}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Rewards Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor reward payments and user earnings across the platform.
          </p>
        </div>

        {/* <button
          onClick={loadRewards}
          className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Refresh Transactions
        </button> */}

        <button
  onClick={loadRewards}
  disabled={refreshing}
  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {refreshing ? "Refreshing..." : "Refresh Transactions"}
</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Rewards Paid"
          value={formatCurrency(totalRewards)}
        />

        <SummaryCard
          label="Reward Transactions"
          value={totalTransactions.toLocaleString()}
        />

        <SummaryCard
          label="Average Reward"
          value={formatCurrency(averageReward)}
        />

        <SummaryCard
          label="Latest Reward"
          value={
            latestReward
              ? formatCurrency(latestReward.amount)
              : "₦0"
          }
          description={
            latestReward
              ? formatDate(latestReward.createdAt)
              : "No transactions yet"
          }
        />
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">
          Search and Filter Rewards
        </h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user, email, task or reference..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 xl:col-span-2"
          />

          <select
            value={amountFilter}
            onChange={(event) =>
              setAmountFilter(event.target.value)
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Reward Amounts</option>
            <option value="under500">Below ₦500</option>
            <option value="500to999">₦500 - ₦999</option>
            <option value="1000plus">₦1,000 and above</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setAmountFilter("all");
              setStartDate("");
              setEndDate("");
            }}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-semibold text-gray-900">
            Reward Transaction History
          </h2>

          <span className="text-xs text-gray-500">
            {filteredRewards.length.toLocaleString()} transactions found
          </span>
        </div>

        {filteredRewards.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No reward transactions found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {[
                      "User",
                      "Task",
                      "Day",
                      "Amount",
                      "Reference",
                      "Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedRewards.map((reward) => (
                    <tr
                      key={reward.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="min-w-52 px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {reward.userName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {reward.userEmail || "No email"}
                        </p>
                      </td>

                      <td className="min-w-48 px-5 py-4">
                        <p className="text-sm text-gray-700">
                          {reward.taskTitle}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {reward.description}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {reward.taskDay
                          ? `Day ${reward.taskDay}`
                          : "N/A"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-green-700">
                        {formatCurrency(reward.amount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                        {reward.reference || "N/A"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(reward.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-500">
                Showing{" "}
                {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredRewards.length
                )}{" "}
                of {filteredRewards.length} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
