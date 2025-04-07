import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ToastContainer } from "react-toastify";

import "./globals.css";

// Use Jost font
const jostFont = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrimeWealth",
  description: "Manage your finances with ease using PrimeWealth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jostFont.variable}>
      <body className="bg-gray-50 text-gray-800">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
