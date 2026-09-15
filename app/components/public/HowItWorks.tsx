import { UserPlus, ListChecks, Wallet } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Register for free and set up your account to access available activities.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Complete activities",
    description:
      "Check your dashboard regularly and complete eligible tasks and activities.",
    icon: ListChecks,
  },
  {
    number: "03",
    title: "Build your rewards",
    description:
      "Eligible completed activities add rewards to your wallet according to the rules.",
    icon: Wallet,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-semibold text-green-600">HOW IT WORKS</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Simple steps to get started
          </h2>

          <p className="mt-4 text-gray-600">
            The platform is designed around a straightforward daily
            participation system.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Icon size={22} />
                  </div>

                  <span className="text-sm font-bold text-gray-300">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}