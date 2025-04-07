"use client";

import React from "react";
import { Button } from "../ui/button";
import { signOut } from "@/app/actions/auth";
import { toast } from "react-toastify";
import { OsxLike } from "./toastify";
import { redirect } from "next/navigation";

export const HeaderNav = () => {
  const signUserOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Failed to sign out");
    }
    toast(OsxLike, {
      data: {
        title: "Signed Out",
        content: "You have been signed out successfully.",
      },
      className:
        "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
      closeButton: false,
    });
    redirect("/login");
  };
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-lg">
      {/* Left Content */}
      <div className="flex items-center gap-4">
        {/* <Image
          src="/logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="dark:invert"
        /> */}
        <span className="text-2xl font-semibold text-gray-800">
          PrimeWealth
        </span>
      </div>

      {/* Right Content */}
      <nav className="flex items-center gap-6">
        <Button
          className="bg-[#25c7fd] hover:bg-[#6fbfda] cursor-pointer"
          onClick={() => signUserOut()}
        >
          Sign Out
        </Button>
      </nav>
    </header>
  );
};
