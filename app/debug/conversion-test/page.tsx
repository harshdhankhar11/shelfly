"use client";

import React from "react";
import Link from "next/link";
import { 
  Play, CheckCircle, XCircle, AlertTriangle, ArrowLeftRight, 
  Download, Loader2, ArrowLeft, RefreshCw 
} from "lucide-react";
import { 
  convertToBaseUnit, convertFromBaseUnit, calculatePrice, 
  validateConversion, getAvailableConversions, formatQuantity 
} from "@/utils/unitConversion";

interface Product {
  id: string;
  name: string;
  sku: string;
  baseUnit: string;
  basePrice: string;
  conversionFactors: any;
}

interface TestResult {
  scenario: string;
  caseName: string;
  passed: boolean;
  expectedBase: number | string;
  actualBase: number | string;
  expectedPrice: number | string;
  actualPrice: number | string;
  error?: string;
}

export default function ConversionTestPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);

  const [inputUnit, setInputUnit] = React.useState("");
  const [inputQuantity, setInputQuantity] = React.useState(1);
  const [testerResult, setTesterResult] = React.useState<any>(null);
  const [testerError, setTesterError] = React.useState<string | null>(null);

  const [bulkResults, setBulkResults] = React.useState<TestResult[]>([]);
  const [isRunningBulk, setIsRunningBulk] = React.useState(false);

  const [rtUnitFrom, setRtUnitFrom] = React.useState("");
  const [rtQty, setRtQty] = React.useState(2.5);
  const [rtResult, setRtResult] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          const list = data.products || [];
          setProducts(list);
          if (list.length > 0) {
            setSelectedProductId(list[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  React.useEffect(() => {
    if (selectedProduct) {
      const units = getAvailableConversions(selectedProduct);
      if (units.length > 0) {
        setInputUnit(units[0]);
        setRtUnitFrom(units[0]);
      }
    }
  }, [selectedProductId, selectedProduct]);

  const handleTestRun = () => {
    if (!selectedProduct) return;
    setTesterError(null);
    setTesterResult(null);

    try {
      const { baseQuantity, totalPrice } = calculatePrice(inputQuantity, inputUnit, selectedProduct);
      const parsedFactors = typeof selectedProduct.conversionFactors === "string" 
        ? JSON.parse(selectedProduct.conversionFactors) 
        : selectedProduct.conversionFactors || {};
      const factor = inputUnit === selectedProduct.baseUnit ? 1 : parsedFactors[inputUnit] || 0;

      setTesterResult({
        ordered: formatQuantity(inputQuantity, inputUnit),
        baseQty: formatQuantity(baseQuantity, selectedProduct.baseUnit),
        price: totalPrice,
        factor,
        formula: `${inputQuantity} × ${factor} = ${baseQuantity} ${selectedProduct.baseUnit} × ₹${Number(selectedProduct.basePrice)} = ₹${totalPrice.toFixed(2)}`
      });
    } catch (err: any) {
      setTesterError(err.message || "Failed to run calculation");
    }
  };

  React.useEffect(() => {
    if (selectedProduct && inputUnit) {
      handleTestRun();
    }
  }, [selectedProductId, inputUnit, inputQuantity]);

  const runRoundTrip = () => {
    if (!selectedProduct || !rtUnitFrom) return;
    try {
      const baseQty = convertToBaseUnit(rtQty, rtUnitFrom, selectedProduct);
      const backQty = convertFromBaseUnit(baseQty, rtUnitFrom, selectedProduct);
      const diff = Math.abs(backQty - rtQty);
      const passed = diff < 0.0001;

      setRtResult({
        baseQty: formatQuantity(baseQty, selectedProduct.baseUnit),
        backQty: formatQuantity(backQty, rtUnitFrom),
        passed,
        formula: `${rtQty} ${rtUnitFrom} ➔ ${baseQty} ${selectedProduct.baseUnit} ➔ ${backQty} ${rtUnitFrom}`
      });
    } catch (err: any) {
      setRtResult({
        error: err.message || "Conversion failed"
      });
    }
  };

  React.useEffect(() => {
    if (selectedProduct && rtUnitFrom) {
      runRoundTrip();
    }
  }, [selectedProductId, rtUnitFrom, rtQty]);

  const runBulkVerification = async () => {
    setIsRunningBulk(true);
    const resultsList: TestResult[] = [];

    const scenario1 = {
      name: "Scenario 1: Weight (Base = KILOGRAM)",
      product: { baseUnit: "KILOGRAM", basePrice: "400", conversionFactors: { KILOGRAM: 1, GRAM: 0.001, PIECE: 0.25 } },
      cases: [
        { unit: "KILOGRAM", qty: 2.5, expBase: 2.5, expPrice: 1000 },
        { unit: "GRAM", qty: 500, expBase: 0.5, expPrice: 200 },
        { unit: "GRAM", qty: 750, expBase: 0.75, expPrice: 300 },
        { unit: "PIECE", qty: 10, expBase: 2.5, expPrice: 1000 },
        { unit: "PIECE", qty: 1, expBase: 0.25, expPrice: 100 },
        { unit: "KILOGRAM", qty: 0.1, expBase: 0.1, expPrice: 40 },
      ]
    };

    const scenario2 = {
      name: "Scenario 2: Weight (Base = GRAM)",
      product: { baseUnit: "GRAM", basePrice: "0.50", conversionFactors: { GRAM: 1, KILOGRAM: 1000, PIECE: 5 } },
      cases: [
        { unit: "GRAM", qty: 100, expBase: 100, expPrice: 50 },
        { unit: "KILOGRAM", qty: 2, expBase: 2000, expPrice: 1000 },
        { unit: "KILOGRAM", qty: 0.5, expBase: 500, expPrice: 250 },
        { unit: "PIECE", qty: 10, expBase: 50, expPrice: 25 },
      ]
    };

    const scenario3 = {
      name: "Scenario 3: Volume (Base = LITER)",
      product: { baseUnit: "LITER", basePrice: "500", conversionFactors: { LITER: 1, MILLILITER: 0.001 } },
      cases: [
        { unit: "LITER", qty: 3, expBase: 3, expPrice: 1500 },
        { unit: "MILLILITER", qty: 1500, expBase: 1.5, expPrice: 750 },
        { unit: "MILLILITER", qty: 250, expBase: 0.25, expPrice: 125 },
      ]
    };

    const scenario4 = {
      name: "Scenario 4: Volume (Base = MILLILITER)",
      product: { baseUnit: "MILLILITER", basePrice: "2", conversionFactors: { MILLILITER: 1, LITER: 1000 } },
      cases: [
        { unit: "MILLILITER", qty: 30, expBase: 30, expPrice: 60 },
        { unit: "LITER", qty: 0.1, expBase: 100, expPrice: 200 },
        { unit: "LITER", qty: 0.05, expBase: 50, expPrice: 100 },
      ]
    };

    const scenario5 = {
      name: "Scenario 5: Count (Base = PIECE)",
      product: { baseUnit: "PIECE", basePrice: "25", conversionFactors: { PIECE: 1, ITEMS: 1 } },
      cases: [
        { unit: "PIECE", qty: 10, expBase: 10, expPrice: 250 },
        { unit: "ITEMS", qty: 5, expBase: 5, expPrice: 125 },
        { unit: "PIECE", qty: 1, expBase: 1, expPrice: 25 },
      ]
    };

    const runSc = (sc: any) => {
      sc.cases.forEach((c: any) => {
        try {
          const { baseQuantity, totalPrice } = calculatePrice(c.qty, c.unit, sc.product);
          const baseMatch = Math.abs(baseQuantity - c.expBase) < 0.0001;
          const priceMatch = Math.abs(totalPrice - c.expPrice) < 0.0001;
          const passed = baseMatch && priceMatch;

          resultsList.push({
            scenario: sc.name,
            caseName: `${c.qty} ${c.unit}`,
            passed,
            expectedBase: c.expBase,
            actualBase: baseQuantity,
            expectedPrice: `₹${c.expPrice}`,
            actualPrice: `₹${totalPrice}`,
          });
        } catch (err: any) {
          resultsList.push({
            scenario: sc.name,
            caseName: `${c.qty} ${c.unit}`,
            passed: false,
            expectedBase: c.expBase,
            actualBase: "ERROR",
            expectedPrice: `₹${c.expPrice}`,
            actualPrice: "ERROR",
            error: err.message || "Failed"
          });
        }
      });
    };

    runSc(scenario1);
    runSc(scenario2);
    runSc(scenario3);
    runSc(scenario4);
    runSc(scenario5);

    const scenario6Cases = [
      { from: "KILOGRAM", to: "LITER", product: { baseUnit: "KILOGRAM", conversionFactors: { KILOGRAM: 1, GRAM: 0.001 } } },
      { from: "GRAM", to: "MILLILITER", product: { baseUnit: "GRAM", conversionFactors: { GRAM: 1, KILOGRAM: 1000 } } },
      { from: "LITER", to: "KILOGRAM", product: { baseUnit: "LITER", conversionFactors: { LITER: 1, MILLILITER: 0.001 } } },
      { from: "LITER", to: "PIECE", product: { baseUnit: "LITER", conversionFactors: { LITER: 1, MILLILITER: 0.001 } } }
    ];

    scenario6Cases.forEach((c) => {
      try {
        const isValid = validateConversion(c.product, c.from, c.to);
        const passed = !isValid; 

        resultsList.push({
          scenario: "Scenario 6: Cross-Type Mismatch",
          caseName: `${c.from} ➔ ${c.to}`,
          passed,
          expectedBase: "INVALID (FALSE)",
          actualBase: isValid ? "VALID (TRUE)" : "INVALID (FALSE)",
          expectedPrice: "N/A",
          actualPrice: "N/A",
        });
      } catch (err: any) {
        resultsList.push({
          scenario: "Scenario 6: Cross-Type Mismatch",
          caseName: `${c.from} ➔ ${c.to}`,
          passed: true, 
          expectedBase: "ERROR THROWN",
          actualBase: "ERROR THROWN",
          expectedPrice: "N/A",
          actualPrice: "N/A",
          error: err.message
        });
      }
    });

    const scenario7Cases = [
      { unit: "KILOGRAM", qty: 0.123456, expBase: 0.123456, product: { baseUnit: "KILOGRAM", basePrice: 1000, conversionFactors: { KILOGRAM: 1, GRAM: 0.001 } } },
      { unit: "GRAM", qty: 123.456, expBase: 123.456, product: { baseUnit: "GRAM", basePrice: 1, conversionFactors: { GRAM: 1, KILOGRAM: 1000 } } },
      { unit: "KILOGRAM", qty: 0.000001, expBase: 0.000001, product: { baseUnit: "KILOGRAM", basePrice: 100000, conversionFactors: { KILOGRAM: 1, GRAM: 0.001 } } },
      { unit: "KILOGRAM", qty: 1000000, expBase: 1000000, product: { baseUnit: "KILOGRAM", basePrice: 1.50, conversionFactors: { KILOGRAM: 1 } } }
    ];

    scenario7Cases.forEach((c) => {
      try {
        const baseQty = convertToBaseUnit(c.qty, c.unit, c.product);
        const passed = Math.abs(baseQty - c.expBase) < 0.0000001;

        resultsList.push({
          scenario: "Scenario 7: Precision & Extreme Bounds",
          caseName: `${c.qty} ${c.unit}`,
          passed,
          expectedBase: c.expBase,
          actualBase: baseQty,
          expectedPrice: "N/A",
          actualPrice: "N/A"
        });
      } catch (err: any) {
        resultsList.push({
          scenario: "Scenario 7: Precision & Extreme Bounds",
          caseName: `${c.qty} ${c.unit}`,
          passed: false,
          expectedBase: c.expBase,
          actualBase: "ERROR",
          expectedPrice: "N/A",
          actualPrice: "N/A",
          error: err.message
        });
      }
    });

    setBulkResults(resultsList);
    setIsRunningBulk(false);
  };

  const exportBulkJSON = () => {
    if (bulkResults.length === 0) return;
    const blob = new Blob([JSON.stringify(bulkResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `conversion_verification_report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
          <Link href="/admin">
            <button className="p-2 rounded-[6px] border border-slate-200 hover:bg-white bg-slate-50 text-slate-650 transition shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Conversion Verification Suite</h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify accuracy of unit conversion parameters, dynamic price calculations, and decimals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Section A: Product Selector</h3>
            {isLoadingProducts ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Loading products metadata...</span>
              </div>
            ) : products.length === 0 ? (
              <p className="text-xs text-slate-450">No products found in the catalog.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="bg-slate-50 p-4 rounded-[6px] border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Unit:</span>
                      <span className="font-bold text-slate-800">{selectedProduct.baseUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Price:</span>
                      <span className="font-bold text-slate-800">₹{Number(selectedProduct.basePrice).toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Conversion Factors Mapping:</span>
                      <pre className="text-[10px] bg-white border border-slate-200 p-2 rounded text-slate-600 overflow-x-auto font-mono">
                        {typeof selectedProduct.conversionFactors === "string"
                          ? selectedProduct.conversionFactors
                          : JSON.stringify(selectedProduct.conversionFactors, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Section B: Conversion Calculator</h3>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Input Quantity</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={inputQuantity}
                      onChange={(e) => setInputQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Unit</label>
                    <select
                      value={inputUnit}
                      onChange={(e) => setInputUnit(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
                    >
                      {getAvailableConversions(selectedProduct).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {testerError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-[6px] text-rose-700 text-xs font-semibold">
                    {testerError}
                  </div>
                )}

                {testerResult && (
                  <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-[6px] text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Ordered:</span>
                      <span className="font-bold text-slate-800">{testerResult.ordered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Base Quantity:</span>
                      <span className="font-bold text-slate-800">{testerResult.baseQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Calculated Price:</span>
                      <span className="font-bold text-slate-805">₹{testerResult.price.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-indigo-200/50">
                      <span className="text-[10px] font-bold text-indigo-600 block">Calculation Path:</span>
                      <code className="text-[10px] text-indigo-900 font-mono block mt-1">{testerResult.formula}</code>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-450">Select a product configuration on the left to activate calculator.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Section D: Round-trip Test</h3>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Input Quantity</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={rtQty}
                      onChange={(e) => setRtQty(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Unit</label>
                    <select
                      value={rtUnitFrom}
                      onChange={(e) => setRtUnitFrom(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
                    >
                      {getAvailableConversions(selectedProduct).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {rtResult && (
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-[6px] text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Test Evaluation:</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        rtResult.passed 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {rtResult.passed ? "PASS ✓" : rtResult.error ? "FAILED ❌" : "INACCURATE ⚠️"}
                      </span>
                    </div>

                    {!rtResult.error ? (
                      <div className="space-y-1 text-slate-700">
                        <p>1. Target input: <span className="font-bold">{rtQty} {rtUnitFrom}</span></p>
                        <p>2. Calculated base: <span className="font-bold">{rtResult.baseQty}</span></p>
                        <p>3. Restored quantity: <span className="font-bold">{rtResult.backQty}</span></p>
                        <p className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 mt-2">
                          Trace: {rtResult.formula}
                        </p>
                      </div>
                    ) : (
                      <p className="text-rose-600 font-semibold">{rtResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-455">Activate product selector to run round trip tests.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-[6px] shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Section C: Bulk Test Runner</h3>
              <p className="text-xs text-slate-500 mt-2">
                Executes all weight, volume, count, cross-type mismatches, and precision boundaries validation matrices.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isRunningBulk}
                onClick={runBulkVerification}
                className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-[6px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isRunningBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                <span>Run Bulk Tests</span>
              </button>
              {bulkResults.length > 0 && (
                <button
                  onClick={exportBulkJSON}
                  className="px-3.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-[6px] text-xs font-bold transition-all shadow-sm"
                  title="Export Report to JSON"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {bulkResults.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-805 uppercase tracking-wider">Bulk Report Details</h3>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-650 font-bold px-2 py-0.5 rounded-full">
                {bulkResults.filter((r) => r.passed).length} / {bulkResults.length} Cases Passed
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="p-3">Scenario</th>
                    <th className="p-3">Test Case</th>
                    <th className="p-3">Expected Base</th>
                    <th className="p-3">Actual Base</th>
                    <th className="p-3">Expected Price</th>
                    <th className="p-3">Actual Price</th>
                    <th className="p-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulkResults.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-700">{r.scenario}</td>
                      <td className="p-3 font-mono text-slate-600">{r.caseName}</td>
                      <td className="p-3 font-mono text-slate-500">{r.expectedBase}</td>
                      <td className="p-3 font-mono text-slate-800 font-bold">{r.actualBase}</td>
                      <td className="p-3 font-mono text-slate-500">{r.expectedPrice}</td>
                      <td className="p-3 font-mono text-slate-800 font-bold">{r.actualPrice}</td>
                      <td className="p-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          r.passed 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {r.passed ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>PASS</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>FAIL</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
