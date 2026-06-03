import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { 
  Plus, 
  ShoppingBag, 
  ClipboardList, 
  IndianRupee, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight 
} from "lucide-react";

export default async function SellerDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const userId = session.user.id;

  const [totalPlacedOrders, completedPlacedCount, pendingPlacedCount, totalSpentAgg] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: "DELIVERED" } }),
    prisma.order.count({ where: { userId, status: "PENDING" } }),
    prisma.order.aggregate({
      where: { userId },
      _sum: { total: true }
    })
  ]);

  const [totalSalesCount, completedSalesCount, pendingSalesCount, salesRevenueItems] = await Promise.all([
    prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              createdById: userId
            }
          }
        }
      }
    }),
    prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              createdById: userId
            }
          }
        },
        status: "DELIVERED"
      }
    }),
    prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              createdById: userId
            }
          }
        },
        status: "PENDING"
      }
    }),
    prisma.orderItem.findMany({
      where: {
        product: {
          createdById: userId
        },
        order: {
          status: "DELIVERED"
        }
      },
      select: {
        totalPrice: true
      }
    })
  ]);

  const totalSpent = totalSpentAgg._sum.total ? Number(totalSpentAgg._sum.total) : 0;
  const salesRevenue = salesRevenueItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const [recentOutgoing, recentIncoming] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              createdById: userId
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const recentOrders = [
    ...recentOutgoing.map(o => ({ ...o, type: "PURCHASE" })),
    ...recentIncoming.map(o => ({ ...o, type: "SALE" }))
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const salesStats = [
    {
      name: "Total Sales",
      value: totalSalesCount,
      icon: <ClipboardList className="h-5 w-5 text-emerald-650" />,
      borderColor: "border-emerald-100",
      bgColor: "bg-emerald-50/50",
    },
    {
      name: "Sales Revenue",
      value: `₹${salesRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <IndianRupee className="h-5 w-5 text-teal-650" />,
      borderColor: "border-teal-100",
      bgColor: "bg-teal-50/50",
    },
    {
      name: "Pending Orders",
      value: pendingSalesCount,
      icon: <Clock className="h-5 w-5 text-amber-655" />,
      borderColor: "border-amber-100",
      bgColor: "bg-amber-50/50",
    },
  ];

  const purchaseStats = [
    {
      name: "Total Orders Placed",
      value: totalPlacedOrders,
      icon: <ClipboardList className="h-5 w-5 text-indigo-650" />,
      borderColor: "border-indigo-100",
      bgColor: "bg-indigo-50/50",
    },
    {
      name: "Total Spent",
      value: `₹${totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <IndianRupee className="h-5 w-5 text-purple-655" />,
      borderColor: "border-purple-100",
      bgColor: "bg-purple-50/50",
    },
    {
      name: "Pending Orders",
      value: pendingPlacedCount,
      icon: <Clock className="h-5 w-5 text-rose-650" />,
      borderColor: "border-rose-100",
      bgColor: "bg-rose-50/50",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-705 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="relative rounded-[6px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-[6px]">
              Control Panel
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Welcome back, {session.user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered as <span className="font-semibold text-slate-700">{session.user.email}</span>
            </p>
          </div>
          <span className="rounded-[6px] border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
            {session.user.role}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Sales & Customer Orders (Incoming)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salesStats.map((stat) => (
              <div
                key={stat.name}
                className={`relative rounded-[6px] border ${stat.borderColor} ${stat.bgColor} p-5 shadow-sm overflow-hidden`}
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {stat.name}
                    </p>
                    <p className="text-xl md:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 bg-white shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Purchases & Placed Orders (Outgoing)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {purchaseStats.map((stat) => (
              <div
                key={stat.name}
                className={`relative rounded-[6px] border ${stat.borderColor} ${stat.bgColor} p-5 shadow-sm overflow-hidden`}
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {stat.name}
                    </p>
                    <p className="text-xl md:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 bg-white shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Activity Stream
            </h2>
            <Link
              href="/seller/orders"
              className="text-xs font-bold text-teal-650 hover:text-teal-700 transition-colors inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-[6px] bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={`${order.type}-${order.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-slate-800">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-[10px]">
                        <span className={`inline-block px-2 py-0.5 rounded-[6px] border text-[8px] font-extrabold ${
                          order.type === "SALE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        }`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800">
                        ₹{Number(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-[10px]">
                        <span className={`inline-block px-2 py-0.5 rounded-[6px] border text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/seller/orders/${order.id}`}
                          className="text-xs font-bold text-indigo-650 hover:text-indigo-700 transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/seller/products"
              className="group flex items-center justify-between p-4 rounded-[6px] border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-teal-50 text-teal-700 border border-teal-250">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                    Browse Products
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Explore active catalogs</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/seller/orders/new"
              className="group flex items-center justify-between p-4 rounded-[6px] border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-350 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-indigo-50 text-indigo-700 border border-indigo-250">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                    Place New Order
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Generate client invoices</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/seller/orders"
              className="group flex items-center justify-between p-4 rounded-[6px] border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-purple-50 text-purple-700 border border-purple-250">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                    View All Orders
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Track shipping statuses</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="rounded-[6px] border border-teal-200 bg-teal-50/30 p-4 border-dashed mt-4 text-center">
            <TrendingUp className="h-5 w-5 text-teal-650 mx-auto mb-2" />
            <p className="text-xs font-bold text-teal-800">Anti-Gravity Engine Active</p>
            <p className="text-[9px] text-slate-500 mt-1">
              Unit ratios and weight metrics verify in real-time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}