"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Rewards", href: "#rewards" },
  { name: "Tasks", href: "#tasks" },
  { name: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Reward<span className="text-green-600">Hub</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-green-600"
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/login"
            className="text-sm font-semibold text-gray-700"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Get Started
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}