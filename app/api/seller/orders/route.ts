import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { ProductUnit, OrderStatus } from "@/app/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 10;
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "outgoing";
    const status = searchParams.get("status") || "";

    const whereClause: any = {};
    if (type === "incoming") {
      whereClause.items = {
        some: {
          product: {
            createdById: userId,
          },
        },
      };
    } else {
      whereClause.userId = userId;
    }

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
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      orders,
      totalCount,
      page,
      totalPages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
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
    const { items, customerNotes, isQuotation } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsData: {
      productId: string;
      orderedUnit: ProductUnit;
      orderedQuantity: number;
      baseQuantity: number;
      unitPrice: number;
      totalPrice: number;
      conversionUsed: any;
    }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, orderedUnit, orderedQuantity } = item;

      if (!productId || !orderedUnit || orderedQuantity <= 0) {
        return NextResponse.json({ error: "Invalid order item specifications" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product not found or inactive: ${productId}` }, { status: 404 });
      }

      const factors = product.conversionFactors as Record<string, number>;
      const factor = factors[orderedUnit];

      if (factor === undefined) {
        return NextResponse.json({ error: `Unsupported unit ${orderedUnit} for product ${product.name}` }, { status: 400 });
      }

      const baseQuantity = orderedQuantity * factor;
      const unitPrice = Number(product.basePrice) * factor;
      const totalPrice = orderedQuantity * unitPrice;

      subtotal += totalPrice;

      itemsData.push({
        productId,
        orderedUnit: orderedUnit as ProductUnit,
        orderedQuantity,
        baseQuantity,
        unitPrice,
        totalPrice,
        conversionUsed: {
          unit: orderedUnit,
          factor,
          baseUnit: product.baseUnit,
        },
      });
    }

    const tax = subtotal * 0.05;
    const discount = 0;
    const total = subtotal + tax - discount;

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          isQuotation: isQuotation === true,
          subtotal,
          tax,
          discount,
          total,
          customerNotes: customerNotes || null,
          paymentStatus: "UNPAID",
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
