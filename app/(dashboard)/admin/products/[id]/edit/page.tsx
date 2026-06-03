"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProductForm from "@/app/components/global/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleUpdate = async (values: any) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update product");
    }

    router.push("/admin/products");
    router.refresh();
  };

  if (isLoading) {
    return (
      <main className="flex-1 bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">
        <Loader2 className="h-6 w-6 text-indigo-650 animate-spin" />
        <span className="ml-2 text-xs">Retrieving item profile...</span>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 bg-slate-50 p-6 text-center text-slate-500 flex flex-col items-center justify-center">
        <p className="text-xs font-semibold">Product not found.</p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-semibold shadow-md"
        >
          Back to Database
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Edit Product</h1>
        <p className="text-xs text-slate-550 mt-1">
          Modify catalog properties, SKU configuration, prices, and conversion ratios.
        </p>
      </div>

      <div className="max-w-2xl">
        <ProductForm
          initialValues={{
            ...product,
            conversionFactors: product.conversionFactors ? (product.conversionFactors as Record<string, number>) : {},
          }}
          onSubmit={handleUpdate}
          submitLabel="Update Product Configuration"
        />
      </div>
    </main>
  );
}
