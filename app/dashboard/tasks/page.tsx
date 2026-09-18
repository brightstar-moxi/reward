"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  referralCode: string;
}

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // For now, every new user starts at Day 1.
  // We will make this dynamic after we build progress tracking.
  const currentDay = 1;

  const activity = useQuery(
    api.dailyActivities.getByDay,
    {
      day: currentDay,
    }
  );
console.log("Day 1 activity:", activity);



const allActivities = useQuery(
  api.dailyActivities.getAll
);

console.log(
  "ALL ACTIVITIES:",
  allActivities
);

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
        console.error(
          "Failed to load user:",
          error
        );
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  if (loadingUser || activity === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading today's activity...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Unable to load your account.
        </p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <CalendarDays
            size={40}
            className="mx-auto text-gray-300"
          />

          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            Day {currentDay} is not available yet
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please check again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-green-600">
          100-Day Participation
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Today's Activity
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Complete today's activity to continue your
          participation.
        </p>
      </div>

      {/* Progress */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Current day
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              Day {currentDay}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <CalendarDays size={24} />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-gray-500">
              Progress
            </span>

            <span className="font-medium text-gray-700">
              {currentDay}/100
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-green-600"
              style={{
                width: `${currentDay}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <CheckCircle2 size={24} />
          </div>

          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Day {activity.day}
            </span>

            <h2 className="mt-2 text-xl font-bold text-gray-900">
              {activity.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {activity.description}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
          <Clock
            size={18}
            className="text-gray-400"
          />

          <p className="text-sm text-gray-500">
            Complete today's activity before the daily
            participation period ends.
          </p>
        </div>

        <button
          type="button"
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20"
        >
          Start Activity
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}