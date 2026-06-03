import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { ClipboardList, ShoppingBag, CreditCard, Clock, CheckCircle2, ChevronRight, User } from "lucide-react";

export default async function BuyerDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [totalOrders, completedOrders, pendingOrders, allOrders, recentOrders] = await Promise.all([
    prisma.order.count({
      where: { userId },
    }),
    prisma.order.count({
      where: { userId, status: "DELIVERED" },
    }),
    prisma.order.count({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] },
      },
    }),
    prisma.order.findMany({
      where: {
        userId,
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalSpent = allOrders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="rounded-[6px] border border-emerald-150 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/80 px-2 py-0.5 rounded-[6px]">
              {session.user.role}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Welcome back, {session.user.name || ""}!
          </h1>
          <p className="text-xs text-slate-500">
            Monitor orders, browse the products catalog, and manage your account.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-[6px]">
          <User className="h-4 w-4 text-emerald-600" />
          <span>{session.user.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-[6px] bg-slate-100 text-slate-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-lg font-extrabold text-slate-950 mt-0.5">{totalOrders}</p>
          </div>
        </div>

        <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-[6px] bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-lg font-extrabold text-emerald-950 mt-0.5">{completedOrders}</p>
          </div>
        </div>

        <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-[6px] bg-amber-50 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-lg font-extrabold text-amber-950 mt-0.5">{pendingOrders}</p>
          </div>
        </div>

        <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-[6px] bg-indigo-50 text-indigo-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
            <p className="text-lg font-extrabold text-indigo-950 mt-0.5">₹{totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Orders</h2>
            <Link href="/buyer/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-[6px]">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-2.5">Order Number</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-800">
                        <Link href={`/buyer/orders/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-550">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-bold text-slate-850">
                        ₹{Number(order.total).toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block rounded-[6px] border px-2 py-0.5 text-[10px] font-bold ${order.status === "DELIVERED"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : order.status === "CANCELLED" || order.status === "REJECTED"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h2>
            <p className="text-xs text-slate-500">
              Browse the catalog to view current prices, or view detailed statements of your historical purchases.
            </p>
          </div>

          <div className="space-y-2.5 pt-4">
            <Link
              href="/buyer/products"
              className="flex items-center justify-between p-3.5 rounded-[6px] border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-emerald-600" />
                <span>Browse Products Catalog</span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/buyer/orders"
              className="flex items-center justify-between p-3.5 rounded-[6px] border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
                <span>View Purchase Statement</span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
