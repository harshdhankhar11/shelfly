import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import Navbar from "@/app/components/global/Navbar";
import { Mail, Shield, User, Box } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    if (session.user.role === "SELLER") redirect("/seller");
    if (session.user.role === "BUYER") redirect("/dashboard");
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200";
      case "SELLER":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "BUYER":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-28 px-4">
        <div className="w-full max-w-md p-8 rounded-[6px] border border-white bg-white/70 shadow-lg backdrop-blur-md">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-[6px] bg-gradient-to-br from-primary to-secondary text-white shadow-sm mb-4">
              <Box className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Admin Profile</h2>
            <p className="text-xs text-gray-500 mt-1">Shelfly Dashboard Access</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[6px] border border-slate-100 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-indigo-50 text-indigo-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Full Name
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {session.user.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[6px] border border-slate-100 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-purple-50 text-purple-600">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Email Address
                </span>
                <span className="text-sm font-bold text-gray-800 block truncate">
                  {session.user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[6px] border border-slate-100 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-teal-50 text-teal-600">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Assigned Role
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {session.user.role}
                  </span>
                </div>
                <span className={`rounded-[6px] border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleColor(session.user.role)}`}>
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}