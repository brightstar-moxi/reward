
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  Building2,
  User,
  CreditCard,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type Eligibility = {
  balance: number;
  minimumBalance: number;
  completedDays: number;
  requiredCompletedDays: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  requiredReferrals: number;
  requiredDaysPerReferral: number;
  eligible: boolean;
};
type Withdrawal = {
  _id: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "rejected";
  bankName: string;
  accountName: string;
  accountNumber: string;
  adminNote?: string;
  paymentReference?: string;
  requestedAt: number;
  paidAt?: number;
};
const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default function WithdrawalPage() {
  const [eligibility, setEligibility] =
    useState<Eligibility | null>(null);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("10000");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
const [historyLoading, setHistoryLoading] = useState(true);
const [historyError, setHistoryError] = useState("");


const loadWithdrawalHistory = useCallback(async () => {
  try {
    setHistoryLoading(true);
    setHistoryError("");

    const response = await fetch("/api/withdrawals/history", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load withdrawal history.");
    }

    setWithdrawals(data.withdrawals);
  } catch (err) {
    setHistoryError(
      err instanceof Error ? err.message : "Unable to load withdrawal history."
    );
  } finally {
    setHistoryLoading(false);
  }
}, []);

useEffect(() => {
  loadWithdrawalHistory();
}, [loadWithdrawalHistory]);

  const loadEligibility = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/withdrawals", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load withdrawal details.");
      }

      setEligibility(data.eligibility);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load withdrawal details."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const withdrawalAmount = Number(amount);

    if (!Number.isSafeInteger(withdrawalAmount) || withdrawalAmount < 10000) {
      setError("The minimum withdrawal amount is ₦10,000.");
      return;
    }

    if (!eligibility || withdrawalAmount > eligibility.balance) {
      setError("Your wallet balance is insufficient.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber.trim())) {
      setError("Enter a valid 10-digit account number.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/withdrawals", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          bankName,
          accountName,
          accountNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Withdrawal request failed.");
      }

      setSuccess(data.message);
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setAmount("10000");

      // await loadEligibility();

await Promise.all([
  loadEligibility(),
  loadWithdrawalHistory(),
]);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit withdrawal request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-green-600" />
        <span className="ml-3 text-sm text-gray-500">
          Loading withdrawal details...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Withdraw Funds
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Submit a withdrawal request using your Nigerian bank account.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <Wallet size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Available balance</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatNaira(eligibility?.balance ?? 0)}
            </h2>
          </div>
        </div>
      </div>

      {eligibility && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">
            Withdrawal requirements
          </h2>

          <div className="space-y-4 text-sm">
            <Requirement
              label="Minimum wallet balance"
              current={formatNaira(eligibility.balance)}
              required={formatNaira(eligibility.minimumBalance)}
              passed={eligibility.balance >= eligibility.minimumBalance}
            />

            <Requirement
              label="Completed activity days"
              current={String(eligibility.completedDays)}
              required={String(eligibility.requiredCompletedDays)}
              passed={
                eligibility.completedDays >=
                eligibility.requiredCompletedDays
              }
            />

            <Requirement
              label="Qualified referrals"
              current={String(eligibility.qualifiedReferrals)}
              required={String(eligibility.requiredReferrals)}
              passed={
                eligibility.qualifiedReferrals >=
                eligibility.requiredReferrals
              }
            />
          </div>

          {!eligibility.eligible && (
            <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              Complete the remaining requirements before requesting a withdrawal.
            </p>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-5 font-semibold text-gray-900">
          Bank account details
        </h2>

        <div className="space-y-5">
          <InputField
            label="Bank name"
            icon={<Building2 size={18} />}
            value={bankName}
            onChange={setBankName}
            placeholder="e.g. Access Bank"
          />

          <InputField
            label="Account name"
            icon={<User size={18} />}
            value={accountName}
            onChange={setAccountName}
            placeholder="Enter account holder's name"
          />

          <InputField
            label="Account number"
            icon={<CreditCard size={18} />}
            value={accountNumber}
            onChange={(value) =>
              setAccountNumber(value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="10-digit account number"
            maxLength={10}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Withdrawal amount (₦)
            </label>
            <input
              type="number"
              min={10000}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              placeholder="Enter amount"
            />
            <p className="mt-2 text-xs text-gray-500">
              Minimum withdrawal: ₦10,000
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 size={18} className="shrink-0" />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            !eligibility?.eligible ||
            Number(amount) > (eligibility?.balance ?? 0)
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Submitting request..." : "Request Withdrawal"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your requested amount will be reserved from your wallet immediately.
        </p>
      </form>
      

      {/* history */}
<section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-bold text-gray-900">
        Withdrawal History
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Track your withdrawal requests and payment status.
      </p>
    </div>

    <button
      type="button"
      onClick={loadWithdrawalHistory}
      disabled={historyLoading}
      className="text-sm font-medium text-green-600 hover:text-green-700"
    >
      Refresh
    </button>
  </div>

  {historyLoading ? (
    <p className="py-8 text-center text-sm text-gray-500">
      Loading withdrawal history...
    </p>
  ) : historyError ? (
    <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
      {historyError}
    </p>
  ) : withdrawals.length === 0 ? (
    <div className="py-10 text-center">
      <Wallet className="mx-auto mb-3 text-gray-300" size={35} />
      <p className="font-medium text-gray-700">
        No withdrawal requests yet
      </p>
      <p className="mt-1 text-sm text-gray-400">
        Your withdrawal records will appear here.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {withdrawals.map((withdrawal) => (
        <div
          key={withdrawal._id}
          className="rounded-xl border border-gray-100 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatNaira(withdrawal.amount)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(withdrawal.requestedAt).toLocaleString("en-NG")}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                withdrawal.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : withdrawal.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : withdrawal.status === "processing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
              }`}
            >
              {withdrawal.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
            <p className="text-gray-600">
              Bank: {withdrawal.bankName}
            </p>
            <p className="text-gray-600">
              Account: {withdrawal.accountName}
            </p>
            <p className="text-gray-600">
              Account number: {withdrawal.accountNumber}
            </p>
          </div>

          {withdrawal.status === "paid" && withdrawal.paymentReference && (
            <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm">
              <p className="font-medium text-green-800">
                Payment reference
              </p>
              <p className="mt-1 break-all text-green-700">
                {withdrawal.paymentReference}
              </p>
            </div>
          )}

          {withdrawal.status === "rejected" && withdrawal.adminNote && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm">
              <p className="font-semibold text-red-800">
                Rejection reason
              </p>
              <p className="mt-1 text-red-700">
                {withdrawal.adminNote}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</section>

    </div>
  );
}

function Requirement({
  label,
  current,
  required,
  passed,
}: {
  label: string;
  current: string;
  required: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">
          {current} / {required}
        </p>
      </div>
      {passed ? (
        <CheckCircle2 className="text-green-600" size={20} />
      ) : (
        <AlertCircle className="text-amber-500" size={20} />
      )}
    </div>
  );
}

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-green-500">
        <span className="text-gray-400">{icon}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          required
          className="w-full py-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}
