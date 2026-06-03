import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma";

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                baseUnit: true,
                basePrice: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch order details" }, { status: 500 });
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

    const { status, paymentStatus, adminNotes, approveQuotation } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const dataToUpdate: any = {};

      if (status !== undefined && status !== existingOrder.status) {
        dataToUpdate.status = status as OrderStatus;
        await tx.activityLog.create({
          data: {
            userId,
            action: "UPDATE_ORDER_STATUS",
            entityType: "order",
            entityId: id,
            oldValue: existingOrder.status,
            newValue: status,
          },
        });
      }

      if (paymentStatus !== undefined && paymentStatus !== existingOrder.paymentStatus) {
        dataToUpdate.paymentStatus = paymentStatus as PaymentStatus;
        if (paymentStatus === "PAID") {
          dataToUpdate.paidAt = new Date();
        }
        await tx.activityLog.create({
          data: {
            userId,
            action: "UPDATE_ORDER_PAYMENT",
            entityType: "order",
            entityId: id,
            oldValue: existingOrder.paymentStatus,
            newValue: paymentStatus,
          },
        });
      }

      if (adminNotes !== undefined && adminNotes !== existingOrder.adminNotes) {
        dataToUpdate.adminNotes = adminNotes;
        await tx.activityLog.create({
          data: {
            userId,
            action: "UPDATE_ORDER_NOTES",
            entityType: "order",
            entityId: id,
            oldValue: existingOrder.adminNotes || "",
            newValue: adminNotes,
          },
        });
      }

      if (approveQuotation === true && existingOrder.isQuotation) {
        dataToUpdate.isQuotation = false;
        dataToUpdate.approvedById = userId;
        dataToUpdate.approvedAt = new Date();
        await tx.activityLog.create({
          data: {
            userId,
            action: "APPROVE_QUOTATION",
            entityType: "order",
            entityId: id,
            oldValue: "true",
            newValue: "false",
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: dataToUpdate,
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
