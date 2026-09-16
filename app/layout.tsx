import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "./components/ConvexClientProvider";

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
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}