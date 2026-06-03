"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Box, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, ShoppingBag, ClipboardList, ShoppingCart, UserCheck } from "lucide-react";

interface BuyerNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function BuyerNavbar({ user }: BuyerNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);

  const updateCartCount = () => {
    try {
      const stored = localStorage.getItem("shelfly_cart");
      if (stored) {
        const cartItems = JSON.parse(stored);
        if (Array.isArray(cartItems)) {
          setCartCount(cartItems.length);
        }
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  React.useEffect(() => {
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/buyer", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Browse Products", href: "/buyer/products", icon: <ShoppingBag className="h-4 w-4" /> },
    { name: "My Orders", href: "/buyer/orders", icon: <ClipboardList className="h-4 w-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 border-b border-slate-200/80 backdrop-blur-md text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/buyer" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-white text-emerald-600">
                  <Box className="h-5 w-5" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Shelfly Buyer
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[6px] text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-slate-100 border border-slate-200 text-emerald-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/buyer/products?cart=true"
              className="relative p-2 rounded-[6px] border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] border border-slate-250 bg-white hover:bg-slate-50 hover:border-slate-350 transition-all text-slate-800"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="text-left text-xs">
                  <p className="font-bold leading-none text-slate-850">{user.name}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-550" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-[6px] border border-slate-205 bg-white p-2 shadow-xl backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 rounded-[6px] border border-emerald-250 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    href="/buyer/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 mt-1 rounded-[6px] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-[6px] text-xs font-semibold text-red-650 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex md:hidden gap-2">
            <Link
              href="/buyer/products?cart=true"
              className="relative p-2 rounded-[6px] border border-slate-205 bg-white text-slate-550"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-[6px] border border-slate-205 bg-white text-slate-500 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-150 bg-white p-4 space-y-3 shadow-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-100 text-emerald-700 border border-slate-200"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-slate-150 pt-3">
            <div className="px-3 pb-3">
              <p className="text-sm font-bold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-550 truncate mt-0.5">{user.email}</p>
              <span className="inline-block mt-2 rounded-[6px] border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                {user.role}
              </span>
            </div>
            <Link
              href="/buyer/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[6px] text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <UserCheck className="h-4.5 w-4.5" />
              <span>My Profile</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[6px] text-sm font-semibold text-red-650 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
