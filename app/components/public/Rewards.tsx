import { CalendarDays, Gift, TrendingUp } from "lucide-react";

const rewards = [
  {
    icon: CalendarDays,
    title: "Daily participation",
    description:
      "Return regularly and complete the activities available for your current day.",
  },
  {
    icon: Gift,
    title: "Task rewards",
    description:
      "Different activities can have different reward values depending on their requirements.",
  },
  {
    icon: TrendingUp,
    title: "Grow your balance",
    description:
      "Keep participating and completing eligible activities to increase your reward balance.",
  },
];

export default function Rewards() {
  return (
    <section id="rewards" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-semibold text-green-600">REWARDS</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Stay active and keep progressing
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-600">
              Your dashboard will show your daily progress, available
              activities and accumulated rewards in one place.
            </p>

            <div className="mt-8 space-y-5">
              {rewards.map((reward) => {
                const Icon = reward.icon;

                return (
                  <div key={reward.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {reward.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's progress</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  Day 17
                </h3>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                4 activities
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Daily participation", "₦100"],
                ["Read today's article", "₦100"],
                ["Complete promotional task", "₦200"],
                ["Special activity", "₦200"],
              ].map(([name, amount]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {name}
                  </span>

                  <span className="font-semibold text-green-600">
                    +{amount}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="text-sm font-medium text-gray-500">
                Example daily rewards
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₦600
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}