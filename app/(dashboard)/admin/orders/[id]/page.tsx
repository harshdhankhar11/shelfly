"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Loader2, Save, BadgeCheck, AlertTriangle, 
  Clock, CheckCircle, Package, Truck, Check, RefreshCw 
} from "lucide-react";

interface OrderItem {
  id: string;
  orderedUnit: string;
  orderedQuantity: string;
  baseQuantity: string;
  unitPrice: string;
  totalPrice: string;
  product: {
    sku: string;
    name: string;
    baseUnit: string;
    basePrice: string;
    conversionFactors: any;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  isQuotation: boolean;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone: string | null;
  };
  items: OrderItem[];
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingStatus, setIsSavingStatus] = React.useState(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState(false);
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);

  const [adminNotes, setAdminNotes] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [selectedPayment, setSelectedPayment] = React.useState("");

  const [showStatusConfirm, setShowStatusConfirm] = React.useState(false);

  const loadOrderDetails = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setAdminNotes(data.adminNotes || "");
        setSelectedStatus(data.status);
        setSelectedPayment(data.paymentStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    setIsSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (res.ok) {
        setShowStatusConfirm(false);
        loadOrderDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleUpdatePayment = async (newPay: string) => {
    setSelectedPayment(newPay);
    setIsSavingPayment(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPay }),
      });
      if (res.ok) {
        loadOrderDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (res.ok) {
        loadOrderDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleApproveQuotation = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approveQuotation: true }),
      });
      if (res.ok) {
        loadOrderDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const verifyConversion = (item: OrderItem) => {
    const factors = item.product.conversionFactors || {};
    const factor = Number(factors[item.orderedUnit]) || (item.orderedUnit === item.product.baseUnit ? 1 : 0);
    const expectedBaseQty = Number(item.orderedQuantity) * factor;
    const diff = Math.abs(expectedBaseQty - Number(item.baseQuantity));
    return diff < 0.0001;
  };

  if (isLoading) {
    return (
      <main className="flex-1 bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">
        <Loader2 className="h-6 w-6 text-indigo-650 animate-spin" />
        <span className="ml-2 text-xs">Parsing order specifications...</span>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex-1 bg-slate-50 p-6 text-center text-slate-500 flex flex-col items-center justify-center">
        <p className="text-xs font-semibold">Order details not found.</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold shadow-md"
        >
          Return to Ledger
        </button>
      </main>
    );
  }

  const steps = [
    { label: "Created", statusVal: "PENDING", icon: Clock },
    { label: "Confirmed", statusVal: "CONFIRMED", icon: Package },
    { label: "Shipped", statusVal: "SHIPPED", icon: Truck },
    { label: "Delivered", statusVal: "DELIVERED", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.statusVal === order.status);

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-2 pb-5 border-b border-slate-200">
        <button
          onClick={() => router.push("/admin/orders")}
          className="p-2 rounded-[6px] border border-slate-200 text-slate-500 hover:text-slate-800 bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-800">Invoice: {order.orderNumber}</h1>
            {order.isQuotation && (
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-full">
                Quotation Quote
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-450 font-mono mt-0.5">ID: {order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-6">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Fulfillment timeline</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStepIndex && order.status !== "CANCELLED" && order.status !== "REJECTED";
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.label} className="flex-1 flex items-center gap-3 w-full relative z-10">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted 
                        ? "bg-indigo-50 border-indigo-500 text-indigo-600 shadow-md shadow-indigo-600/5" 
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                      <StepIcon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className={`block text-xs font-bold ${isCompleted ? "text-indigo-600" : "text-slate-550"}`}>
                        {step.label}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block font-semibold">
                        {isCurrent ? "Active State" : isCompleted ? "Completed" : "Awaiting"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Ordered items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-55">
                    <th className="p-3">Product Detail</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Ordered Qty</th>
                    <th className="p-3">Base Qty</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Total</th>
                    <th className="p-3 text-right">Ratio Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => {
                    const isMatched = verifyConversion(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{item.product.name}</td>
                        <td className="p-3 font-mono text-slate-500">{item.product.sku}</td>
                        <td className="p-3 font-bold text-slate-700">
                          {Number(item.orderedQuantity).toFixed(0)} {item.orderedUnit}
                        </td>
                        <td className="p-3 text-slate-500">
                          {Number(item.baseQuantity).toFixed(0)} {item.product.baseUnit}
                        </td>
                        <td className="p-3 text-slate-600">₹{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="p-3 font-bold text-slate-850">₹{Number(item.totalPrice).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                            isMatched 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {isMatched ? (
                              <>
                                <BadgeCheck className="h-3.5 w-3.5" />
                                <span>✓ Ratio matches</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>⚠️ Check conversion</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end gap-1.5 pt-4 border-t border-slate-200 text-xs font-semibold">
              <div className="flex justify-between w-64 text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-500">
                <span>Tax calculations:</span>
                <span className="font-mono">₹{Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-500">
                <span>Discount applied:</span>
                <span className="font-mono">-₹{Number(order.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-black text-slate-800 pt-2 border-t border-slate-200">
                <span>Gross Total:</span>
                <span className="font-mono">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-2">
              <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Customer Notes</h3>
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-[6px] min-h-[60px] italic">
                {order.customerNotes || "No customer comments provided for this transaction."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Admin Comments</h3>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="flex items-center gap-1 text-[10px] text-indigo-650 hover:text-indigo-750 font-bold"
                >
                  {isSavingNotes ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Notes</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Append internal logs or fulfillment references..."
                className="w-full bg-white border border-slate-250 rounded-[6px] p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Fulfillment Controls</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Order Status</label>
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded-[6px] px-2.5 py-2 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <button
                    onClick={() => setShowStatusConfirm(true)}
                    className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Payment Status</label>
                <div className="flex items-center gap-1">
                  <select
                    value={selectedPayment}
                    onChange={(e) => handleUpdatePayment(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-2.5 py-2 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                  {isSavingPayment && <Loader2 className="h-4 w-4 animate-spin text-indigo-600 ml-1" />}
                </div>
              </div>

              {order.isQuotation && (
                <button
                  onClick={handleApproveQuotation}
                  disabled={isApproving}
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Approve Quotation</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">Buyer Profile</h3>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Full Name</span>
                <p className="font-bold text-slate-800 mt-0.5">{order.user.fullName}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Email Address</span>
                <p className="font-bold text-slate-700 mt-0.5 block truncate font-mono">{order.user.email}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Contact Number</span>
                <p className="font-bold text-slate-800 mt-0.5">{order.user.phone || "Not provided"}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Order Placed</span>
                <p className="text-slate-500 mt-0.5 font-mono">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showStatusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <RefreshCw className="h-10 w-10 text-indigo-600 mx-auto animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Update Status</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Are you sure you want to transition this transaction to status <span className="font-black text-indigo-650">{selectedStatus}</span>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                disabled={isSavingStatus}
                onClick={() => setShowStatusConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[6px] text-xs font-bold border border-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={isSavingStatus}
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-[6px] text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {isSavingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
