import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import BuyerNavbar from "@/app/components/global/BuyerNavbar";

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export default async function BuyerLayout({ children }: BuyerLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <BuyerNavbar
        user={{
          name: session.user.name || "",
          email: session.user.email,
          role: session.user.role,
        }}
      />
      <div className="pt-16 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
