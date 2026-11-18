
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type WalletUser = {
  userId: string;
  userName: string;
  userEmail: string;
  userStatus: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  walletExists: boolean;
  updatedAt: number | null;
};

type WalletOverview = {
  totalBalance: number;
  totalEarned: number;
  totalWallets: number;
  totalWithdrawn: number;
};

type Transaction = {
  _id: string;
  type: string;
  amount: number;
  description: string;
  reference?: string;
  createdAt: number;
  isTest?: boolean;
};

type WalletResponse = {
  success: boolean;
  overview: WalletOverview;
  wallets: WalletUser[];
  message?: string;
};

type TransactionsResponse = {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  transactions: Transaction[];
  message?: string;
};

const PAGE_SIZE = 10;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (timestamp: number | null) =>
  timestamp
    ? new Date(timestamp).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

export default function AdminWalletPage() {
  const [wallets, setWallets] = useState<WalletUser[]>([]);
  const [overview, setOverview] = useState<WalletOverview>({
    totalBalance: 0,
    totalEarned: 0,
    totalWallets: 0,
    totalWithdrawn: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState<WalletUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);

  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">(
    "credit"
  );
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState("");
  const [adjustmentSuccess, setAdjustmentSuccess] = useState("");

  const loadWallets = useCallback(async () => {
    try {
      setError("");
      setRefreshing(true);

      const response = await fetch("/api/admin/wallet", {
        cache: "no-store",
      });

      const data: WalletResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load wallets.");
      }

      setOverview(data.overview);
      setWallets(data.wallets || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load wallets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const filteredWallets = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return wallets.filter((wallet) => {
      const matchesSearch =
        wallet.userName.toLowerCase().includes(searchTerm) ||
        wallet.userEmail.toLowerCase().includes(searchTerm) ||
        wallet.userId.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || wallet.userStatus === statusFilter;

      const matchesWallet =
        walletFilter === "all" ||
        (walletFilter === "exists" && wallet.walletExists) ||
        (walletFilter === "missing" && !wallet.walletExists);

      return matchesSearch && matchesStatus && matchesWallet;
    });
  }, [wallets, search, statusFilter, walletFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWallets.length / PAGE_SIZE)
  );

  const paginatedWallets = filteredWallets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, walletFilter]);

  const loadTransactions = async (user: WalletUser) => {
    setSelectedUser(user);
    setShowTransactions(true);
    setTransactions([]);
    setTransactionsError("");
    setTransactionsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/wallet/transactions?userId=${encodeURIComponent(
          user.userId
        )}`,
        { cache: "no-store" }
      );

      const data: TransactionsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load transactions.");
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      setTransactionsError(
        error instanceof Error
          ? error.message
          : "Unable to load transactions."
      );
    } finally {
      setTransactionsLoading(false);
    }
  };

  const openAdjustment = (
    user: WalletUser,
    type: "credit" | "debit"
  ) => {
    setSelectedUser(user);
    setAdjustmentType(type);
    setAmount("");
    setReason("");
    setAdjustmentError("");
    setAdjustmentSuccess("");
    setShowAdjustment(true);
  };

  const submitAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) return;

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setAdjustmentError("Enter a valid amount greater than zero.");
      return;
    }

    if (!reason.trim()) {
      setAdjustmentError("Please provide a reason.");
      return;
    }

    setAdjusting(true);
    setAdjustmentError("");
    setAdjustmentSuccess("");

    try {
      const response = await fetch(`/api/admin/wallet/${adjustmentType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.userId,
          amount: numericAmount,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Unable to ${adjustmentType} wallet.`);
      }

      setAdjustmentSuccess(
        data.message ||
          `Wallet ${adjustmentType === "credit" ? "credited" : "debited"} successfully.`
      );

      await loadWallets();

      setSelectedUser((current) =>
        current
          ? {
              ...current,
              balance:
                current.balance +
                (adjustmentType === "credit"
                  ? numericAmount
                  : -numericAmount),
            }
          : current
      );

      setAmount("");
      setReason("");
    } catch (error) {
      setAdjustmentError(
        error instanceof Error ? error.message : "Wallet adjustment failed."
      );
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading wallet information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            onClick={loadWallets}
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
            Wallet Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor user balances, transactions, credits and debits.
          </p>
        </div>

        <button
          onClick={loadWallets}
          disabled={refreshing}
          className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh Wallets"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Wallet Balance"
          value={formatCurrency(overview.totalBalance)}
        />
        <SummaryCard
          label="Genuine Rewards Paid"
          value={formatCurrency(overview.totalEarned)}
        />
        <SummaryCard
          label="Total Withdrawn"
          value={formatCurrency(overview.totalWithdrawn)}
        />
        <SummaryCard
          label="Wallet Accounts"
          value={overview.totalWallets.toLocaleString()}
        />
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">
          Search and Filter Wallets
        </h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or user ID..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 xl:col-span-2"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All User Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={walletFilter}
            onChange={(event) => setWalletFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Wallet Records</option>
            <option value="exists">Wallet Created</option>
            <option value="missing">No Wallet Yet</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setWalletFilter("all");
            }}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Wallet Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-semibold text-gray-900">User Wallets</h2>
          <span className="text-xs text-gray-500">
            {filteredWallets.length.toLocaleString()} users found
          </span>
        </div>

        {filteredWallets.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No wallets or users found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {[
                      "User",
                      "Status",
                      "Balance",
                      "Total Earned",
                      "Withdrawn",
                      "Wallet",
                      "Actions",
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
                  {paginatedWallets.map((wallet) => (
                    <tr key={wallet.userId} className="hover:bg-gray-50">
                      <td className="min-w-52 px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {wallet.userName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {wallet.userEmail || "No email"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            wallet.userStatus === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {wallet.userStatus}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-gray-900">
                        {formatCurrency(wallet.balance)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatCurrency(wallet.totalEarned)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatCurrency(wallet.totalWithdrawn)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`text-xs font-semibold ${
                            wallet.walletExists
                              ? "text-green-700"
                              : "text-gray-400"
                          }`}
                        >
                          {wallet.walletExists ? "Created" : "Not created"}
                        </span>
                      </td>

                      <td className="min-w-64 px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => loadTransactions(wallet)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Transactions
                          </button>

                          <button
                            onClick={() => openAdjustment(wallet, "credit")}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Credit
                          </button>

                          <button
                            onClick={() => openAdjustment(wallet, "debit")}
                            disabled={wallet.balance <= 0}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Debit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredWallets.length)} of{" "}
                {filteredWallets.length} users
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transactions Modal */}
      {showTransactions && selectedUser && (
        <Modal
          title="Wallet Transaction History"
          onClose={() => setShowTransactions(false)}
        >
          <div className="mb-4">
            <p className="font-semibold text-gray-900">
              {selectedUser.userName}
            </p>
            <p className="text-sm text-gray-500">{selectedUser.userEmail}</p>
          </div>

          {transactionsLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Loading transactions...
            </p>
          ) : transactionsError ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {transactionsError}
            </p>
          ) : transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No transactions found for this user.
            </p>
          ) : (
            <div className="max-h-[55vh] overflow-auto">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    {["Type", "Amount", "Description", "Date"].map((item) => (
                      <th
                        key={item}
                        className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase text-gray-500"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="whitespace-nowrap px-3 py-3 text-sm capitalize text-gray-700">
                        {transaction.type}
                        {transaction.isTest && (
                          <span className="ml-2 text-xs text-orange-600">
                            Test
                          </span>
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-3 text-sm font-semibold ${
                          transaction.amount < 0
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="min-w-48 px-3 py-3 text-sm text-gray-600">
                        {transaction.description}
                        {transaction.reference && (
                          <p className="mt-1 text-xs text-gray-400">
                            {transaction.reference}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* Credit / Debit Modal */}
      {showAdjustment && selectedUser && (
        <Modal
          title={`${adjustmentType === "credit" ? "Credit" : "Debit"} User Wallet`}
          onClose={() => {
            if (!adjusting) setShowAdjustment(false);
          }}
        >
          <div className="mb-5 rounded-xl bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">
              {selectedUser.userName}
            </p>
            <p className="text-sm text-gray-500">{selectedUser.userEmail}</p>
            <p className="mt-2 text-sm text-gray-600">
              Current balance:{" "}
              <strong>{formatCurrency(selectedUser.balance)}</strong>
            </p>
          </div>

          <form onSubmit={submitAdjustment} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount (₦)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Reason
              </label>
              <textarea
                required
                maxLength={250}
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why this adjustment is being made..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {adjustmentError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {adjustmentError}
              </p>
            )}

            {adjustmentSuccess && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {adjustmentSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={adjusting}
              className={`w-full rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 ${
                adjustmentType === "credit"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {adjusting
                ? "Processing..."
                : `Confirm ${adjustmentType === "credit" ? "Credit" : "Debit"}`}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
