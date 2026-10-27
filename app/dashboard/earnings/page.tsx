
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Wallet,
} from "lucide-react";

type EarningsDay = {
  dayNumber: number;
  date: string;
  earnings: number;
  approvedRewardCount: number;
  isToday: boolean;
};

type EarningsResponse = {
  currentDay: number;
  totalEarned: number;
  days: EarningsDay[];
};

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);

function formatDate(date: string) {
  return new Date(`${date}T12:00:00+01:00`).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Lagos",
    }
  );
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEarnings() {
      try {
        const response = await fetch("/api/participation", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load earnings."
          );
        }

        if (!cancelled) {
          setData(result.earnings);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load earnings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEarnings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <section>
        <p className="text-sm font-medium text-green-600">
          Earnings
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Your earnings history
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Track your approved rewards for each day of your
          100-day participation period.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Total approved rewards
            </p>
            <Wallet className="text-green-600" size={21} />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {loading
              ? "Loading..."
              : formatNaira(data?.totalEarned ?? 0)}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Calculated from recorded reward transactions
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Current participation day
            </p>
            <CalendarDays className="text-green-600" size={21} />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {loading
              ? "Loading..."
              : `Day ${data?.currentDay ?? 1} of 100`}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Based on your registration date in Nigeria
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900">
            Daily breakdown
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your newest participation day appears first.
          </p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">
            Loading your earnings history...
          </p>
        ) : data?.days.length ? (
          <div className="divide-y divide-gray-100">
            {data.days.map((day) => (
              <div
                key={day.dayNumber}
                className="flex items-center justify-between gap-3 p-4 sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    {day.earnings > 0 ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <CalendarDays size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Day {day.dayNumber}
                      </p>

                      {day.isToday && (
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Today
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(day.date)}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {day.approvedRewardCount} approved reward
                      {day.approvedRewardCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {formatNaira(day.earnings)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Wallet
              size={28}
              className="mx-auto text-gray-400"
            />
            <p className="mt-3 text-sm font-semibold text-gray-800">
              No earnings history yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Approved rewards will appear here when they are
              recorded.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
