import { CalendarCheck, Flame, Trophy } from "lucide-react";

export default function Progress() {
  return (
    <section className="bg-gray-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold text-green-400">KEEP PROGRESSING</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Build your participation streak
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-400">
              The platform uses a day-by-day progress system to help users
              understand where they are and what they need to complete next.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <CalendarCheck className="text-green-400" size={22} />
                <p className="mt-4 text-2xl font-bold">17</p>
                <p className="mt-1 text-sm text-gray-400">
                  Days completed
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Flame className="text-green-400" size={22} />
                <p className="mt-4 text-2xl font-bold">7</p>
                <p className="mt-1 text-sm text-gray-400">
                  Current streak
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Trophy className="text-green-400" size={22} />
                <p className="mt-4 text-2xl font-bold">100</p>
                <p className="mt-1 text-sm text-gray-400">
                  Total days
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold">100-Day Progress</span>
              <span className="text-sm text-gray-400">17%</span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[17%] rounded-full bg-green-500" />
            </div>

            <div className="mt-6 grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }, (_, index) => {
                const day = index + 1;
                const completed = day <= 17;

                return (
                  <div
                    key={day}
                    className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${
                      completed
                        ? "bg-green-600 text-white"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-400">
              Example progress display. Actual progress will come from the
              user's account and daily activity records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}