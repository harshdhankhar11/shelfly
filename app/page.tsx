"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/global/Navbar";
import Footer from "@/app/components/global/Footer";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, RefreshCw, Users, IndianRupee, Sparkles, Box, Rocket } from "lucide-react";

export default function HomePage() {
  const [weight, setWeight] = React.useState(1500);
  const [unit, setUnit] = React.useState<"g" | "kg">("g");
  const pricePerKg = 300;

  const displayWeight = unit === "g" ? weight : weight / 1000;
  const totalPrice = (weight / 1000) * pricePerKg;

  const toggleUnit = () => {
    setUnit(prev => (prev === "g" ? "kg" : "g"));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 pt-28">
        <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_40rem_at_top,theme(colors.teal.50),theme(colors.slate.50))]" />
          
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-[6px] bg-teal-50 px-3 py-1 border border-teal-100">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-850">
                    Smart Inventory Platform
                  </span>
                </div>
                
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  Manage Your Inventory. <br />
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Fly Through Orders.
                  </span>
                </h1>
                
                <p className="mx-auto max-w-lg text-sm text-slate-600 lg:mx-0">
                  Smart unit conversions, role-based access, and seamless order management — all in one beautiful platform.
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Link href="/register">
                    <Button className="px-5 py-2 text-xs font-semibold flex items-center gap-1.5 rounded-[6px]">
                      <span>Get Started</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="px-5 py-2 text-xs font-semibold border-slate-200 hover:bg-slate-100 text-slate-800 rounded-[6px]">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md rounded-[6px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-md">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Unit Conversion Calculator
                    </span>
                    <button
                      onClick={toggleUnit}
                      className="flex items-center gap-1 rounded-[6px] bg-teal-50 border border-teal-150 px-2.5 py-1 text-xs font-semibold text-teal-850 hover:bg-teal-100 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Switch Unit</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[6px] border border-slate-100 bg-white p-4">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Item Name</div>
                      <div className="text-sm font-bold text-slate-800">Organic Coffee Beans</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-[6px] border border-slate-100 bg-white p-4">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Base Stock</div>
                        <div className="text-base font-bold text-slate-800">1,500 g</div>
                      </div>
                      <div className="rounded-[6px] border border-teal-100 bg-teal-50/30 p-4">
                        <div className="text-[10px] font-semibold text-teal-650 uppercase tracking-wider">Calculated Stock</div>
                        <div className="text-base font-bold text-teal-900 transition-all duration-300">
                          {displayWeight.toLocaleString()} {unit}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-teal-100 bg-teal-50/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-semibold text-teal-850 uppercase tracking-wider">Value Estimation</div>
                          <div className="text-lg font-extrabold text-teal-900">
                            ₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="rounded-[6px] bg-teal-100/50 p-2 text-teal-800">
                          <IndianRupee className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-[10px] text-slate-450">
                    Calculated at base price of ₹{pricePerKg}/kg
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Streamline Your Entire Operations
              </h2>
              <p className="mt-2 text-slate-650 text-xs sm:text-sm">
                Discover the key functions that power Shelfly.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-[6px] border border-slate-200 p-6 shadow-sm hover:border-teal-300 transition-colors bg-slate-50/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-teal-50 text-teal-600 border border-teal-100 mb-4">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Smart Unit Conversion</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Convert between g, kg, L, mL, and items instantly with high precision. Never lose track of your metrics.
                </p>
              </div>

              <div className="rounded-[6px] border border-slate-200 p-6 shadow-sm hover:border-teal-300 transition-colors bg-slate-50/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-teal-50 text-teal-600 border border-teal-100 mb-4">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Role-Based Access</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Admin, Seller, and Buyer dashboards with tailored permissions to ensure security and clean workflows.
                </p>
              </div>

              <div className="rounded-[6px] border border-slate-200 p-6 shadow-sm hover:border-teal-300 transition-colors bg-slate-50/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-teal-50 text-teal-600 border border-teal-100 mb-4">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">INR Pricing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-precision pricing for Indian businesses, perfectly optimized for tax configurations and quotations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                How It Works
              </h2>
              <p className="mt-2 text-slate-650 text-xs sm:text-sm">
                Get up and running with Shelfly in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="relative text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[6px] bg-white border border-slate-200 text-teal-600 shadow-sm mb-4">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step 1: Create Account</h3>
                <p className="mt-2 text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                  Register as a Seller or Buyer. Admins will set your access privileges automatically.
                </p>
              </div>

              <div className="relative text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[6px] bg-white border border-slate-200 text-teal-600 shadow-sm mb-4">
                  <Box className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step 2: Add Products</h3>
                <p className="mt-2 text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                  Input catalog details, specify base units, custom factors, and price levels easily.
                </p>
              </div>

              <div className="relative text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[6px] bg-white border border-slate-200 text-teal-600 shadow-sm mb-4">
                  <Rocket className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step 3: Start Ordering</h3>
                <p className="mt-2 text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                  Create drafts, request quotes, convert units dynamically, and confirm invoices smoothly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-teal-700 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-2xl font-extrabold sm:text-3xl">500+</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-150">
                  Businesses Assisted
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold sm:text-3xl">10K+</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-150">
                  Orders Handled
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold sm:text-3xl">50K+</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-150">
                  Products Managed
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}