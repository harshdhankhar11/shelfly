"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, Box } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("EMAIL_NOT_VERIFIED")) {
          setErrorMsg("EMAIL_NOT_VERIFIED");
        } else {
          setErrorMsg("Invalid email or password");
        }
        setIsLoading(false);
      } else {
        const session = await getSession();
        const role = session?.user?.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "SELLER") {
          router.push("/seller");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail("admin@shelfly.com");
    setPassword("admin123");
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Sign in</h2>
        <p className="text-xs text-gray-500">Access your supply catalog and inventory dashboard</p>
      </div>

      {errorMsg === "EMAIL_NOT_VERIFIED" ? (
        <div className="rounded-[6px] bg-amber-50 border border-amber-250 p-3.5 text-xs font-semibold text-amber-800 flex flex-col gap-2">
          <span>Your email is registered but not verified yet.</span>
          <Link
            href={`/verify-email?email=${encodeURIComponent(email)}`}
            className="text-primary hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>Verify your email address now &rarr;</span>
          </Link>
        </div>
      ) : errorMsg ? (
        <div className="rounded-[6px] bg-red-50 border border-red-100 p-3.5 text-xs font-medium text-red-600">
          {errorMsg}
        </div>
      ) : null}

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

        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            id="remember-me"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link href="/login" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full py-2.5">
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-150" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-50 px-2 text-gray-400">or</span>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <Link href="/register" className="block text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
          Don&apos;t have an account? Create new account
        </Link>
        
        <div className="pt-2">
          <button
            onClick={handleUseDemo}
            className="inline-flex rounded-[6px] bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            Use Demo Credentials
          </button>
          <p className="text-[10px] text-gray-400 mt-1">
            admin@shelfly.com / admin123 (Verified Admin Account)
          </p>
        </div>
      </div>
    </div>
  );
}
