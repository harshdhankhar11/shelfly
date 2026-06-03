"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Calendar, ShoppingCart, Info, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Product {
  id: string;
  sku: string;
  name: string;
  baseUnit: string;
  basePrice: string;
  conversionFactors: any;
}

const orderSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  orderedUnit: z.string().min(1, "Please select an order unit"),
  orderedQuantity: z.number().positive("Quantity must be greater than 0"),
  customerNotes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function PlaceOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryProductId = searchParams.get("productId") || "";
  const queryUnit = searchParams.get("unit") || "";
  const queryQuantity = searchParams.get("quantity") || "1";

  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  
  const [submitError, setSubmitError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      productId: queryProductId,
      orderedUnit: queryUnit,
      orderedQuantity: parseFloat(queryQuantity) || 1,
      customerNotes: "",
    },
  });

  const selectedProductId = watch("productId");
  const selectedUnit = watch("orderedUnit");
  const selectedQuantity = watch("orderedQuantity");

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/seller/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);

          if (queryProductId) {
            const matchedProduct = data.find((p: Product) => p.id === queryProductId);
            if (matchedProduct) {
              setValue("productId", queryProductId);
              const units = Object.keys(matchedProduct.conversionFactors);
              if (units.includes(queryUnit)) {
                setValue("orderedUnit", queryUnit);
              } else if (units.length > 0) {
                setValue("orderedUnit", units[0]);
              }
              setValue("orderedQuantity", parseFloat(queryQuantity) || 1);
            }
          } else if (data.length > 0) {
            setValue("productId", data[0].id);
            const units = Object.keys(data[0].conversionFactors);
            if (units.length > 0) {
              setValue("orderedUnit", units[0]);
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
  }, [queryProductId, queryUnit, queryQuantity, setValue]);

  React.useEffect(() => {
    if (selectedProductId && !isLoadingProducts) {
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        const units = Object.keys(product.conversionFactors);
        if (!units.includes(selectedUnit)) {
          setValue("orderedUnit", units[0] || "");
        }
      }
    }
  }, [selectedProductId, products, selectedUnit, setValue, isLoadingProducts]);

  const activeProduct = products.find((p) => p.id === selectedProductId);
  const unitsList = activeProduct ? Object.keys(activeProduct.conversionFactors) : [];

  const getPreviewData = () => {
    if (!activeProduct || !selectedUnit) {
      return { baseQuantity: 0, subtotal: 0, tax: 0, total: 0 };
    }

    const factors = activeProduct.conversionFactors as Record<string, number>;
    const factor = factors[selectedUnit] || 1;
    const qty = Number(selectedQuantity) || 0;

    const baseQuantity = qty * factor;
    const subtotal = baseQuantity * parseFloat(activeProduct.basePrice);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return { baseQuantity, subtotal, tax, total };
  };

  const { baseQuantity, subtotal, tax, total } = getPreviewData();

  const onSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/seller/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerNotes: values.customerNotes,
          items: [
            {
              productId: values.productId,
              orderedUnit: values.orderedUnit,
              orderedQuantity: values.orderedQuantity,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setSubmitError(errData.error || "Failed to place order");
        setIsSubmitting(false);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/seller/orders");
        }, 1500);
      }
    } catch (err: any) {
      setSubmitError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="flex-1 flex flex-col h-60 items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-teal-650 animate-spin" />
        <p className="text-xs text-slate-500">Loading order form components...</p>
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
          <h2 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h2>
          <p className="text-xs text-slate-500">
            Your inventory request has been recorded. Redirecting to order history...
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
          <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-655 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-teal-600" />
              <span>Order Details</span>
            </h2>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Product Selection
              </label>
              <select
                {...register("productId")}
                className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku})
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="text-[10px] text-rose-500 mt-1">{errors.productId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider mb-1.5">
                  Order Unit
                </label>
                <select
                  {...register("orderedUnit")}
                  className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {unitsList.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.orderedUnit && (
                  <p className="text-[10px] text-rose-500 mt-1">{errors.orderedUnit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-555 uppercase tracking-wider mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("orderedQuantity", { valueAsNumber: true })}
                  className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="1.0"
                  min="0"
                />
                {errors.orderedQuantity && (
                  <p className="text-[10px] text-rose-500 mt-1">{errors.orderedQuantity.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Customer Notes (Optional)
              </label>
              <textarea
                {...register("customerNotes")}
                rows={3}
                placeholder="Specific delivery or order requirements..."
                className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </form>

        <div className="rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-655 flex items-center gap-2 border-b border-slate-150 pb-3">
              <Info className="h-4 w-4 text-indigo-600" />
              <span>Checkout Preview</span>
            </h2>

            {activeProduct ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
                  <p className="text-xs font-bold text-slate-900">{activeProduct.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">SKU: {activeProduct.sku}</p>
                  <p className="text-[10px] text-slate-500">
                    Base rate: ₹{Number(activeProduct.basePrice).toFixed(2)} / {activeProduct.baseUnit}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Real-Time Unit Conversion
                  </span>
                  <div className="rounded-[6px] bg-teal-50 border border-teal-200 p-3 text-xs font-mono text-teal-800">
                    {selectedQuantity || 0} {selectedUnit || "N/A"} = {baseQuantity.toFixed(3)}{" "}
                    {activeProduct.baseUnit} = ₹
                    {total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    total
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-150 font-mono text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-950 font-bold text-sm pt-2 border-t border-slate-150">
                    <span>Est. Total:</span>
                    <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No product selected</p>
            )}
          </div>

          <div className="pt-6">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              className="w-full py-2.5 text-xs bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold"
            >
              Submit Order
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
