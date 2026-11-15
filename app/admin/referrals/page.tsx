
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ReferredUser = {
  userId: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  completedDays: number;
  qualified: boolean;
  joinedAt: number;
};

type ReferralGroup = {
  referrerId: string | null;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  qualifiedReferrals: number;
  referrals: ReferredUser[];
};

type ReferralsResponse = {
  success: boolean;
  totalReferrers: number;
  totalReferrals: number;
  activeReferrals: number;
  qualifiedReferrals: number;
  referralGroups: ReferralGroup[];
  error?: string;
};

const PAGE_SIZE = 10;

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AdminReferralsPage() {
  const [groups, setGroups] = useState<ReferralGroup[]>([]);

  const [totalReferrers, setTotalReferrers] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [qualifiedReferrals, setQualifiedReferrals] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qualificationFilter, setQualificationFilter] =
    useState("all");

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const loadReferrals = useCallback(async () => {
    try {
      setError("");
      setRefreshing(true);

      const response = await fetch("/api/admin/referrals", {
        cache: "no-store",
      });

      const data: ReferralsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load referral information."
        );
      }

      setGroups(data.referralGroups || []);
      setTotalReferrers(data.totalReferrers || 0);
      setTotalReferrals(data.totalReferrals || 0);
      setActiveReferrals(data.activeReferrals || 0);
      setQualifiedReferrals(data.qualifiedReferrals || 0);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load referrals."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const filteredGroups = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return groups
      .map((group) => {
        const matchesReferrer =
          group.referrerName.toLowerCase().includes(searchTerm) ||
          group.referrerEmail.toLowerCase().includes(searchTerm) ||
          group.referralCode.toLowerCase().includes(searchTerm);

        const matchingReferrals = group.referrals.filter((referral) => {
          const matchesUser =
            referral.name.toLowerCase().includes(searchTerm) ||
            referral.email.toLowerCase().includes(searchTerm);

          const matchesSearch =
            !searchTerm || matchesReferrer || matchesUser;

          const matchesStatus =
            statusFilter === "all" ||
            referral.status === statusFilter;

          const matchesQualification =
            qualificationFilter === "all" ||
            (qualificationFilter === "qualified" && referral.qualified) ||
            (qualificationFilter === "unqualified" && !referral.qualified);

          return (
            matchesSearch &&
            matchesStatus &&
            matchesQualification
          );
        });

        const shouldShowGroup =
          !searchTerm ||
          matchesReferrer ||
          matchingReferrals.length > 0;

        return {
          ...group,
          referrals: shouldShowGroup ? matchingReferrals : [],
        };
      })
      .filter(
        (group) =>
          group.referrals.length > 0 ||
          (group.totalReferrals === 0 && searchTerm === "")
      );
  }, [groups, search, statusFilter, qualificationFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGroups.length / PAGE_SIZE)
  );

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, qualificationFilter]);

  const toggleGroup = (referralCode: string) => {
    setExpandedGroups((current) =>
      current.includes(referralCode)
        ? current.filter((code) => code !== referralCode)
        : [...current, referralCode]
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading referral information...
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
            onClick={loadReferrals}
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
            Referrals Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor referral registrations and qualification progress.
          </p>
        </div>

        <button
          onClick={loadReferrals}
          disabled={refreshing}
          className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh Referrals"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Referrers"
          value={totalReferrers}
        />

        <SummaryCard
          label="Total Referrals"
          value={totalReferrals}
        />

        <SummaryCard
          label="Active Referrals"
          value={activeReferrals}
        />

        <SummaryCard
          label="Qualified Referrals"
          value={qualifiedReferrals}
        />
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">
          Search and Filter Referrals
        </h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search referrer, referral code or referred user..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 xl:col-span-2"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={qualificationFilter}
            onChange={(event) =>
              setQualificationFilter(event.target.value)
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Qualification Statuses</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Not Qualified</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setQualificationFilter("all");
            }}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Referral Groups */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-semibold text-gray-900">
            Referral Records
          </h2>

          <span className="text-xs text-gray-500">
            {filteredGroups.length.toLocaleString()} referrers found
          </span>
        </div>

        {paginatedGroups.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No referral records found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {[
                      "Referrer",
                      "Referral Code",
                      "Total Referrals",
                      "Active",
                      "Qualified",
                      "Details",
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
                  {paginatedGroups.map((group) => (
                    <>
                      <tr
                        key={group.referralCode}
                        className="hover:bg-gray-50"
                      >
                        <td className="min-w-52 px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {group.referrerName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {group.referrerEmail || "No email"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-blue-700">
                          {group.referralCode}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {group.totalReferrals}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {group.activeReferrals}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-green-700">
                          {group.qualifiedReferrals}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <button
                            onClick={() => toggleGroup(group.referralCode)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {expandedGroups.includes(group.referralCode)
                              ? "Hide Details"
                              : "View Details"}
                          </button>
                        </td>
                      </tr>

                      {expandedGroups.includes(group.referralCode) && (
                        <tr key={`${group.referralCode}-details`}>
                          <td colSpan={6} className="bg-gray-50 px-5 py-5">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                              Referred Users
                            </h3>

                            {group.referrals.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                No referred users match the current filters.
                              </p>
                            ) : (
                              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                                <table className="min-w-full text-left">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      {[
                                        "User",
                                        "Account Status",
                                        "Completed Days",
                                        "Qualification",
                                        "Joined",
                                      ].map((heading) => (
                                        <th
                                          key={heading}
                                          className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-500"
                                        >
                                          {heading}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-gray-100">
                                    {group.referrals.map((referral) => (
                                      <tr key={referral.userId}>
                                        <td className="min-w-48 px-4 py-3">
                                          <p className="text-sm font-medium text-gray-900">
                                            {referral.name}
                                          </p>

                                          <p className="mt-1 text-xs text-gray-500">
                                            {referral.email}
                                          </p>
                                        </td>

                                        <td className="px-4 py-3">
                                          <StatusBadge
                                            status={referral.status}
                                          />
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                          {referral.completedDays} / 10
                                        </td>

                                        <td className="px-4 py-3">
                                          {referral.qualified ? (
                                            <span className="text-sm font-semibold text-green-700">
                                              Qualified
                                            </span>
                                          ) : (
                                            <span className="text-sm font-semibold text-orange-600">
                                              Not Qualified
                                            </span>
                                          )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                          {formatDate(referral.joinedAt)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredGroups.length
                )}{" "}
                of {filteredGroups.length} referrers
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
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "suspended";
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status === "active" ? "Active" : "Suspended"}
    </span>
  );
}
