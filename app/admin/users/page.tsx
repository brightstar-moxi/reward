
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  referralCode: string;
  referredBy?: string;
  createdAt: number;
  updatedAt: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to load users.");
      }

      setUsers(data.users || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.referralCode.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const activeUsers = users.filter((user) => user.status === "active").length;
  const suspendedUsers = users.filter(
    (user) => user.status === "suspended"
  ).length;

  const updateUserStatus = async (
    userId: string,
    action: "suspend" | "activate"
  ) => {
    const confirmed = window.confirm(
      action === "suspend"
        ? "Are you sure you want to suspend this user?"
        : "Are you sure you want to reactivate this user?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(userId);

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to update user.");
      }

      await loadUsers();
      alert(data.message || "User account updated successfully.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to update user."
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            onClick={loadUsers}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          User Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View, search and manage registered platform users.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Users" value={users.length} />
        <SummaryCard label="Active Users" value={activeUsers} />
        <SummaryCard label="Suspended Users" value={suspendedUsers} />
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email or referral code..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 sm:flex-1"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Registered Users</h2>
          <span className="text-xs text-gray-500">
            {filteredUsers.length} users found
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {[
                    "User",
                    "Referral Code",
                    "Role",
                    "Joined",
                    "Status",
                    "Action",
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {user.referralCode}
                    </td>

                    <td className="px-5 py-4 text-sm capitalize text-gray-600">
                      {user.role}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {user.role === "admin" ? (
                        <span className="text-xs text-gray-400">
                          Protected account
                        </span>
                      ) : (
                        <button
                          disabled={processingId === user.id}
                          onClick={() =>
                            updateUserStatus(
                              user.id,
                              user.status === "active"
                                ? "suspend"
                                : "activate"
                            )
                          }
                          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                            user.status === "active"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {processingId === user.id
                            ? "Processing..."
                            : user.status === "active"
                              ? "Suspend"
                              : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
