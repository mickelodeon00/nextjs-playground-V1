"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmail } from "@/app/actions/auth";
import { toast } from "react-toastify";
import {
  CustomSplitButtons,
  CustomWithActions,
  OsxLike,
} from "@/components/general/toastify";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useState } from "react";
import MFAPopup from "@/components/auth/mfa-popup";

const notifyMFA = async () => {
  // 👇 Check for MFA

  const supabase = createClient();
  const { data: mfaData, error: mfaError } =
    await supabase.auth.mfa.listFactors();

  console.log("SignIn Data:", { mfaData, mfaError });
  if (!mfaError && (!mfaData || mfaData.totp.length === 0)) {
    toast(CustomWithActions, {
      data: {
        title: "MFA ",
        content: "You haven't enabled MFA yet. Please do it from Settings.",
        link: {
          href: "/settings",
          label: "Settings",
        },
      },
      ariaLabel: "Message archived",
      className: "w-[400px]",
      autoClose: false,
      closeButton: false,
    });
    // Optionally show a modal, redirect, or flag UI
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // MFA related state
  const [showMFAPopup, setShowMFAPopup] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    const result = await signInWithEmail(data);
    if (result.error) {
      toast(OsxLike, {
        data: {
          title: "Error Signing In",
          content: "Please check your credentials and try again.",
        },
        className:
          "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
        closeButton: false,
      });
      return;
    }

    // if (result.requiresMFA && result.factorId && result.challengeId) {
    //   // Show MFA popup
    //   setMfaFactorId(result.factorId);
    //   setMfaChallengeId(result.challengeId);
    //   setShowMFAPopup(true);

    //   toast(OsxLike, {
    //     data: {
    //       title: "MFA Required",
    //       content: "Please enter your authenticator code to continue.",
    //     },
    //     className:
    //       "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
    //     closeButton: false,
    //   });
    // } else {
    //   // No MFA required
    //   toast(OsxLike, {
    //     data: {
    //       title: "Signed In",
    //       content: "You have been signed in successfully.",
    //     },
    //     className:
    //       "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
    //     closeButton: false,
    //   });
    //   redirect("/");
    // }
    toast(OsxLike, {
      data: {
        title: "Signed In",
        content: "You have been signed in successfully.",
      },
      className:
        "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
      closeButton: false,
    });

    await notifyMFA();
    redirect("/");
  };

  const handleMFASuccess = () => {
    // Reset form state
    reset();
    setShowMFAPopup(false);
    setMfaFactorId("");
    setMfaChallengeId("");

    toast(OsxLike, {
      data: {
        title: "Authentication Complete",
        content: "You have been signed in successfully.",
      },
      className:
        "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
      closeButton: false,
    });
  };
  const handleMFAClose = () => {
    setShowMFAPopup(false);
    setMfaFactorId("");
    setMfaChallengeId("");
  };

  return (
    <div className="w-full max-w-md ">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Welcome Back
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Please log in to access your account and manage your wealth.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
              }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
              }`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
      {/* MFA Popup */}
      {/* <MFAPopup
        isOpen={showMFAPopup}
        onClose={handleMFAClose}
        factorId={mfaFactorId}
        challengeId={mfaChallengeId}
        onSuccess={handleMFASuccess}
      /> */}
    </div>
  );
}
