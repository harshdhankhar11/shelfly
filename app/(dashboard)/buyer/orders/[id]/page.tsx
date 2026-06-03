"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Printer, ShieldAlert, Receipt, CheckCircle2, Truck, Calendar, ShoppingBag } from "lucide-react";

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
  createdAt: string;
  items: OrderItem[];
}

export default function BuyerOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/buyer/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
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

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-emerald-605 animate-spin" />
        <p className="text-xs text-slate-500 mt-2">Retrieving invoice data...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">Access Denied</h3>
          <p className="text-xs text-slate-550 mt-1">{error || "You do not have access to this resource."}</p>
        </div>
        <button
          onClick={() => router.push("/buyer/orders")}
          className="px-4 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:py-0 print:px-0">
      <div className="flex justify-between items-center border-b border-slate-205 pb-5 print:hidden">
        <button
          onClick={() => router.push("/buyer/orders")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>My Orders</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-6 print:border-none print:shadow-none">
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[6px]">
                {order.paymentStatus}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-[6px]">
                {order.status}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-mono tracking-tight mt-1">
              Invoice: {order.orderNumber}
            </h2>
            <p className="text-xs text-slate-550 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Issued on {new Date(order.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <div className="text-right">
            <h1 className="text-base font-extrabold text-slate-900">Shelfly Market</h1>
            <p className="text-xs text-slate-500 mt-0.5">Secure B2B Inventory Solutions</p>
          </div>
        </div>

        <div className="py-4 border-b border-slate-100 print:hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
            Order Status Progression
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto text-xs">
            {steps.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-2 flex-1 w-full justify-center">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center font-bold font-mono border ${
                      isCurrent
                        ? "bg-emerald-600 border-emerald-600 text-white animate-pulse"
                        : isPast
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-bold leading-none ${
                        isCurrent ? "text-emerald-700" : isPast ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchase Items</h3>
          <div className="border border-slate-150 rounded-[6px] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Ordered Qty / Unit</th>
                  <th className="p-3 font-mono">Conversion Verification</th>
                  <th className="p-3">Unit Rate</th>
                  <th className="p-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/20">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{item.product.name}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">SKU: {item.product.sku}</p>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {Number(item.orderedQuantity)} {item.orderedUnit}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      {Number(item.orderedQuantity)} {item.orderedUnit} = {Number(item.baseQuantity).toFixed(3)} {item.product.baseUnit}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      ₹{Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{Number(item.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            {order.customerNotes && (
              <div className="p-4 rounded-[6px] border border-slate-200 bg-slate-50 space-y-1">
                <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  Customer Delivery Instruction
                </span>
                <p className="text-xs text-slate-700 italic">"{order.customerNotes}"</p>
              </div>
            )}

            {order.adminNotes && (
              <div className="p-4 rounded-[6px] border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Fulfillment Notes (Admin)
                </span>
                <p className="text-xs text-slate-750 italic">"{order.adminNotes}"</p>
              </div>
            )}
          </div>

          <div className="rounded-[6px] border border-slate-150 p-4 space-y-2.5 text-xs bg-slate-50/50">
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal</span>
              <span className="font-bold text-slate-800">₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (GST 18%)</span>
              <span className="font-bold text-slate-800">₹{Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span className="font-bold text-rose-650">-₹{Number(order.discount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2.5 border-t border-slate-200">
              <span>Grand Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
