"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Plus, Trash2, ShoppingBag, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  baseUnit: string;
  basePrice: string;
  conversionFactors: any;
  currentStock: string;
  isActive: boolean;
}

interface CartItem {
  product: Product;
  orderedUnit: string;
  orderedQuantity: number;
}

export default function PlaceOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryProductId = searchParams.get("productId") || "";
  const queryUnit = searchParams.get("unit") || "";
  const queryQuantity = searchParams.get("quantity") || "1";

  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [categories, setCategories] = React.useState<string[]>([]);
  const [customerNotes, setCustomerNotes] = React.useState("");
  
  const [submitError, setSubmitError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/seller/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          
          const uniqueCats: string[] = Array.from(
            new Set(data.map((p: Product) => p.category).filter(Boolean))
          );
          setCategories(uniqueCats);

          if (queryProductId) {
            const matchedProduct = data.find((p: Product) => p.id === queryProductId);
            if (matchedProduct) {
              const units = Object.keys(matchedProduct.conversionFactors);
              const unit = units.includes(queryUnit) ? queryUnit : (units[0] || "");
              const qty = parseFloat(queryQuantity) || 1;
              setCart([{ product: matchedProduct, orderedUnit: unit, orderedQuantity: qty }]);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, [queryProductId, queryUnit, queryQuantity]);

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, orderedQuantity: item.orderedQuantity + 1 }
            : item
        )
      );
    } else {
      const units = Object.keys(product.conversionFactors);
      setCart([
        ...cart,
        {
          product,
          orderedUnit: units[0] || product.baseUnit,
          orderedQuantity: 1,
        },
      ]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, orderedQuantity: Math.max(0.0001, qty) }
          : item
      )
    );
  };

  const handleUpdateUnit = (productId: string, unit: string) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, orderedUnit: unit }
          : item
      )
    );
  };

  const getItemTotal = (item: CartItem) => {
    const factors = item.product.conversionFactors as Record<string, number>;
    const factor = factors[item.orderedUnit] || 1;
    const baseQuantity = item.orderedQuantity * factor;
    const price = baseQuantity * parseFloat(item.product.basePrice);
    return {
      baseQuantity,
      price,
      factor,
    };
  };

  const subtotal = cart.reduce((sum, item) => sum + getItemTotal(item).price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleSubmitOrder = async (isQuotation: boolean) => {
    if (cart.length === 0) {
      setSubmitError("Please add at least one product to the order sheet.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const payload = {
        customerNotes,
        isQuotation,
        items: cart.map((item) => ({
          productId: item.product.id,
          orderedUnit: item.orderedUnit,
          orderedQuantity: item.orderedQuantity,
        })),
      };

      const response = await fetch("/api/seller/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        setSubmitError(errData.error || "Failed to submit request");
        setIsSubmitting(false);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/seller/orders");
        }, 1500);
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory && p.isActive;
  });

  if (isLoadingProducts) {
    return (
      <div className="flex-1 flex flex-col h-60 items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-teal-650 animate-spin" />
        <p className="text-xs text-slate-500">Loading catalog assets...</p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-[6px] border border-emerald-200 bg-white text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[6px] bg-emerald-50 text-emerald-600 border border-emerald-250">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Request Processed Successfully!</h2>
          <p className="text-xs text-slate-500">
            Your items have been cataloged. Redirecting to transaction ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-205 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Place New Order</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select catalog items, estimate conversions, and place inventory sheets.
        </p>
      </div>

      {submitError && (
        <div className="rounded-[6px] bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[6px] border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Catalog Search</h2>
            
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SKU, item name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-750 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-[6px] border border-slate-200 bg-white p-4 shadow-sm space-y-3 max-h-[480px] overflow-y-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Products</h2>
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No matching products.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-450 font-mono">SKU: {p.sku}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        ₹{Number(p.basePrice).toFixed(2)} / {p.baseUnit} • Stock: {Number(p.currentStock)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(p)}
                      className="p-1.5 rounded-[6px] border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-teal-600" />
                <span>Order Sheet</span>
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-[6px] font-bold text-slate-600">
                {cart.length} item{cart.length !== 1 && "s"}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-250 rounded-[6px] bg-slate-50">
                Select products from the catalog to build the order sheet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const { baseQuantity, price, factor } = getItemTotal(item);
                    const units = Object.keys(item.product.conversionFactors);
                    return (
                      <div key={item.product.id} className="py-3.5 space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-[6px] uppercase tracking-wider">
                              {item.product.category || "General"}
                            </span>
                            <p className="text-xs font-bold text-slate-900 mt-1 truncate">{item.product.name}</p>
                            <p className="text-[10px] text-slate-450 font-mono mt-0.5">SKU: {item.product.sku}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="p-1.5 rounded-[6px] border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-[6px] border border-slate-150">
                          <div className="w-24">
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={item.orderedQuantity}
                              onChange={(e) => handleUpdateQuantity(item.product.id, parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-205 rounded-[6px] px-2 py-1 text-xs text-slate-800 font-bold"
                              min="0"
                            />
                          </div>

                          <div className="w-28">
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                              Order Unit
                            </label>
                            <select
                              value={item.orderedUnit}
                              onChange={(e) => handleUpdateUnit(item.product.id, e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded-[6px] px-2 py-1 text-xs text-slate-750 font-bold"
                            >
                              {units.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1 text-right font-mono text-[10px] text-slate-500">
                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                              Conversion Preview
                            </span>
                            <span>
                              {item.orderedQuantity} {item.orderedUnit} = {baseQuantity.toFixed(2)} {item.product.baseUnit}
                            </span>
                            <span className="block font-bold text-slate-800 text-xs mt-0.5">
                              ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Customer Notes (Optional)
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={2}
                    placeholder="Specific delivery or order requirements..."
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-150 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655 flex items-center gap-1">
                    <FileText className="h-4 w-4 text-indigo-650" />
                    <span>Summary Overview</span>
                  </h3>
                  
                  <div className="rounded-[6px] bg-slate-50 border border-slate-200 p-4 space-y-2 font-mono text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span className="font-bold text-slate-800">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                      <span>Est. Total:</span>
                      <span className="text-indigo-650 font-black">
                        ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={() => handleSubmitOrder(true)}
                    isLoading={isSubmitting}
                    className="flex-1 py-2.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold hover:bg-indigo-100"
                  >
                    Submit as Quotation
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmitOrder(false)}
                    isLoading={isSubmitting}
                    className="flex-1 py-2.5 text-xs bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold"
                  >
                    Submit as Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
