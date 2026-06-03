"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, CheckCircle, Box } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { registerUser } from "@/app/components/auth/actions.auth";
import { UserRole } from "@/app/generated/prisma";

export default function RegisterForm() {
  const router = useRouter();
  
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>(UserRole.SELLER);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setErrorMsg("You must accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const res = await registerUser({
        email,
        passwordHash: password,
        fullName,
        phone: phone || undefined,
        role,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to create account");
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[6px] bg-emerald-100 text-emerald-800">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Account Created!</h2>
        <p className="text-sm text-gray-500">
          Verification code has been sent to <strong>{email}</strong>. Redirecting you to verification page...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Create account</h2>
        <p className="text-xs text-gray-500">Get started with Shelfly supply management</p>
      </div>

      {errorMsg && (
        <div className="rounded-[6px] bg-red-50 border border-red-100 p-3.5 text-xs font-medium text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User className="h-4 w-4" />}
          required
        />

        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          id="phone"
          label="Phone Number (Optional)"
          type="tel"
          placeholder="9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={<Phone className="h-4 w-4" />}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-750 uppercase tracking-wider mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole(UserRole.SELLER)}
              className={`rounded-[6px] py-2 text-xs font-semibold border transition-all ${
                role === UserRole.SELLER
                  ? "bg-indigo-50 border-primary text-primary"
                  : "bg-white border-gray-205 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Seller
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.BUYER)}
              className={`rounded-[6px] py-2 text-xs font-semibold border transition-all ${
                role === UserRole.BUYER
                  ? "bg-teal-50 border-teal-600 text-teal-700"
                  : "bg-white border-gray-205 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Buyer
            </button>
          </div>
        </div>

        <Checkbox
          id="terms"
          label="I agree to the terms and conditions"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full py-2.5 mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
