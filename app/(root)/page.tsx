"use client";
import { HeaderNav } from "@/components/general/headerNav";
import { ToastifyExample } from "@/components/general/toastify-example";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <div className="grid  place-items-center bg-gray-50 p-8 sm:p-20">
        <main className="flex flex-col items-center gap-8 text-center">
          {/* Logo */}
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="PrimeWealth logo"
            width={180}
            height={38}
            priority
          />

          {/* Welcome Message */}
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to PrimeWealth
          </h1>
          <p className="text-gray-600">
            Manage your finances with ease. Track accounts, transactions, and
            more.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-6">
              Get Started
            </Button>
            <Button className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center hover:bg-gray-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-6">
              Learn More ...
            </Button>
          </div>

          {/* Notification Button */}
          <ToastifyExample />
        </main>
      </div>
    </div>
  );
}
