import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { ProductUnit, UnitType } from "@/app/generated/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
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
      imageUrl,
      minStockLevel,
      maxStockLevel,
      isActive,
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (sku && sku !== existingProduct.sku) {
      const skuCheck = await prisma.product.findUnique({
        where: { sku },
      });
      if (skuCheck) {
        return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
      }
    }

    const newStock = currentStock !== undefined ? Number(currentStock) : Number(existingProduct.currentStock);
    const oldStock = Number(existingProduct.currentStock);

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          sku: sku || existingProduct.sku,
          name: name || existingProduct.name,
          description: description !== undefined ? description : existingProduct.description,
          category: category !== undefined ? category : existingProduct.category,
          baseUnit: (baseUnit as ProductUnit) || existingProduct.baseUnit,
          baseUnitType: (baseUnitType as UnitType) || existingProduct.baseUnitType,
          basePrice: basePrice !== undefined ? Number(basePrice) : existingProduct.basePrice,
          currentStock: newStock,
          conversionFactors: conversionFactors || existingProduct.conversionFactors,
          isActive: isActive !== undefined ? !!isActive : existingProduct.isActive,
          imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
          minStockLevel: minStockLevel !== undefined ? (minStockLevel !== null ? Number(minStockLevel) : null) : existingProduct.minStockLevel,
          maxStockLevel: maxStockLevel !== undefined ? (maxStockLevel !== null ? Number(maxStockLevel) : null) : existingProduct.maxStockLevel,
        },
      });

      if (newStock !== oldStock) {
        await tx.inventory.create({
          data: {
            productId: id,
            quantity: newStock - oldStock,
            stockBefore: oldStock,
            stockAfter: newStock,
            reason: "adjustment",
            userId,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId,
          action: "UPDATE_PRODUCT",
          entityType: "product",
          entityId: id,
          oldValue: JSON.stringify({
            sku: existingProduct.sku,
            name: existingProduct.name,
            basePrice: Number(existingProduct.basePrice),
            currentStock: oldStock,
            isActive: existingProduct.isActive,
          }),
          newValue: JSON.stringify({
            sku: updatedProduct.sku,
            name: updatedProduct.name,
            basePrice: Number(updatedProduct.basePrice),
            currentStock: newStock,
            isActive: updatedProduct.isActive,
          }),
        },
      });

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const softDeletedProduct = await tx.product.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: "DELETE_PRODUCT",
          entityType: "product",
          entityId: id,
          oldValue: JSON.stringify({ name: existingProduct.name, sku: existingProduct.sku, isActive: true }),
          newValue: JSON.stringify({ name: existingProduct.name, sku: existingProduct.sku, isActive: false }),
        },
      });

      return softDeletedProduct;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to soft delete product" }, { status: 500 });
  }
}
