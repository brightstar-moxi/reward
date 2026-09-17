
import {
  Wallet,
  CheckCircle2,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

const stats = [
  {
    title: "Available Balance",
    value: "₦3,450",
    description: "Available for withdrawal",
    icon: Wallet,
  },
  {
    title: "Today's Earnings",
    value: "₦200",
    description: "Earned today",
    icon: CheckCircle2,
  },
  {
    title: "Referrals",
    value: "6",
    description: "Active referrals",
    icon: Users,
  },
  {
    title: "Current Day",
    value: "Day 12",
    description: "Keep your streak going",
    icon: CalendarDays,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-green-600">
          Welcome back
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Your reward dashboard
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
          Complete today's activities, earn rewards,
          and keep progressing toward your withdrawal.
        </p>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Daily activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Today's activities
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Complete your available tasks.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
              2 / 5 completed
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Daily login",
              "Read today's article",
              "Watch promotional video",
              "Complete social activity",
              "Referral activity",
            ].map((task, index) => (
              <div
                key={task}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      index < 2
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index < 2 ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <span className="text-xs font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {task}
                    </p>

                    <p className="text-xs text-gray-400">
                      +₦100 reward
                    </p>
                  </div>
                </div>

                {index >= 2 && (
                  <button className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    Start
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Withdrawal */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">
            Withdrawal progress
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Minimum withdrawal: ₦10,000
          </p>

          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                ₦3,450
              </span>

              <span className="text-gray-400">
                ₦10,000
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: "34.5%" }}
              />
            </div>

            <p className="mt-3 text-xs text-gray-400">
              ₦6,550 remaining before withdrawal.
            </p>
          </div>

          <button
            disabled
            className="mt-6 w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400"
          >
            Withdrawal locked
          </button>
        </div>
      </section>
    </div>
  );
}
