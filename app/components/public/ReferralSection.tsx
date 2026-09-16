import { Gift, Link2, Users, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Get your referral link",
    description:
      "Every registered user receives a unique referral link that can be shared with others.",
  },
  {
    icon: Users,
    title: "Invite people",
    description:
      "Share your link with friends, family and communities that may be interested in the platform.",
  },
  {
    icon: Gift,
    title: "Earn qualifying rewards",
    description:
      "Referral rewards are credited when the referral satisfies the platform's qualifying conditions.",
  },
];

export default function ReferralSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold text-green-600">REFERRALS</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Grow together with referrals
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-600">
              Share your unique referral link and invite people to participate.
              Referral rewards are based on genuine qualifying activity, not
              simply on creating accounts.
            </p>

            <div className="mt-8 space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <Icon size={21} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600">
                          0{index + 1}
                        </span>

                        <h3 className="font-semibold text-gray-900">
                          {step.title}
                        </h3>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-green-600 p-7 text-white sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Gift size={28} />
            </div>

            <h3 className="mt-7 text-2xl font-bold">
              Your referral progress
            </h3>

            <p className="mt-3 leading-7 text-green-50">
              Track the people you have successfully referred and see how your
              referral progress contributes to your account requirements.
            </p>

            <div className="mt-8 rounded-2xl bg-white/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-50">
                  Example progress
                </span>

                <span className="font-bold">3 / 10</span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[30%] rounded-full bg-white" />
              </div>

              <div className="mt-4 space-y-3">
                {[
                  "Unique referral link",
                  "Referral activity tracking",
                  "Qualifying referral rewards",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-green-50"
                  >
                    <CheckCircle2 size={17} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}