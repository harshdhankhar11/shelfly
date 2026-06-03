"use client";

import React from "react";
import Link from "next/link";
import { Search, Loader2, ClipboardList, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [orderType, setOrderType] = React.useState<"incoming" | "outgoing">("incoming");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        query.append("page", page.toString());
        query.append("type", orderType);
        if (debouncedSearch) query.append("search", debouncedSearch);
        if (status) query.append("status", status);

        const res = await fetch(`/api/seller/orders?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [page, debouncedSearch, status, orderType]);

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "PENDING":
        return "bg-amber-50 text-amber-705 border-amber-250";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-250";
      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-250";
      case "SHIPPED":
        return "bg-cyan-50 text-cyan-700 border-cyan-250";
      default:
        return "bg-slate-50 text-slate-700 border-slate-250";
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-205 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Statements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track transactions, print details, and review supply histories.
          </p>
        </div>

        <Link href="/seller/orders/new">
          <Button className="text-xs flex items-center gap-1.5 py-2">
            <Plus className="h-4 w-4" />
            <span>Place Order</span>
          </Button>
        </Link>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setOrderType("incoming");
            setPage(1);
          }}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            orderType === "incoming"
              ? "border-teal-605 text-teal-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-950"
          }`}
        >
          Customer Orders
        </button>
        <button
          onClick={() => {
            setOrderType("outgoing");
            setPage(1);
          }}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            orderType === "outgoing"
              ? "border-teal-605 text-teal-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-950"
          }`}
        >
          My Placed Orders
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col h-60 items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 text-teal-655 animate-spin" />
          <p className="text-xs text-slate-500">Loading order records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col h-60 items-center justify-center border border-slate-200 border-dashed rounded-[6px] bg-slate-50 text-center p-6">
          <ClipboardList className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-550 mt-1">
            Try adjusting your search criteria or place a new order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-[6px] bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Order Number
                  </th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total
                  </th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      ₹{Number(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-[10px]">
                      <span className={`inline-block px-2.5 py-0.5 rounded-[6px] border text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/seller/orders/${order.id}`}
                        className="text-xs font-bold text-indigo-650 hover:text-indigo-700 transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * 10 + 1} - {Math.min(page * 10, totalCount)} of {totalCount} orders
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="inline-flex items-center justify-center p-2 rounded-[6px] border border-slate-200 bg-white text-slate-650 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="inline-flex items-center justify-center p-2 rounded-[6px] border border-slate-200 bg-white text-slate-655 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
