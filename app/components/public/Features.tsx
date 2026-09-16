import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-green-600">
        <div className="px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
            <ShieldCheck size={27} />
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start participating?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-green-50">
            Create your account, explore the available activities and start
            building your participation progress.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-green-700 transition hover:bg-green-50"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}