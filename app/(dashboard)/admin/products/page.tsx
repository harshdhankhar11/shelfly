"use client";

import React from "react";
import Link from "next/link";
import { 
  Box, Plus, Search, Edit, Trash2, Power, Loader2, 
  ChevronLeft, ChevronRight, AlertOctagon, History 
} from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  baseUnit: string;
  basePrice: string;
  currentStock: string;
  isActive: boolean;
}

interface InventoryLog {
  id: string;
  quantity: string;
  stockBefore: string;
  stockAfter: string;
  reason: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [historyProductId, setHistoryProductId] = React.useState<string | null>(null);
  const [historyLogs, setHistoryLogs] = React.useState<InventoryLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (category) query.append("category", category);
      if (status) query.append("isActive", status);

      const res = await fetch(`/api/admin/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
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
    loadProducts();
  }, [page, limit, debouncedSearch, category, status]);

  React.useEffect(() => {
    async function loadAllCategories() {
      try {
        const res = await fetch("/api/buyer/products");
        if (res.ok) {
          const list: Product[] = await res.json();
          const cats = Array.from(new Set(list.map((p) => p.category).filter(Boolean))) as string[];
          setCategories(cats);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAllCategories();
  }, []);

  const handleToggleActive = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentVal }),
      });
      if (res.ok) {
        setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !currentVal } : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${confirmDeleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewHistory = async (productId: string) => {
    setHistoryProductId(productId);
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/inventory?productId=${productId}`);
      if (res.ok) {
        const logs = await res.json();
        setHistoryLogs(logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Products Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total of {totalCount} products cataloged. Edit base prices, inventory stocks, and unit properties.
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold transition-all shadow-md shadow-indigo-600/10">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 border border-slate-200 rounded-[6px] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-805 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value={10}>10 Per Page</option>
          <option value={25}>25 Per Page</option>
          <option value={50}>50 Per Page</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-4">SKU</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Base Unit</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    No products matching search parameters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-indigo-650 font-bold">{product.sku}</td>
                    <td className="p-4 font-bold text-slate-800">{product.name}</td>
                    <td className="p-4 text-slate-550">{product.category || "-"}</td>
                    <td className="p-4 font-bold text-slate-700">₹{Number(product.basePrice).toFixed(2)}</td>
                    <td className="p-4 text-slate-500">{product.baseUnit}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{Number(product.currentStock).toFixed(0)}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                        product.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-slate-50 text-slate-650 border-slate-200"
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        title="Toggle Active Status"
                        className="p-1 text-slate-450 hover:text-indigo-600 transition-colors"
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewHistory(product.id)}
                        title="View Stock Log"
                        className="p-1 text-slate-450 hover:text-indigo-600 transition-colors"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button title="Edit Details" className="p-1 text-slate-455 hover:text-indigo-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(product.id)}
                        title="Soft Delete Product"
                        className="p-1 text-slate-455 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[6px] border border-rose-200 bg-white p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <AlertOctagon className="h-10 w-10 text-rose-605 mx-auto animate-bounce" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Deactivate Product</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Are you sure you want to deactivate this product? This will perform a soft delete.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[6px] text-xs font-bold transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] text-xs font-bold transition-all flex items-center justify-center gap-1"
              >
                {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {historyProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-805 uppercase tracking-wider">Inventory Adjustment Ledger</h3>
              <button
                onClick={() => setHistoryProductId(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500">Loading audit history...</span>
                </div>
              ) : historyLogs.length === 0 ? (
                <p className="text-xs text-slate-450 text-center py-10">No stock change records logged for this item.</p>
              ) : (
                historyLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
                    <div>
                      <p className="font-bold text-slate-700 capitalize">{log.reason.replace("_", " ")}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${Number(log.quantity) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {Number(log.quantity) >= 0 ? "+" : ""}{Number(log.quantity).toFixed(0)}
                      </p>
                      <p className="text-[9px] text-slate-450 mt-0.5 font-medium">
                        {Number(log.stockBefore).toFixed(0)} → {Number(log.stockAfter).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
