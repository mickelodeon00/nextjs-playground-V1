"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { SplitButtons } from "@/components/general/toastify";
import Link from "next/link";
import { sendPasswordResetEmail } from "@/app/actions/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    const { error } = await sendPasswordResetEmail(data.email);
    if (!error) {
      toast(SplitButtons, {
        data: {
          title: "Check Your Email",
          content: "A password reset link has been sent to your email.",
        },
        closeButton: false,
        className: "p-0 w-[400px] border border-purple-600/40",
        // ariaLabel: "Email received",
      });
    } else {
      toast(SplitButtons, {
        data: {
          title: "Failed",
          content: "Unable to send password reset email. Please try again.",
        },
        closeButton: false,
        className: "p-0 w-[400px] border border-red-600/40",
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Forgot Password
      </h1>

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
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 `}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send Reset Email
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remembered your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
