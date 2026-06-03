import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import LoginForm from "@/app/components/auth/LoginForm";
import { Box, Sparkles } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-screen overflow-hidden bg-slate-50">
      <div className="hidden lg:flex flex-col justify-between bg-teal-800 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-teal-700 via-teal-800 to-teal-950 opacity-90" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-white text-teal-800">
            <Box className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Shelfly</span>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-teal-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100">
              Supply Management
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Seamless Stock Control.
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            Verify orders, estimate pricing in INR, and leverage real-time unit conversions. Simply professional.
          </p>
        </div>

        <div className="relative z-10 text-xs text-teal-200/60 font-medium">
          &copy; {new Date().getFullYear()} Shelfly Platform. All rights reserved.
        </div>
      </div>

      <div className="flex items-center justify-center p-8 overflow-y-auto min-h-screen">
        <LoginForm />
      </div>
    </div>
  );
}
