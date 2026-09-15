import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Daily rewards & opportunities
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            Complete simple activities.
            <span className="text-green-600"> Earn rewards.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Participate in daily activities, complete available tasks,
            invite friends and build your reward balance as you progress.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white transition hover:bg-green-700"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              Free registration
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              Daily activities
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              Transparent rules
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current progress</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  Day 17
                </p>
              </div>

              <div className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                Active
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[17%] rounded-full bg-green-600" />
            </div>

            <div className="mt-3 flex justify-between text-sm text-gray-500">
              <span>17 days completed</span>
              <span>100 days</span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Available balance</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ₦4,300
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Today's tasks</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  4
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}