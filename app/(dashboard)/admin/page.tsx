"use client";

import React from "react";
import Link from "next/link";
import { 
  Box, ShoppingBag, AlertTriangle, IndianRupee, Clock, 
  ArrowUpRight, Plus, Eye, Loader2 
} from "lucide-react";

interface DashboardData {
  metrics: {
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    lowStock: number;
    totalRevenue: number;
    users: {
      ADMIN: number;
      SELLER: number;
      BUYER: number;
    };
  };
  charts: {
    orderTrends: Array<{ date: string; count: number }>;
    revenueTrends: Array<{ month: string; amount: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: string;
    status: string;
    createdAt: string;
    user: {
      fullName: string;
      email: string;
    };
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: string;
    minStockLevel: string | null;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <main className="flex-1 bg-slate-50 flex items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 text-indigo-650 animate-spin" />
        <span className="ml-2 text-xs font-semibold">Assembling metrics...</span>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1 bg-slate-50 p-6 text-center text-slate-500 flex flex-col items-center justify-center">
        <p className="text-xs">Failed to load analytics dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-[6px] text-xs font-semibold"
        >
          Retry Load
        </button>
      </main>
    );
  }

  const { metrics, charts, recentOrders, lowStockProducts } = data;

  const orderTrendsCounts = charts.orderTrends.map((t) => t.count);
  const maxOrderTrend = Math.max(...orderTrendsCounts, 5);
  const orderPoints = charts.orderTrends
    .map((t, index) => {
      const x = (index / (charts.orderTrends.length - 1)) * 100;
      const y = 100 - (t.count / maxOrderTrend) * 85;
      return `${x},${y}`;
    })
    .join(" ");

  const maxRevenue = Math.max(...charts.revenueTrends.map((t) => t.amount), 1000);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PENDING":
        return "bg-amber-55 text-amber-700 border-amber-200 animate-pulse";
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            System status monitoring, orders routing, product listings, and platform metrics audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold transition-all shadow-md shadow-indigo-600/10">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </Link>
          <Link href="/admin/orders">
            <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-[6px] text-xs font-bold transition-all border border-slate-200 shadow-sm">
              <span>View All Orders</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Products</span>
            <p className="text-2xl font-black text-slate-800 mt-1.5">{metrics.activeProducts}</p>
          </div>
          <div className="h-10 w-10 rounded-[6px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
            <Box className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <p className="text-xl font-black text-slate-800 mt-2 block truncate">₹{metrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="h-10 w-10 rounded-[6px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <IndianRupee className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Orders</span>
            <p className="text-2xl font-black text-slate-800 mt-1.5">{metrics.totalOrders}</p>
          </div>
          <div className="h-10 w-10 rounded-[6px] bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <p className="text-2xl font-black text-amber-600 mt-1.5">{metrics.pendingOrders}</p>
          </div>
          <div className="h-10 w-10 rounded-[6px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alarm</span>
            <p className={`text-2xl font-black mt-1.5 ${metrics.lowStock > 0 ? "text-rose-600 animate-pulse font-black" : "text-slate-800"}`}>
              {metrics.lowStock}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-[6px] flex items-center justify-center border ${
            metrics.lowStock > 0 
              ? "bg-rose-50 border-rose-100 text-rose-650" 
              : "bg-slate-50 border-slate-100 text-slate-400"
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-650">
              A:{metrics.users.ADMIN}
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-50 border border-teal-100 text-teal-650">
              S:{metrics.users.SELLER}
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-650">
              B:{metrics.users.BUYER}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Order Velocity (30d)</h3>
            <span className="text-[10px] text-slate-450">Total Count</span>
          </div>
          <div className="flex-1 h-36 w-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0,100 L ${orderPoints} L 100,100 Z`}
                fill="url(#orderGrad)"
              />
              <polyline
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2"
                points={orderPoints}
              />
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 mt-2 font-semibold">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Revenue Trends</h3>
            <span className="text-[10px] text-slate-455">Completed Orders (INR)</span>
          </div>
          <div className="flex-1 h-36 flex items-end justify-between gap-1.5 pb-1 border-b border-slate-100">
            {charts.revenueTrends.map((t) => {
              const heightPct = maxRevenue > 0 ? (t.amount / maxRevenue) * 90 : 0;
              return (
                <div key={t.month} className="flex-1 flex flex-col items-center group relative">
                  <div
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-[2px] transition-all duration-300 group-hover:from-indigo-600 group-hover:to-indigo-700"
                  />
                  <span className="absolute -top-6 text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ₹{t.amount}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 mt-2 font-semibold">
            {charts.revenueTrends.map((t) => (
              <span key={t.month} className="flex-1 text-center">{t.month}</span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase mb-4">Order Breakdown</h3>
            <div className="space-y-3.5">
              {charts.statusDistribution.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No order records registered.</p>
              ) : (
                charts.statusDistribution.map((s) => {
                  const pct = (s.count / metrics.totalOrders) * 100;
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">{s.status}</span>
                        <span className="text-slate-800">{s.count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[6px] p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Recent Orders</h3>
            <Link href="/admin/orders" className="text-[10px] text-indigo-650 hover:underline flex items-center gap-0.5 font-bold">
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50">
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No order records found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-905">{order.orderNumber}</td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800">{order.user.fullName}</p>
                        <p className="text-[10px] text-slate-450 font-mono">{order.user.email}</p>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="p-3 font-bold text-slate-850">₹{Number(order.total).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Low Stock Alerts</h3>
            <Link href="/admin/products" className="text-[10px] text-rose-650 hover:underline font-bold">
              Check Products
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Box className="h-8 w-8 mb-2 opacity-50 text-slate-305" />
                <p className="text-[10px]">All inventory stocks are within safe limits.</p>
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const stock = Number(p.currentStock);
                const min = Number(p.minStockLevel || 1);
                const pct = Math.min((stock / min) * 100, 100);
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-750 truncate max-w-[150px]">{p.name}</span>
                      <span className="font-mono text-rose-600 font-bold">{stock} / {min}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-450">
                      <span>SKU: {p.sku}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-rose-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}