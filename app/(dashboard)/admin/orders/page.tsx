"use client";

import React from "react";
import Link from "next/link";
import { 
  Search, Eye, Loader2, ChevronLeft, ChevronRight, 
  Download, FileText, CheckCircle2 
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  status: string;
  paymentStatus: string;
  isQuotation: boolean;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [orderType, setOrderType] = React.useState(""); // "" (All), "false" (Order), "true" (Quotation)
  
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (status) query.append("status", status);
      if (paymentStatus) query.append("paymentStatus", paymentStatus);
      if (orderType) query.append("isQuotation", orderType);

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
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
  };

  React.useEffect(() => {
    loadOrders();
  }, [page, limit, debouncedSearch, status, paymentStatus, orderType]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "UNPAID":
        return "bg-amber-55 text-amber-700 border-amber-250";
      case "REFUNDED":
        return "bg-slate-100 text-slate-650 border-slate-200";
      case "PARTIALLY_PAID":
        return "bg-cyan-50 text-cyan-700 border-cyan-250";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order Number,Customer Name,Customer Email,Date,Total,Status,Payment Status,Type\n"];
    const rows = orders.map((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString();
      const type = o.isQuotation ? "Quotation" : "Order";
      return `"${o.orderNumber}","${o.user.fullName}","${o.user.email}","${dateStr}",${o.total},"${o.status}","${o.paymentStatus}","${type}"`;
    });
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shelfly_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Transaction Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {totalCount} total customer bookings, invoice sheets, and request quotes.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={orders.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-[6px] text-xs font-bold transition-all border border-slate-250 shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 border border-slate-200 rounded-[6px] shadow-sm">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, client name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-805 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Payments</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select
          value={orderType}
          onChange={(e) => {
            setOrderType(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Types</option>
          <option value="false">Standard Order</option>
          <option value="true">Quotation Quote</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-550 font-bold bg-slate-50">
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Date Placed</th>
                <th className="p-4">Type</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Gross Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-650" />
                      <span>Retrieving invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    No order transactions matched.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-indigo-650 font-bold">{order.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.user.fullName}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">{order.user.email}</p>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        order.isQuotation ? "text-indigo-600" : "text-emerald-650"
                      }`}>
                        {order.isQuotation ? (
                          <>
                            <FileText className="h-3 w-3" />
                            <span>Quotation</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Order</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${getPaymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-800">
                      ₹{Number(order.total).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button title="View Detail Invoice" className="p-1.5 rounded-[6px] border border-slate-200 text-slate-450 hover:text-indigo-650 hover:bg-indigo-50 transition-all bg-white shadow-sm">
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

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
            <span className="text-[10px] text-slate-500 font-semibold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-550 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-550 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
