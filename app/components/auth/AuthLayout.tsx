
import Link from "next/link";
import { Gift } from "lucide-react";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLinkText: string;
  footerLink: string;
}

export default function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLinkText,
  footerLink,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <div className="hidden bg-gray-950 p-10 lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600">
              <Gift size={19} />
            </span>

            Reward<span className="text-green-500">Hub</span>
          </Link>

          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
              Welcome to RewardHub
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight text-white xl:text-5xl">
              Participate. Complete activities. Keep progressing.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-gray-400">
              Create your account to access your activities, track your
              progress, manage your rewards and participate in available
              opportunities.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Daily activities", "Progress tracking", "Reward wallet"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} RewardHub
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-gray-950"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white">
                  <Gift size={19} />
                </span>

                Reward<span className="text-green-600">Hub</span>
              </Link>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                {title}
              </h1>

              <p className="mt-3 leading-6 text-gray-500">
                {description}
              </p>
            </div>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-center text-sm text-gray-500">
              {footerText}{" "}
              <Link
                href={footerLink}
                className="font-semibold text-green-600 hover:text-green-700"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

