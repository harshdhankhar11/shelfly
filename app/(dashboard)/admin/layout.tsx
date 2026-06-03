"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, Box, ShoppingBag, Users, ClipboardList, 
  Activity, LogOut, Menu, X, ShieldAlert, Loader2, ChevronDown 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin mb-2" />
        <p className="text-xs font-semibold">Authenticating admin context...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    if (session && session.user.role !== "ADMIN") {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-800">
          <ShieldAlert className="h-12 w-12 text-rose-600 mb-4 animate-bounce" />
          <h2 className="text-lg font-bold">Access Denied</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            This module requires administrative credentials. You are being redirected...
          </p>
          <button
            onClick={() => {
              if (session.user.role === "SELLER") router.push("/seller");
              else router.push("/buyer/products");
            }}
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold"
          >
            Go to My Dashboard
          </button>
        </div>
      );
    }
    return null;
  }

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products Management", href: "/admin/products", icon: Box },
    { name: "All Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Inventory Logs", href: "/admin/inventory", icon: ClipboardList },
    { name: "Activity Logs", href: "/admin/activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans antialiased">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-between p-5">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-[6px] bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/10">
                  <span className="font-black text-xs text-white">S</span>
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-800">
                  SHElFLY ADMIN
                </span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-slate-100 rounded-[6px]"
              >
                <X className="h-5 w-5 text-slate-550" />
              </button>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[6px] text-xs font-semibold transition-all relative overflow-hidden group ${
                      isActive
                        ? "bg-indigo-50 border border-indigo-100 text-indigo-650 font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600" />
                    )}
                    <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[6px] text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/90 border-b border-slate-200/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-[6px] border border-slate-200 hover:bg-slate-50"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
              {pathname === "/admin" && "Dashboard Analytics"}
              {pathname.startsWith("/admin/products") && "Products Database"}
              {pathname.startsWith("/admin/orders") && "Transaction Ledger"}
              {pathname.startsWith("/admin/users") && "User Accounts"}
              {pathname.startsWith("/admin/inventory") && "Inventory Audits"}
              {pathname.startsWith("/admin/activity") && "System Audits"}
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] border border-slate-200 hover:bg-slate-50 bg-slate-50 text-left transition-all"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-extrabold text-indigo-700">
                AD
              </div>
              <div className="hidden sm:block text-xs font-semibold">
                <p className="text-slate-800 leading-none">{session.user.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{session.user.email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-450" />
            </button>

            {isUserDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-20 w-48 rounded-[6px] border border-slate-200 bg-white p-1.5 shadow-xl space-y-1">
                  <div className="px-2.5 py-2 border-b border-slate-100">
                    <span className="text-[9px] font-extrabold text-indigo-700 uppercase bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-[6px]">
                      ADMIN ROLE
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
}
