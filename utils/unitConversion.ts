export interface ConversionResult {
  baseQuantity: number;
  unitPrice: number;
  totalPrice: number;
  factor: number;
}

export function parseConversionFactors(factors: any): Record<string, number> {
  if (!factors) return {};
  if (typeof factors === "string") {
    try {
      return JSON.parse(factors);
    } catch {
      return {};
    }
  }
  if (typeof factors === "object") {
    return factors as Record<string, number>;
  }
  return {};
}

const UNIT_GROUPS_MAP: Record<string, "WEIGHT" | "VOLUME" | "COUNT"> = {
  KILOGRAM: "WEIGHT",
  GRAM: "WEIGHT",
  LITER: "VOLUME",
  MILLILITER: "VOLUME",
  PIECE: "COUNT",
  ITEMS: "COUNT",
};

export function convertToBaseUnit(quantity: number, fromUnit: string, product: { baseUnit: string; conversionFactors: any }): number {
  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const factors = parseConversionFactors(product.conversionFactors);
  
  if (fromUnit === product.baseUnit) {
    return quantity;
  }

  const factor = factors[fromUnit];
  if (factor === undefined || factor === null) {
    throw new Error(`Missing conversion factor for unit ${fromUnit}`);
  }

  const numFactor = Number(factor);
  if (isNaN(numFactor) || numFactor <= 0) {
    throw new Error(`Invalid conversion factor for unit ${fromUnit}`);
  }

  const fromGroup = UNIT_GROUPS_MAP[fromUnit];
  const baseGroup = UNIT_GROUPS_MAP[product.baseUnit];
  if (fromGroup && baseGroup && fromGroup !== baseGroup && !factors[fromUnit]) {
    throw new Error(`Unit group mismatch: cannot convert ${fromGroup} to ${baseGroup}`);
  }

  return quantity * numFactor;
}

export function convertFromBaseUnit(quantity: number, toUnit: string, product: { baseUnit: string; conversionFactors: any }): number {
  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const factors = parseConversionFactors(product.conversionFactors);

  if (toUnit === product.baseUnit) {
    return quantity;
  }

  const factor = factors[toUnit];
  if (factor === undefined || factor === null) {
    throw new Error(`Missing conversion factor for unit ${toUnit}`);
  }

  const numFactor = Number(factor);
  if (isNaN(numFactor) || numFactor <= 0) {
    throw new Error(`Invalid conversion factor for unit ${toUnit}`);
  }

  return quantity / numFactor;
}

export function calculatePrice(quantity: number, orderUnit: string, product: { baseUnit: string; basePrice: any; conversionFactors: any }): { baseQuantity: number; totalPrice: number } {
  const baseQuantity = convertToBaseUnit(quantity, orderUnit, product);
  const totalPrice = baseQuantity * Number(product.basePrice);
  return { baseQuantity, totalPrice };
}

export function validateConversion(product: { baseUnit: string; conversionFactors: any }, fromUnit: string, toUnit: string): boolean {
  const factors = parseConversionFactors(product.conversionFactors);

  const getFactor = (unit: string) => {
    if (unit === product.baseUnit) return 1;
    return factors[unit];
  };

  const fromFactor = getFactor(fromUnit);
  const toFactor = getFactor(toUnit);

  if (fromFactor === undefined || fromFactor === null || Number(fromFactor) <= 0) return false;
  if (toFactor === undefined || toFactor === null || Number(toFactor) <= 0) return false;

  const fromGroup = UNIT_GROUPS_MAP[fromUnit];
  const toGroup = UNIT_GROUPS_MAP[toUnit];
  if (fromGroup && toGroup && fromGroup !== toGroup) {
    if (fromUnit !== product.baseUnit && !factors[fromUnit]) return false;
    if (toUnit !== product.baseUnit && !factors[toUnit]) return false;
  }

  return true;
}

export function getAvailableConversions(product: { baseUnit: string; conversionFactors: any }): string[] {
  const factors = parseConversionFactors(product.conversionFactors);
  const units = new Set<string>();
  units.add(product.baseUnit);
  
  Object.keys(factors).forEach((unit) => {
    const val = Number(factors[unit]);
    if (val > 0) {
      units.add(unit);
    }
  });

  return Array.from(units);
}

export function formatQuantity(value: number, unit: string): string {
  const formatted = Number(value.toFixed(6));
  return `${formatted} ${unit}`;
}

export function performUnitConversion(
  quantity: number,
  selectedUnit: string,
  baseUnit: string,
  basePrice: number,
  conversionFactors: any
): ConversionResult {
  const factors = parseConversionFactors(conversionFactors);
  const factor = Number(factors[selectedUnit]) || (selectedUnit === baseUnit ? 1 : 0);

  const cleanQuantity = Math.max(0, quantity);
  const baseQuantity = cleanQuantity * factor;
  const unitPrice = basePrice * factor;
  const totalPrice = baseQuantity * basePrice;

  return {
    baseQuantity,
    unitPrice,
    totalPrice,
    factor,
  };
}
