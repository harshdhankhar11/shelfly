import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import SellerNavbar from "@/app/components/global/SellerNavbar";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    if (session.user.role === "BUYER") redirect("/dashboard");
    else redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden selection:bg-teal-500/20 selection:text-teal-900">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <SellerNavbar user={session.user} />

      <div className="pt-20 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
