"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Check, RefreshCw, Box } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { verifyEmailAction, resendOtpAction } from "@/app/components/auth/actions.auth";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = React.useState(emailParam);
  const [otp, setOtp] = React.useState("");
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [infoMsg, setInfoMsg] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await verifyEmailAction(email, otp);

      if (!res.success) {
        setErrorMsg(res.error || "Failed to verify email");
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg("Please enter your email to resend the code");
      return;
    }

    setIsResending(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await resendOtpAction(email);

      if (!res.success) {
        setErrorMsg(res.error || "Failed to resend code");
      } else {
        setInfoMsg("A new verification code has been sent to your email.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md p-8 rounded-[6px] border border-white bg-white/70 shadow-lg backdrop-blur-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[6px] bg-emerald-100 text-emerald-800 mb-4">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
        <p className="text-sm text-gray-500 mt-2">
          Your account is verified. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 rounded-[6px] border border-white bg-white/70 shadow-lg backdrop-blur-md">
      <div className="flex flex-col items-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-[6px] bg-gradient-to-br from-primary to-secondary text-white shadow-sm mb-4">
          <Box className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Verify email</h2>
        <p className="text-xs text-gray-500 mt-1">We sent an OTP to your email address</p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-[6px] bg-red-50 border border-red-100 p-3 text-xs font-medium text-red-600">
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="mb-4 rounded-[6px] bg-teal-50 border border-teal-100 p-3 text-xs font-medium text-teal-800">
          {infoMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          id="otp"
          label="Verification Code (OTP)"
          type="text"
          placeholder="••••••"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full py-2.5">
          Verify Account
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-semibold text-primary hover:text-secondary transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
          <span>Resend Code</span>
        </button>
        <Link href="/login" className="font-semibold text-gray-600 hover:text-primary transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
