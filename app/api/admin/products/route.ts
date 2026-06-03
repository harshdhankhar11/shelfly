import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { ProductUnit, UnitType } from "@/app/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const isActiveParam = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (isActiveParam === "true") {
      whereClause.isActive = true;
    } else if (isActiveParam === "false") {
      whereClause.isActive = false;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products,
      totalPages,
      totalCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
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

    if (!sku || !name || !baseUnit || !baseUnitType || basePrice === undefined) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
    }

    const stockVal = currentStock !== undefined ? Number(currentStock) : 0;
    const activeVal = isActive !== undefined ? !!isActive : true;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku,
          name,
          description: description || null,
          category: category || null,
          baseUnit: baseUnit as ProductUnit,
          baseUnitType: baseUnitType as UnitType,
          basePrice: Number(basePrice),
          currentStock: stockVal,
          conversionFactors: conversionFactors || { [baseUnit]: 1 },
          createdById: userId,
          isActive: activeVal,
          imageUrl: imageUrl || null,
          minStockLevel: minStockLevel !== undefined && minStockLevel !== null ? Number(minStockLevel) : null,
          maxStockLevel: maxStockLevel !== undefined && maxStockLevel !== null ? Number(maxStockLevel) : null,
        },
      });

      if (stockVal > 0) {
        await tx.inventory.create({
          data: {
            productId: product.id,
            quantity: stockVal,
            stockBefore: 0,
            stockAfter: stockVal,
            reason: "stock_added",
            userId,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId,
          action: "CREATE_PRODUCT",
          entityType: "product",
          entityId: product.id,
          newValue: JSON.stringify({ sku, name, basePrice, currentStock: stockVal }),
        },
      });

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
