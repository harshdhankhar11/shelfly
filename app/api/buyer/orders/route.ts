import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { OrderStatus, ProductUnit } from "@/app/generated/prisma";
import { performUnitConversion } from "@/utils/unitConversion";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "BUYER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status as OrderStatus;
    }

    if (search) {
      whereClause.orderNumber = { contains: search, mode: "insensitive" };
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return NextResponse.json({ orders, totalCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "BUYER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { items, customerNotes, paymentMethod, isQuotation } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
       return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const itemsData: {
      productId: string;
      orderedUnit: ProductUnit;
      orderedQuantity: number;
      baseQuantity: number;
      unitPrice: number;
      totalPrice: number;
      conversionUsed: any;
    }[] = [];

    for (const item of items) {
      const dbProduct = productsMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product with ID ${item.productId} is not available` }, { status: 400 });
      }

      const conversion = performUnitConversion(
        item.orderedQuantity,
        item.orderedUnit,
        dbProduct.baseUnit,
        Number(dbProduct.basePrice),
        dbProduct.conversionFactors
      );

      calculatedSubtotal += conversion.totalPrice;

      itemsData.push({
        productId: item.productId,
        orderedUnit: item.orderedUnit as ProductUnit,
        orderedQuantity: item.orderedQuantity,
        baseQuantity: conversion.baseQuantity,
        unitPrice: conversion.unitPrice,
        totalPrice: conversion.totalPrice,
        conversionUsed: dbProduct.conversionFactors as any,
      });
    }

    const taxRate = 0.18;
    const tax = calculatedSubtotal * taxRate;
    const discount = 0;
    const total = calculatedSubtotal + tax - discount;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          isQuotation: isQuotation === true,
          subtotal: calculatedSubtotal,
          tax,
          discount,
          total,
          customerNotes: customerNotes || null,
          paymentStatus: isQuotation === true ? "UNPAID" : "PAID",
          paymentMethod: isQuotation === true ? null : (paymentMethod || "CARD"),
          paidAt: isQuotation === true ? null : new Date(),
        },
      });

      for (const item of itemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            orderedUnit: item.orderedUnit,
            orderedQuantity: item.orderedQuantity,
            baseQuantity: item.baseQuantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            conversionUsed: item.conversionUsed,
          },
        });

        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.baseQuantity,
            },
          },
        });

        const stockAfter = Number(updatedProduct.currentStock);
        const stockBefore = stockAfter + Number(item.baseQuantity);

        await tx.inventory.create({
          data: {
            productId: item.productId,
            quantity: -item.baseQuantity,
            stockBefore,
            stockAfter,
            reason: "ORDER_FULFILLMENT",
            referenceId: order.id,
            userId,
          },
        });
      }

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
