"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Loader2 } from "lucide-react";

const productSchema = zod.object({
  sku: zod.string().min(1, "SKU is required"),
  name: zod.string().min(1, "Name is required"),
  description: zod.string().optional(),
  category: zod.string().optional(),
  baseUnit: zod.enum(["GRAM", "KILOGRAM", "LITER", "MILLILITER", "PIECE", "ITEMS"]),
  baseUnitType: zod.enum(["WEIGHT", "VOLUME", "COUNT"]),
  basePrice: zod.coerce.number().min(0.000001, "Base price must be greater than zero"),
  currentStock: zod.coerce.number().min(0, "Stock level cannot be negative"),
  minStockLevel: zod.coerce.number().optional().nullable(),
  maxStockLevel: zod.coerce.number().optional().nullable(),
  isActive: zod.boolean().default(true),
  conversionFactors: zod.record(zod.string(), zod.coerce.number()),
  imageUrl: zod.string().url("Must be a valid URL").or(zod.string().length(0)).optional().nullable(),
});

type ProductFormValues = zod.infer<typeof productSchema>;

const UNIT_GROUPS = {
  WEIGHT: ["KILOGRAM", "GRAM"],
  VOLUME: ["LITER", "MILLILITER"],
  COUNT: ["PIECE", "ITEMS"],
};

const DEFAULT_CONVERSIONS: Record<string, Record<string, number>> = {
  KILOGRAM: { KILOGRAM: 1, GRAM: 0.001 },
  GRAM: { GRAM: 1, KILOGRAM: 1000 },
  LITER: { LITER: 1, MILLILITER: 0.001 },
  MILLILITER: { MILLILITER: 1, LITER: 1000 },
  PIECE: { PIECE: 1, ITEMS: 1 },
  ITEMS: { ITEMS: 1, PIECE: 1 },
};

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel: string;
}

export default function ProductForm({ initialValues, onSubmit, submitLabel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: initialValues?.sku || "",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      category: initialValues?.category || "",
      baseUnit: initialValues?.baseUnit || "KILOGRAM",
      baseUnitType: initialValues?.baseUnitType || "WEIGHT",
      basePrice: initialValues?.basePrice || 0,
      currentStock: initialValues?.currentStock || 0,
      minStockLevel: initialValues?.minStockLevel || null,
      maxStockLevel: initialValues?.maxStockLevel || null,
      isActive: initialValues?.isActive ?? true,
      conversionFactors: initialValues?.conversionFactors || { KILOGRAM: 1, GRAM: 0.001 },
      imageUrl: initialValues?.imageUrl || "",
    },
  });

  const baseUnit = useWatch({ control, name: "baseUnit" });
  const basePrice = useWatch({ control, name: "basePrice" }) || 0;
  const conversionFactors = useWatch({ control, name: "conversionFactors" }) || {};

  React.useEffect(() => {
    let type: "WEIGHT" | "VOLUME" | "COUNT" = "WEIGHT";
    if (baseUnit === "LITER" || baseUnit === "MILLILITER") {
      type = "VOLUME";
    } else if (baseUnit === "PIECE" || baseUnit === "ITEMS") {
      type = "COUNT";
    }
    setValue("baseUnitType", type);

    const defaultConvs = DEFAULT_CONVERSIONS[baseUnit] || {};
    setValue("conversionFactors", defaultConvs);
  }, [baseUnit, setValue]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(values);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getApplicableUnits = () => {
    if (baseUnit === "KILOGRAM" || baseUnit === "GRAM") return UNIT_GROUPS.WEIGHT;
    if (baseUnit === "LITER" || baseUnit === "MILLILITER") return UNIT_GROUPS.VOLUME;
    return UNIT_GROUPS.COUNT;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm">
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-[6px] text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">SKU Code (Unique)</label>
          <input
            type="text"
            {...register("sku")}
            placeholder="e.g. TECH-ANK-10"
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
          {errors.sku && <p className="text-[10px] text-rose-600 font-semibold">{(errors.sku as any)?.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Product Name</label>
          <input
            type="text"
            {...register("name")}
            placeholder="e.g. Power Bank 10k"
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
          {errors.name && <p className="text-[10px] text-rose-600 font-semibold">{(errors.name as any)?.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Description</label>
        <textarea
          rows={3}
          {...register("description")}
          placeholder="Brief summary of item properties..."
          className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Category</label>
          <input
            type="text"
            {...register("category")}
            placeholder="e.g. Electronics, Dairy"
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Image URL</label>
          <input
            type="text"
            {...register("imageUrl")}
            placeholder="e.g. https://domain.com/image.jpg"
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
          {errors.imageUrl && <p className="text-[10px] text-rose-600 font-semibold">{(errors.imageUrl as any)?.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Base Unit</label>
          <select
            {...register("baseUnit")}
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
          >
            <option value="KILOGRAM">KILOGRAM</option>
            <option value="GRAM">GRAM</option>
            <option value="LITER">LITER</option>
            <option value="MILLILITER">MILLILITER</option>
            <option value="PIECE">PIECE</option>
            <option value="ITEMS">ITEMS</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Unit Type (Auto)</label>
          <input
            type="text"
            disabled
            {...register("baseUnitType")}
            className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Base Price (₹ INR)</label>
          <input
            type="number"
            step="0.000001"
            {...register("basePrice")}
            placeholder="Base unit price"
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
          {errors.basePrice && <p className="text-[10px] text-rose-600 font-semibold">{(errors.basePrice as any)?.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Initial Stock</label>
          <input
            type="number"
            step="0.01"
            {...register("currentStock")}
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Min Alert Stock</label>
          <input
            type="number"
            step="0.1"
            {...register("minStockLevel")}
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Max Stock Alert</label>
          <input
            type="number"
            step="0.1"
            {...register("maxStockLevel")}
            className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-4 rounded-[6px] space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Conversion Factors (Unit Conversions)</h4>
          <p className="text-[10px] text-slate-500 mt-1">
            Specify the conversion factor multiplier: how many base units (e.g. {baseUnit}) make up one unit of the custom unit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {getApplicableUnits().map((unit) => {
            if (unit === baseUnit) return null;
            return (
              <div key={unit} className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">
                  1 {unit} = [Multiplier] {baseUnit}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    {...register(`conversionFactors.${unit}`)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
          <p className="font-bold text-indigo-600">Live Formula Preview:</p>
          {getApplicableUnits().map((unit) => {
            const multiplier = Number(conversionFactors[unit]) || (unit === baseUnit ? 1 : 0);
            const computedPrice = Number(basePrice) * multiplier;
            return (
              <p key={unit} className="font-mono">
                1 {unit} = {multiplier} {baseUnit} (Calculated Price: ₹{computedPrice.toFixed(2)})
              </p>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" {...register("isActive")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
          Product is Active (Available for Orders)
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[6px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{submitLabel}</span>
      </button>
    </form>
  );
}
