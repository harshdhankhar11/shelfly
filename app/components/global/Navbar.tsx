"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Box, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

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
    <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
      <div className="rounded-[6px] border border-white/40 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-gradient-to-br from-primary to-secondary text-white">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gray-900">Shelfly</span>
              <span className="hidden text-[10px] block font-medium uppercase tracking-wider text-gray-500 md:block -mt-1">
                Management
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Home
            </Link>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              How it works
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 rounded-[6px] bg-gray-50 px-3 py-1.5 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-800">{session.user.name}</span>
                </Link>
                <span className={`rounded-[6px] border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleColor(session.user.role)}`}>
                  {session.user.role}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="rounded-[6px] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="rounded-[6px] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-[6px] p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-3 space-y-3 rounded-[6px] border border-gray-100 bg-white p-4 shadow-lg md:hidden">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-[6px] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block rounded-[6px] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="block rounded-[6px] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              How it works
            </a>
            <div className="border-t border-gray-100 pt-3">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{session.user.name}</span>
                    <span className={`rounded-[6px] border px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(session.user.role)}`}>
                      {session.user.role}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block text-center rounded-[6px] border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-[6px] bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    onClick={() => setIsOpen(false)}
                    href="/login"
                    className="block text-center rounded-[6px] border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href="/register"
                    className="block text-center rounded-[6px] bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
