import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { ProductUnit, UnitType } from "@/app/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const managed = searchParams.get("managed") === "true";

    const whereClause: any = {};

    if (managed) {
      whereClause.createdById = userId;
    } else {
      whereClause.isActive = true;
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

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
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

    const newProduct = await prisma.product.create({
      data: {
        sku,
        name,
        description: description || null,
        category: category || null,
        baseUnit: baseUnit as ProductUnit,
        baseUnitType: baseUnitType as UnitType,
        basePrice,
        currentStock: currentStock || 0,
        conversionFactors: conversionFactors || { [baseUnit]: 1 },
        createdById: userId,
        isActive: true,
        imageUrl: imageUrl || null,
        minStockLevel: minStockLevel !== undefined && minStockLevel !== null ? minStockLevel : null,
        maxStockLevel: maxStockLevel !== undefined && maxStockLevel !== null ? maxStockLevel : null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
