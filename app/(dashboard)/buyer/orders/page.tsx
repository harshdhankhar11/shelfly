"use client";

import React from "react";
import Link from "next/link";
import { Search, Loader2, ClipboardList, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: string;
  status: string;
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (status) query.append("status", status);

      const res = await fetch(`/api/buyer/orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, [page, debouncedSearch, status]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-205 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review historical purchase invoices, delivery status, and verification metrics.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col h-60 items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 text-emerald-605 animate-spin" />
          <p className="text-xs text-slate-500">Loading orders list...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col h-60 items-center justify-center border border-slate-200 border-dashed rounded-[6px] bg-slate-50 text-center p-6">
          <ClipboardList className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-550 mt-1">Orders you place will appear here.</p>
        </div>
      ) : (
        <div className="rounded-[6px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {order.orderNumber}
                    </td>
                    <td className="p-4 text-slate-550">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-slate-850">
                      ₹{Number(order.total).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded-[6px] border px-2 py-0.5 text-[10px] font-bold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : order.status === "CANCELLED" || order.status === "REJECTED"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/buyer/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-4 border-t border-slate-150 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
