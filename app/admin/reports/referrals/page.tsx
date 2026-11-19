
"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users, UserCheck, UserX, Award } from "lucide-react";

type ReferralReport = {
  summary: {
    totalReferred: number;
    qualified: number;
    unqualified: number;
    totalReferrers: number;
    qualifiedReferrers: number;
    qualificationDays: number;
    requiredReferrals: number;
  };
  topReferrers: {
    userId: string;
    name: string;
    email: string;
    referralCode: string;
    totalReferrals: number;
    qualifiedReferrals: number;
    unqualifiedReferrals: number;
    meetsReferralRequirement: boolean;
  }[];
  referralDetails: {
    userId: string;
    name: string;
    email: string;
    referredBy?: string;
    status: string;
    completedDays: number;
    qualified: boolean;
  }[];
};

export default function ReferralReportsPage() {
  const [report, setReport] = useState<ReferralReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reports/referrals", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load referral report.");
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
        Loading referral reports...
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

  const { summary, topReferrers, referralDetails } = report;

  const cards = [
    {
      title: "Total Referred Users",
      value: summary.totalReferred,
      icon: Users,
    },
    {
      title: "Qualified Referrals",
      value: summary.qualified,
      icon: UserCheck,
    },
    {
      title: "Unqualified Referrals",
      value: summary.unqualified,
      icon: UserX,
    },
    {
      title: "Qualified Referrers",
      value: summary.qualifiedReferrers,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Referral Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Referral performance and qualification statistics.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Qualification Rules
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Required Completed Days
            </p>
            <p className="mt-1 text-2xl font-bold">
              {summary.qualificationDays} days
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Referrals Required
            </p>
            <p className="mt-1 text-2xl font-bold">
              {summary.requiredReferrals}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Top Referrers
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Referral Code</th>
                <th className="p-3">Total Referrals</th>
                <th className="p-3">Qualified</th>
                <th className="p-3">Unqualified</th>
                <th className="p-3">Requirement</th>
              </tr>
            </thead>

            <tbody>
              {topReferrers.map((referrer) => (
                <tr key={referrer.userId} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{referrer.name}</p>
                    <p className="text-xs text-gray-500">
                      {referrer.email}
                    </p>
                  </td>
                  <td className="p-3">{referrer.referralCode}</td>
                  <td className="p-3">{referrer.totalReferrals}</td>
                  <td className="p-3 text-green-600">
                    {referrer.qualifiedReferrals}
                  </td>
                  <td className="p-3 text-red-600">
                    {referrer.unqualifiedReferrals}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        referrer.meetsReferralRequirement
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {referrer.meetsReferralRequirement
                        ? "Qualified"
                        : "Not Qualified"}
                    </span>
                  </td>
                </tr>
              ))}

              {topReferrers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No referral records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Referred Users
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Referred By</th>
                <th className="p-3">Completed Days</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Qualification</th>
              </tr>
            </thead>

            <tbody>
              {referralDetails.map((user) => (
                <tr key={user.userId} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="p-3">{user.referredBy || "—"}</td>
                  <td className="p-3">{user.completedDays}</td>
                  <td className="p-3 capitalize">{user.status}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.qualified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.qualified ? "Qualified" : "Not Qualified"}
                    </span>
                  </td>
                </tr>
              ))}

              {referralDetails.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No referred users found.
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
