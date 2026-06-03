"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Box, ShoppingCart, Calculator, Plus, Trash2, X, CreditCard, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { performUnitConversion } from "@/utils/unitConversion";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  baseUnit: string;
  baseUnitType: string;
  basePrice: string;
  conversionFactors: any;
  currentStock: string;
  isActive: boolean;
  imageUrl: string | null;
  minStockLevel: string | null;
  maxStockLevel: string | null;
}

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  basePrice: number;
  baseUnit: string;
  selectedUnit: string;
  quantity: number;
  factors: any;
}

export default function BuyerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCart = searchParams.get("cart") === "true";

  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [categories, setCategories] = React.useState<string[]>([]);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [activeConfigProduct, setActiveConfigProduct] = React.useState<Product | null>(null);
  const [configUnit, setConfigUnit] = React.useState("");
  const [configQuantity, setConfigQuantity] = React.useState("1");

  const [detailProduct, setDetailProduct] = React.useState<Product | null>(null);

  const [customerNotes, setCustomerNotes] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("CARD");
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [paymentStep, setPaymentStep] = React.useState(0);
  const [orderSuccess, setOrderSuccess] = React.useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (category) query.append("category", category);

      const res = await fetch(`/api/buyer/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const uniqueCats: string[] = Array.from(
          new Set(data.map((p: Product) => p.category).filter(Boolean))
        );
        if (categories.length === 0) {
          setCategories(uniqueCats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, [debouncedSearch, category]);

  const syncCartState = () => {
    try {
      const stored = localStorage.getItem("shelfly_cart");
      if (stored) {
        setCart(JSON.parse(stored));
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }
  };

  React.useEffect(() => {
    syncCartState();
  }, []);

  const handleOpenConfig = (product: Product) => {
    setActiveConfigProduct(product);
    const units = Object.keys(product.conversionFactors);
    setConfigUnit(units[0] || product.baseUnit);
    setConfigQuantity("1");
  };

  const handleAddToCart = () => {
    if (!activeConfigProduct) return;

    const qty = parseFloat(configQuantity) || 0;
    if (qty <= 0) return;

    const newItem: CartItem = {
      productId: activeConfigProduct.id,
      name: activeConfigProduct.name,
      sku: activeConfigProduct.sku,
      basePrice: Number(activeConfigProduct.basePrice),
      baseUnit: activeConfigProduct.baseUnit,
      selectedUnit: configUnit,
      quantity: qty,
      factors: activeConfigProduct.conversionFactors,
    };

    let updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.productId === newItem.productId && item.selectedUnit === newItem.selectedUnit
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += newItem.quantity;
    } else {
      updatedCart.push(newItem);
    }

    setCart(updatedCart);
    localStorage.setItem("shelfly_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
    setActiveConfigProduct(null);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("shelfly_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingPayment(true);
    setPaymentStep(1);

    setTimeout(() => {
      setPaymentStep(2);
      setTimeout(() => {
        setPaymentStep(3);
        setTimeout(async () => {
          try {
            const res = await fetch("/api/buyer/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: cart.map((item) => ({
                  productId: item.productId,
                  orderedUnit: item.selectedUnit,
                  orderedQuantity: item.quantity,
                })),
                customerNotes,
                paymentMethod,
              }),
            });

            if (res.ok) {
              const order = await res.json();
              setCreatedOrderNumber(order.orderNumber);
              setOrderSuccess(true);
              localStorage.removeItem("shelfly_cart");
              window.dispatchEvent(new Event("cart-updated"));
              setCart([]);
            } else {
              const data = await res.json();
              alert(data.error || "Payment transaction failed");
              setIsProcessingPayment(false);
            }
          } catch (err) {
            alert("Network error processing order");
            setIsProcessingPayment(false);
          }
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const getPreviewString = (prod: Product, qtyStr: string, unit: string) => {
    const qty = parseFloat(qtyStr) || 0;
    const conversion = performUnitConversion(
      qty,
      unit,
      prod.baseUnit,
      Number(prod.basePrice),
      prod.conversionFactors
    );
    return `${qty} ${unit} = ${conversion.baseQuantity.toFixed(3)} ${prod.baseUnit} = ₹${conversion.totalPrice.toFixed(2)}`;
  };

  const getCartTotals = () => {
    let subtotal = 0;
    cart.forEach((item) => {
      const conv = performUnitConversion(
        item.quantity,
        item.selectedUnit,
        item.baseUnit,
        item.basePrice,
        item.factors
      );
      subtotal += conv.totalPrice;
    });
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const cartTotals = getCartTotals();

  if (showCart) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-205 pb-5">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Checkout Cart</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your order items and proceed to static payment.
            </p>
          </div>
          <Button
            onClick={() => router.push("/buyer/products")}
            variant="outline"
            className="text-xs py-1.5"
          >
            ← Back to Catalog
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col h-60 items-center justify-center border border-slate-200 border-dashed rounded-[6px] bg-slate-50 text-center p-6">
            <ShoppingCart className="h-10 w-10 text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1">Browse the catalog to add conversion units.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item, idx) => {
                const conv = performUnitConversion(
                  item.quantity,
                  item.selectedUnit,
                  item.baseUnit,
                  item.basePrice,
                  item.factors
                );
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 rounded-[6px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-905">{item.name}</p>
                      <p className="text-[10px] text-slate-450 font-mono">SKU: {item.sku}</p>
                      <p className="text-[10px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-[6px] inline-block">
                        {item.quantity} {item.selectedUnit} = {conv.baseQuantity.toFixed(2)} {item.baseUnit}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs font-bold text-slate-900">₹{conv.totalPrice.toFixed(2)}</p>
                      <button
                        onClick={() => handleRemoveFromCart(idx)}
                        className="p-1.5 rounded-[6px] border border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm space-y-5 h-fit">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Summary</h3>

              <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-bold text-slate-900">₹{cartTotals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2.5 border-t border-slate-50">
                  <span>Total</span>
                  <span>₹{cartTotals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Customer Notes
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                    placeholder="E.g. Delivery specifications"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="NETBANKING">Netbanking</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-2.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <CreditCard className="h-4.5 w-4.5" />
                <span>Pay & Place Order</span>
              </button>
            </div>
          </div>
        )}

        {isProcessingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl space-y-6 text-center">
              {!orderSuccess ? (
                <>
                  <Loader2 className="h-10 w-10 text-emerald-605 animate-spin mx-auto" />
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Processing Payment
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      {paymentStep === 1 && "Verifying secure credentials..."}
                      {paymentStep === 2 && "Simulating payment authorization..."}
                      {paymentStep === 3 && "Updating ledgers & stock indices..."}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-emerald-55 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Order Placed Successfully!
                    </h3>
                    <p className="text-xs text-slate-550">
                      Your static payment request completed. Reference code:
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-900">{createdOrderNumber}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsProcessingPayment(false);
                      setOrderSuccess(false);
                      router.push("/buyer/orders");
                    }}
                    className="w-full text-xs py-2 mt-4"
                  >
                    View All Orders
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-205 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse active listings, verify conversion metrics, and compile shopping sheets.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-slate-250 rounded-[6px] px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col h-60 items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 text-emerald-605 animate-spin" />
          <p className="text-xs text-slate-500">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col h-60 items-center justify-center border border-slate-200 border-dashed rounded-[6px] bg-slate-50 text-center p-6">
          <Box className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-550 mt-1">Try adjusting search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const units = Object.keys(product.conversionFactors);
            return (
              <div
                key={product.id}
                className="relative rounded-[6px] border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {product.imageUrl && (
                    <div className="w-full h-32 rounded-[6px] overflow-hidden mb-3 border border-slate-100 bg-slate-55">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-[6px]">
                      {product.category || "General"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-[6px]">
                      View Only
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{product.name}</h3>
                    <p className="text-[10px] text-slate-450 font-mono mt-0.5">SKU: {product.sku}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                      {product.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 font-medium">
                    <div className="text-slate-555">
                      <span>Rate: </span>
                      <span className="font-bold text-slate-800">₹{Number(product.basePrice).toFixed(2)}</span>
                      <span> / {product.baseUnit}</span>
                    </div>
                    <div className="text-slate-555 text-right font-mono">
                      <span>Available Stock: </span>
                      <span className="font-bold text-slate-800">{Number(product.currentStock)}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Read-Only Conversion Grid
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {units.map((unit) => {
                        const factor = product.conversionFactors[unit];
                        const price = factor * Number(product.basePrice);
                        return (
                          <span
                            key={unit}
                            className="rounded-[6px] border border-slate-100 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600 font-mono"
                          >
                            1 {unit} = {factor} {product.baseUnit} = ₹{price.toFixed(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setDetailProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Specifications</span>
                  </button>
                  <Button
                    onClick={() => handleOpenConfig(product)}
                    className="text-xs py-2 px-3 bg-emerald-600 hover:bg-emerald-500"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeConfigProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setActiveConfigProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Configure Item Quantity</h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize selection parameters before saving to shopping sheet.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider mb-1.5">
                    Conversion Unit
                  </label>
                  <select
                    value={configUnit}
                    onChange={(e) => setConfigUnit(e.target.value)}
                    className="w-full bg-white border border-slate-205 rounded-[6px] px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    {Object.keys(activeConfigProduct.conversionFactors).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-555 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={configQuantity}
                    onChange={(e) => setConfigQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-205 rounded-[6px] px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    placeholder="1.0"
                    min="0"
                  />
                </div>
              </div>

              <div className="p-4 rounded-[6px] border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <Calculator className="h-4 w-4" />
                  <span>Real-Time Preview</span>
                </div>
                <p className="text-xs text-slate-700 font-mono font-semibold">
                  {getPreviewString(activeConfigProduct, configQuantity, configUnit)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-150">
              <button
                onClick={() => setActiveConfigProduct(null)}
                className="px-4 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-655 hover:bg-slate-50"
              >
                Cancel
              </button>
              <Button
                onClick={handleAddToCart}
                className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2"
              >
                Confirm Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Product Specifications</h2>
              <p className="text-xs text-slate-550 mt-1">Read-only overview of scale configurations.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">
                    Product Name
                  </span>
                  <span className="font-bold text-slate-900">{detailProduct.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-0.5">
                    SKU Code
                  </span>
                  <span className="font-mono text-slate-700">{detailProduct.sku}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">
                    Base Unit configuration
                  </span>
                  <span className="font-bold text-slate-700">
                    {detailProduct.baseUnit} ({detailProduct.baseUnitType})
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-0.5">
                    Base Price (₹)
                  </span>
                  <span className="font-bold text-slate-850">₹{Number(detailProduct.basePrice).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                  Scale Conversion Table
                </span>
                <div className="border border-slate-150 rounded-[6px] divide-y divide-slate-100 text-xs font-mono">
                  {Object.entries(detailProduct.conversionFactors).map(([unit, factor]: any) => (
                    <div key={unit} className="flex justify-between p-2.5 hover:bg-slate-50">
                      <span className="font-bold text-slate-700">{unit}</span>
                      <span className="text-slate-550">
                        {factor} {detailProduct.baseUnit} = ₹{(Number(detailProduct.basePrice) * factor).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-150">
              <Button onClick={() => setDetailProduct(null)} className="text-xs px-4 py-2">
                Dismiss View
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
