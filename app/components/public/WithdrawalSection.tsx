import {
  ArrowDownToLine,
  CircleCheck,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const requirements = [
  "Reach the minimum withdrawal balance",
  "Complete the required account conditions",
  "Meet the applicable referral and sharing requirements",
  "Submit a withdrawal request",
];

export default function WithdrawalSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Wallet size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Wallet balance</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₦7,500
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                In progress
              </span>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Withdrawal progress
                </span>

                <span className="font-semibold text-gray-900">
                  75%
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[75%] rounded-full bg-green-600" />
              </div>

              <div className="mt-3 flex justify-between text-sm text-gray-500">
                <span>₦7,500</span>
                <span>₦10,000</span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-400"
            >
              <ArrowDownToLine size={19} />
              Withdrawal not yet available
            </button>
          </div>

          <div>
            <p className="font-semibold text-green-600">WITHDRAWALS</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Know exactly what you need before withdrawing
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              The dashboard will show your balance and every requirement
              necessary before a withdrawal request can be submitted.
            </p>

            <div className="mt-8 space-y-4">
              {requirements.map((requirement) => (
                <div key={requirement} className="flex items-start gap-3">
                  <CircleCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-green-600"
                  />

                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-5">
              <ShieldCheck className="mt-0.5 shrink-0 text-green-600" size={21} />

              <p className="text-sm leading-6 text-green-900">
                Withdrawal requests will be recorded and reviewed through the
                platform's administrative process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}