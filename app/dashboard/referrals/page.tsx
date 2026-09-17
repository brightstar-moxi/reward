"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  Users,
  UserPlus,
  Gift,
} from "lucide-react";

interface Referral {
  id: string;
  name: string;
  status: "active" | "suspended";
  createdAt: number;
}

interface User {
  referralCode: string;
}

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUser(data.user);

        if (data.user?.referralCode) {
          // Referral data will be connected to Convex next.
        }
      } catch (error) {
        console.error(
          "Failed to load referrals:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadReferrals();
  }, []);

  const referralLink = user
    ? `${window.location.origin}/signup?ref=${user.referralCode}`
    : "";

  const copyLink = async () => {
    if (!referralLink) return;

    await navigator.clipboard.writeText(referralLink);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading referrals...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Referrals
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Invite people to participate and track your
          qualifying referrals.
        </p>
      </div>

      {/* Referral link */}
      <section className="rounded-2xl border border-green-100 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white p-3 text-green-600">
            <Gift size={22} />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">
              Invite someone
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Share your referral link with someone who
              wants to participate.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={referralLink}
                readOnly
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 outline-none"
              />

              <button
                type="button"
                onClick={copyLink}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                {copied ? (
                  <>
                    <Check size={17} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={17} />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Users
            size={20}
            className="text-green-600"
          />

          <p className="mt-4 text-sm text-gray-500">
            Total referrals
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {referrals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <UserPlus
            size={20}
            className="text-green-600"
          />

          <p className="mt-4 text-sm text-gray-500">
            Active referrals
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {
              referrals.filter(
                (referral) =>
                  referral.status === "active"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Gift
            size={20}
            className="text-green-600"
          />

          <p className="mt-4 text-sm text-gray-500">
            Referral earnings
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            ₦0
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Rewards will be connected to the wallet system.
          </p>
        </div>
      </section>

      {/* Referral list */}
      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900">
            Referral history
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            People who registered using your referral link.
          </p>
        </div>

        {referrals.length === 0 ? (
          <div className="p-10 text-center">
            <Users
              size={32}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-600">
              No referrals yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your referrals will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {referral.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Joined{" "}
                    {new Date(
                      referral.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                  {referral.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}