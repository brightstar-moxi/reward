import Link from "next/link";

const platformLinks = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Rewards", href: "#rewards" },
  { name: "Tasks", href: "#tasks" },
  { name: "FAQ", href: "#faq" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Blog", href: "/blog" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-white"
            >
              Reward<span className="text-green-500">Hub</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              A Nigerian giveaway and reward platform built around daily
              participation, activities and transparent reward rules.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Platform
            </h3>

            <ul className="mt-4 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Company
            </h3>

            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Legal
            </h3>

            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} RewardHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}