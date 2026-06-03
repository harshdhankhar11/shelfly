import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { calculatePrice, parseConversionFactors } from "@/utils/unitConversion";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const orderedUnit = searchParams.get("orderedUnit");
    const orderedQuantityStr = searchParams.get("orderedQuantity");

    if (!productId || !orderedUnit || !orderedQuantityStr) {
      return NextResponse.json({ error: "Missing required query parameters: productId, orderedUnit, orderedQuantity" }, { status: 400 });
    }

    const orderedQuantity = parseFloat(orderedQuantityStr);
    if (isNaN(orderedQuantity)) {
      return NextResponse.json({ error: "Invalid orderedQuantity parameter" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const factors = parseConversionFactors(product.conversionFactors);
    const factor = orderedUnit === product.baseUnit ? 1 : factors[orderedUnit];

    if (factor === undefined || factor === null) {
      return NextResponse.json({ error: `Unit ${orderedUnit} is not supported for this product` }, { status: 400 });
    }

    const { baseQuantity, totalPrice } = calculatePrice(orderedQuantity, orderedUnit, product);
    const basePrice = Number(product.basePrice);

    const formula = `${orderedQuantity} × ${factor} = ${baseQuantity} ${product.baseUnit} × ₹${basePrice} = ₹${totalPrice.toFixed(2)}`;

    return NextResponse.json({
      baseQuantity,
      totalPrice,
      conversionFactorUsed: Number(factor),
      formula,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify conversion" }, { status: 500 });
  }
}
