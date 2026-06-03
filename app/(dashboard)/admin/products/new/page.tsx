"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/components/global/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const handleCreate = async (values: any) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create product");
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Create New Product</h1>
        <p className="text-xs text-slate-550 mt-1">
          Catalog a brand new inventory item and define base price and conversion units.
        </p>
      </div>

      <div className="max-w-2xl">
        <ProductForm onSubmit={handleCreate} submitLabel="Save and Catalog Product" />
      </div>
    </main>
  );
}
