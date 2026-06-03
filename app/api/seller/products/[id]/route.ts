import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { ProductUnit, UnitType } from "@/app/generated/prisma";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const userId = session.user.id;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.createdById !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You do not own this product" }, { status: 403 });
    }

    const body = await req.json();
    const {
      sku,
      name,
      description,
      category,
      baseUnit,
      baseUnitType,
      basePrice,
      currentStock,
      conversionFactors,
      isActive,
      imageUrl,
      minStockLevel,
      maxStockLevel,
    } = body;

    if (sku && sku !== product.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingProduct) {
        return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        sku: sku !== undefined ? sku : product.sku,
        name: name !== undefined ? name : product.name,
        description: description !== undefined ? description : product.description,
        category: category !== undefined ? category : product.category,
        baseUnit: baseUnit !== undefined ? (baseUnit as ProductUnit) : product.baseUnit,
        baseUnitType: baseUnitType !== undefined ? (baseUnitType as UnitType) : product.baseUnitType,
        basePrice: basePrice !== undefined ? basePrice : product.basePrice,
        currentStock: currentStock !== undefined ? currentStock : product.currentStock,
        conversionFactors: conversionFactors !== undefined ? conversionFactors : product.conversionFactors,
        isActive: isActive !== undefined ? isActive : product.isActive,
        imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
        minStockLevel: minStockLevel !== undefined ? minStockLevel : product.minStockLevel,
        maxStockLevel: maxStockLevel !== undefined ? maxStockLevel : product.maxStockLevel,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const userId = session.user.id;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.createdById !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You do not own this product" }, { status: 403 });
    }

    const orderLinkCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderLinkCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Product is referenced in existing orders. Soft-deleted successfully." });
    } else {
      await prisma.product.delete({
        where: { id },
      });
      return NextResponse.json({ message: "Product deleted successfully." });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
