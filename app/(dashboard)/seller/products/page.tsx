"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Box, Calculator, ArrowRight, X, Edit, Trash2, Plus, LayoutGrid, ClipboardCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";

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

export default function BrowseProductsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<"marketplace" | "manage">("marketplace");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [categories, setCategories] = React.useState<string[]>([]);

  const [activeModalProduct, setActiveModalProduct] = React.useState<Product | null>(null);
  const [selectedUnit, setSelectedUnit] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");

  const [crudModalOpen, setCrudModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [crudError, setCrudError] = React.useState("");

  const [sku, setSku] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [prodCategory, setProdCategory] = React.useState("");
  const [baseUnit, setBaseUnit] = React.useState("GRAM");
  const [baseUnitType, setBaseUnitType] = React.useState("WEIGHT");
  const [basePrice, setBasePrice] = React.useState("1.0");
  const [currentStock, setCurrentStock] = React.useState("100");
  const [customFactors, setCustomFactors] = React.useState<{ unit: string; factor: number }[]>([]);
  const [imageUrl, setImageUrl] = React.useState("");
  const [minStockLevel, setMinStockLevel] = React.useState("");
  const [maxStockLevel, setMaxStockLevel] = React.useState("");

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
      if (activeTab === "manage") query.append("managed", "true");

      const res = await fetch(`/api/seller/products?${query.toString()}`);
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
  }, [debouncedSearch, category, activeTab]);

  React.useEffect(() => {
    if (activeModalProduct) {
      const units = Object.keys(activeModalProduct.conversionFactors);
      if (units.length > 0) {
        setSelectedUnit(units[0]);
      }
    }
  }, [activeModalProduct]);

  const handleOpenCalcModal = (product: Product) => {
    setActiveModalProduct(product);
    setQuantity("1");
  };

  const handleCloseCalcModal = () => {
    setActiveModalProduct(null);
  };

  const getCalculatedValues = () => {
    if (!activeModalProduct || !selectedUnit) return { baseQuantity: 0, totalPrice: 0 };

    const factors = activeModalProduct.conversionFactors as Record<string, number>;
    const factor = factors[selectedUnit] || 1;
    const qty = parseFloat(quantity) || 0;

    const baseQuantity = qty * factor;
    const totalPrice = baseQuantity * parseFloat(activeModalProduct.basePrice);

    return { baseQuantity, totalPrice };
  };

  const handleConfirmOrder = () => {
    if (!activeModalProduct) return;
    router.push(
      `/seller/orders/new?productId=${activeModalProduct.id}&unit=${selectedUnit}&quantity=${quantity}`
    );
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setSku("");
    setName("");
    setDescription("");
    setProdCategory("");
    setBaseUnit("GRAM");
    setBaseUnitType("WEIGHT");
    setBasePrice("1.0");
    setCurrentStock("100");
    setImageUrl("");
    setMinStockLevel("");
    setMaxStockLevel("");
    setCustomFactors([{ unit: "KILOGRAM", factor: 1000 }]);
    setCrudError("");
    setCrudModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setSku(product.sku);
    setName(product.name);
    setDescription(product.description || "");
    setProdCategory(product.category || "");
    setBaseUnit(product.baseUnit);
    setBaseUnitType(product.baseUnitType);
    setBasePrice(Number(product.basePrice).toString());
    setCurrentStock(Number(product.currentStock).toString());
    setImageUrl(product.imageUrl || "");
    setMinStockLevel(product.minStockLevel ? Number(product.minStockLevel).toString() : "");
    setMaxStockLevel(product.maxStockLevel ? Number(product.maxStockLevel).toString() : "");
    const factors = product.conversionFactors as Record<string, number>;
    const customList = Object.entries(factors)
      .filter(([unit]) => unit !== product.baseUnit)
      .map(([unit, factor]) => ({ unit, factor: Number(factor) }));
    setCustomFactors(customList);
    setCrudError("");
    setCrudModalOpen(true);
  };

  const handleCrudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError("");

    const factorsObj: Record<string, number> = {
      [baseUnit]: 1,
    };

    for (const f of customFactors) {
      if (f.unit === baseUnit) {
        setCrudError(`Custom factor cannot use the base unit "${baseUnit}"`);
        return;
      }
      if (factorsObj[f.unit]) {
        setCrudError(`Duplicate unit conversion mapping found for "${f.unit}"`);
        return;
      }
      factorsObj[f.unit] = f.factor;
    }

    const payload = {
      sku,
      name,
      description,
      category: prodCategory,
      baseUnit,
      baseUnitType,
      basePrice: parseFloat(basePrice),
      currentStock: parseFloat(currentStock),
      conversionFactors: factorsObj,
      imageUrl: imageUrl || null,
      minStockLevel: minStockLevel ? parseFloat(minStockLevel) : null,
      maxStockLevel: maxStockLevel ? parseFloat(maxStockLevel) : null,
    };

    try {
      const url = editingProduct ? `/api/seller/products/${editingProduct.id}` : "/api/seller/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCrudModalOpen(false);
        loadProducts();
      } else {
        const data = await res.json();
        setCrudError(data.error || "An error occurred");
      }
    } catch (err: any) {
      setCrudError("Network request failed");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { baseQuantity, totalPrice } = getCalculatedValues();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-205 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Toggle between marketplace browsing and seller stock management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-[6px] border border-slate-200 p-0.5 bg-slate-100/80">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all ${activeTab === "marketplace"
                  ? "bg-white text-teal-700 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all ${activeTab === "manage"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>My Products</span>
            </button>
          </div>

          {activeTab === "manage" && (
            <Button onClick={handleOpenCreateModal} className="text-xs flex items-center gap-1.5 py-1.5">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          )}
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
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-slate-250 rounded-[6px] px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
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
          <Loader2 className="h-8 w-8 text-teal-605 animate-spin" />
          <p className="text-xs text-slate-500">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col h-60 items-center justify-center border border-slate-200 border-dashed rounded-[6px] bg-slate-50 text-center p-6">
          <Box className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-550 mt-1">Try adding a new product or adjust search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const units = Object.keys(product.conversionFactors);
            return (
              <div
                key={product.id}
                className={`relative rounded-[6px] border bg-white p-5 shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between ${!product.isActive ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
                  }`}
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
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-[6px]">
                      {product.category || "General"}
                    </span>
                    <div className="flex items-center gap-2">
                      {!product.isActive && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[6px] uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                      <span className="text-[10px] text-slate-450 font-mono">SKU: {product.sku}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{product.name}</h3>
                    {(product.minStockLevel || product.maxStockLevel) && (
                      <div className="text-[9px] text-slate-450 font-mono mt-0.5 flex gap-2">
                        {product.minStockLevel && <span>Min: {Number(product.minStockLevel)}</span>}
                        {product.maxStockLevel && <span>Max: {Number(product.maxStockLevel)}</span>}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                      {product.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 font-medium">
                    <div className="text-slate-550">
                      <span>Rate: </span>
                      <span className="font-bold text-slate-800">₹{Number(product.basePrice).toFixed(2)}</span>
                      <span> / {product.baseUnit}</span>
                    </div>
                    <div className="text-slate-550 text-right">
                      <span>Stock: </span>
                      <span className="font-bold text-slate-850">{Number(product.currentStock)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Conversion Factors
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {units.map((unit) => (
                        <span
                          key={unit}
                          className="rounded-[6px] border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-655 font-mono"
                        >
                          {unit}: {product.conversionFactors[unit]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  {activeTab === "marketplace" ? (
                    <Button
                      onClick={() => handleOpenCalcModal(product)}
                      disabled={!product.isActive}
                      className="w-full text-xs py-2"
                    >
                      Order Now
                    </Button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center p-2 rounded-[6px] border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <button
              onClick={handleCloseCalcModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Conversion Calculator
              </h2>
              <p className="text-xs text-slate-550 mt-1">
                Configure quantities and verify calculations before checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-55 border border-slate-150 rounded-[6px] space-y-1">
                <p className="text-xs font-bold text-slate-900">{activeModalProduct.name}</p>
                <p className="text-[10px] text-slate-500">SKU: {activeModalProduct.sku}</p>
                <p className="text-[10px] text-slate-500">
                  Base rate: ₹{Number(activeModalProduct.basePrice).toFixed(2)} / {activeModalProduct.baseUnit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider mb-1.5">
                    Order Unit
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full bg-white border border-slate-205 rounded-[6px] px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(activeModalProduct.conversionFactors).map((unit) => (
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
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-205 rounded-[6px] px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    placeholder="1.0"
                    min="0"
                  />
                </div>
              </div>

              <div className="p-4 rounded-[6px] border border-teal-200 bg-teal-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold">
                  <Calculator className="h-4 w-4" />
                  <span>Real-Time Estimation</span>
                </div>
                <div className="space-y-1 text-xs text-slate-700 font-mono">
                  <p>
                    {parseFloat(quantity) || 0} {selectedUnit} = {baseQuantity.toFixed(3)}{" "}
                    {activeModalProduct.baseUnit}
                  </p>
                  <p className="text-slate-900 font-bold mt-1 text-sm">
                    Est. Total: ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-150">
              <button
                onClick={handleCloseCalcModal}
                className="px-4 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                className="rounded-[6px] bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white flex items-center gap-1"
              >
                <span>Add to Order Sheet</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {crudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl my-8 space-y-6">
            <button
              onClick={() => setCrudModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter product SKU, base configuration, and scaling unit matrix.
              </p>
            </div>

            {crudError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-[6px]">
                {crudError}
              </div>
            )}

            <form onSubmit={handleCrudSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="PROD-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="Fresh Milk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="Dairy"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="Pasteurized organic milk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Base Unit
                  </label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="GRAM">GRAM</option>
                    <option value="KILOGRAM">KILOGRAM</option>
                    <option value="LITER">LITER</option>
                    <option value="MILLILITER">MILLILITER</option>
                    <option value="PIECE">PIECE</option>
                    <option value="ITEMS">ITEMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Unit Type
                  </label>
                  <select
                    value={baseUnitType}
                    onChange={(e) => setBaseUnitType(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="WEIGHT">WEIGHT</option>
                    <option value="VOLUME">VOLUME</option>
                    <option value="COUNT">COUNT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Stock Level
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Min Stock Level (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Max Stock Level (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={maxStockLevel}
                    onChange={(e) => setMaxStockLevel(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Conversion Factors
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-[6px] border border-slate-150 bg-slate-50 text-xs">
                    <span className="font-semibold text-slate-600">Base Unit Factor:</span>
                    <span className="font-bold text-slate-800">{baseUnit}</span>
                    <span className="text-slate-400 font-mono">= 1</span>
                    <span className="text-[10px] text-slate-450 ml-auto italic">(Automatic)</span>
                  </div>

                  {customFactors.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={item.unit}
                        onChange={(e) => {
                          const newList = [...customFactors];
                          newList[idx].unit = e.target.value;
                          setCustomFactors(newList);
                        }}
                        className="flex-1 bg-white border border-slate-205 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      >
                        <option value="GRAM">GRAM</option>
                        <option value="KILOGRAM">KILOGRAM</option>
                        <option value="LITER">LITER</option>
                        <option value="MILLILITER">MILLILITER</option>
                        <option value="PIECE">PIECE</option>
                        <option value="ITEMS">ITEMS</option>
                      </select>

                      <span className="text-xs text-slate-400 font-mono">=</span>

                      <input
                        type="number"
                        step="any"
                        required
                        value={item.factor}
                        onChange={(e) => {
                          const newList = [...customFactors];
                          newList[idx].factor = parseFloat(e.target.value) || 0;
                          setCustomFactors(newList);
                        }}
                        className="w-24 bg-white border border-slate-205 rounded-[6px] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="Factor"
                        min="0.000001"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setCustomFactors(customFactors.filter((_, i) => i !== idx));
                        }}
                        className="p-2 rounded-[6px] border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const availableUnits = ["GRAM", "KILOGRAM", "LITER", "MILLILITER", "PIECE", "ITEMS"];
                      const usedUnits = [baseUnit, ...customFactors.map((f) => f.unit)];
                      const nextUnit = availableUnits.find((u) => !usedUnits.includes(u)) || "GRAM";
                      setCustomFactors([...customFactors, { unit: nextUnit, factor: 1 }]);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-650 hover:text-indigo-700 transition-colors pt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Conversion Unit</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setCrudModalOpen(false)}
                  className="px-4 py-2 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <Button type="submit" className="text-xs px-5 py-2">
                  {editingProduct ? "Save Changes" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
