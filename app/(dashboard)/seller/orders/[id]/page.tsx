"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, FileText, Loader2, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface OrderItem {
  id: string;
  orderedUnit: string;
  orderedQuantity: string;
  baseQuantity: string;
  unitPrice: string;
  totalPrice: string;
  conversionUsed: any;
  product: {
    name: string;
    sku: string;
    baseUnit: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  customerNotes: string | null;
  adminNotes: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  userId: string;
  items: OrderItem[];
}

export default function SellerOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [status, setStatus] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState("");

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setStatus(data.status);
      } else {
        const data = await res.json();
        setError(data.error || "Order not found");
      }
    } catch {
      setError("Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id || !status) return;
    setIsUpdating(true);
    setUpdateMessage("");
    try {
      const res = await fetch(`/api/seller/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setUpdateMessage("Order status updated successfully!");
        setTimeout(() => setUpdateMessage(""), 3000);
        const updated = await res.json();
        setOrder((prev) => (prev ? { ...prev, status: updated.status } : null));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Network error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-705 border-emerald-250";
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

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-teal-655 animate-spin" />
        <p className="text-xs text-slate-500 mt-2">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">Access Denied</h3>
          <p className="text-xs text-slate-550 mt-1">{error || "You do not own items in this order."}</p>
        </div>
        <button
          onClick={() => router.push("/seller/orders")}
          className="px-4 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/seller/orders"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs text-slate-500 font-semibold">Back to Orders</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-205 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              Order {order.orderNumber}
            </h1>
            <span className={`inline-block px-2.5 py-0.5 rounded-[6px] border text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-505 mt-1">
            Invoice created on {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-750">Items List</h2>
            
            <div className="overflow-x-auto border border-slate-200 rounded-[6px] bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Ordered Qty
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Base Qty
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item) => {
                    const conv = item.conversionUsed as any;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-805">{item.product.name}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-mono">SKU: {item.product.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-medium text-slate-700">
                          {Number(item.orderedQuantity)} {item.orderedUnit}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500 font-mono">
                          {Number(item.baseQuantity)} {conv?.baseUnit || item.product.baseUnit}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-600 font-mono">
                          ₹{Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-800 font-mono">
                          ₹{Number(item.totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Ratio Verification Summary
              </h3>
              <div className="space-y-2">
                {order.items.map((item) => {
                  const conv = item.conversionUsed as any;
                  return (
                    <div
                      key={item.id}
                      className="rounded-[6px] border border-teal-200 bg-teal-50/40 p-3 text-xs font-mono text-teal-800"
                    >
                      {item.product.name}: {Number(item.orderedQuantity)} {item.orderedUnit} ={" "}
                      {Number(item.baseQuantity).toFixed(3)} {conv?.baseUnit || item.product.baseUnit} (scale factor:{" "}
                      {conv?.factor || 1})
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-750">Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-[6px] border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer Notes
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {order.customerNotes || "No customer notes attached."}
                </p>
              </div>

              <div className="p-4 rounded-[6px] border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Internal Notes
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {order.adminNotes || "No internal notes recorded."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-750 border-b border-slate-150 pb-3">
              Fulfillment Workflow
            </h2>

            {updateMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-[6px] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{updateMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Modify Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="w-full py-2 rounded-[6px] bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Update Lifecycle Status</span>
              </button>
            </div>
          </div>

          <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-750 border-b border-slate-150 pb-3">
              Financial Summary
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-550">
                <span>Subtotal:</span>
                <span>₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-550">
                <span>Tax (5%):</span>
                <span>₹{Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-550">
                <span>Discount:</span>
                <span>₹{Number(order.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-3 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>₹{Number(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="rounded-[6px] border border-indigo-200 bg-indigo-50/40 p-4 border-dashed space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                <FileText className="h-4 w-4" />
                <span>Billing Details</span>
              </div>
              <div className="text-[10px] text-slate-650 font-mono space-y-1">
                <p>Payment: <span className="font-semibold text-slate-800">{order.paymentStatus}</span></p>
                {order.paymentMethod && <p>Method: {order.paymentMethod}</p>}
                {order.paidAt && <p>Paid At: {new Date(order.paidAt).toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
