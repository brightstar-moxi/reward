"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  referralCode: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
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
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const copyReferralCode = async () => {
    if (!user?.referralCode) return;

    await navigator.clipboard.writeText(
      user.referralCode
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Unable to load your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View your account information and referral details.
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900">
              Personal information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your registered account information.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <User size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Full name
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <Mail size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Email address
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Account status
                </p>

                <div className="mt-1">
                  <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Referral */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900">
              Referral information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your unique referral code can be shared with others.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-400">
              Your referral code
            </p>

            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="font-mono text-lg font-semibold tracking-wide text-gray-900">
                {user.referralCode}
              </p>

              <button
                type="button"
                onClick={copyReferralCode}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 hover:text-green-600"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}