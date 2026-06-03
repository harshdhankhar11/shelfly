"use client";

import React from "react";
import { Loader2, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

interface InventoryRecord {
  id: string;
  quantity: string;
  stockBefore: string;
  stockAfter: string;
  reason: string;
  createdAt: string;
  product: {
    sku: string;
    name: string;
  };
  user: {
    fullName: string;
    email: string;
  };
}

export default function AdminInventoryPage() {
  const [logs, setLogs] = React.useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [reason, setReason] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (reason) query.append("reason", reason);

      const res = await fetch(`/api/admin/inventory?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // The API returns the array directly or paginated object, let's normalize
        if (Array.isArray(data)) {
          setLogs(data);
          // Since the API returns a raw array in route.ts, let's count total based on lengths or hardcode page count
          setTotalPages(data.length < limit ? page : page + 1);
          setTotalCount(data.length);
        } else {
          setLogs(data.logs || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadLogs();
  }, [page, limit, reason]);

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Inventory Adjustments Log</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail of all product stock increments, decrements, and sales fulfillments.
          </p>
        </div>
      </div>

      <div className="flex gap-3 bg-white p-4 border border-slate-200 rounded-[6px] shadow-sm max-w-xs">
        <select
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setPage(1);
          }}
          className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-705 focus:border-indigo-500 outline-none"
        >
          <option value="">All Adjustment Reasons</option>
          <option value="INITIAL_STOCK">Initial Stock Creation</option>
          <option value="STOCK_ADJUSTMENT">Manual Stock Correction</option>
          <option value="ORDER_FULFILLMENT">Order Fulfillment Sale</option>
          <option value="CANCELLED_ORDER">Order Cancellation Revert</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-4">Product Name</th>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Shift Value</th>
                <th className="p-4">Stock Span</th>
                <th className="p-4">Reason Category</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-650" />
                      <span>Fetching inventory audits...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                    No inventory adjustments recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const qtyVal = Number(log.quantity);
                  const isPositive = qtyVal >= 0;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{log.product?.name || "Deleted Product"}</td>
                      <td className="p-4 font-mono text-indigo-650 font-bold">{log.product?.sku || "-"}</td>
                      <td className={`p-4 font-black ${isPositive ? "text-emerald-600" : "text-rose-650"}`}>
                        {isPositive ? "+" : ""}{qtyVal.toFixed(0)}
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {Number(log.stockBefore).toFixed(0)} → {Number(log.stockAfter).toFixed(0)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                          log.reason === "ORDER_FULFILLMENT" 
                            ? "bg-indigo-50 text-indigo-750 border-indigo-100" 
                            : log.reason === "INITIAL_STOCK" 
                            ? "bg-teal-50 text-teal-750 border-teal-100" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {log.reason.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-700">{log.user?.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{log.user?.email}</p>
                      </td>
                      <td className="p-4 text-slate-450 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
            <span className="text-[10px] text-slate-550 font-semibold">
              Showing page {page}
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
                disabled={logs.length < limit}
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
