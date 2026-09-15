import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Giveaway & Rewards Platform",
    template: "%s | Giveaway & Rewards",
  },
  description:
    "A Nigerian giveaway and rewards platform where users can participate in daily activities, complete tasks and earn rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}