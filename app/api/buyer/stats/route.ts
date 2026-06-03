import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "BUYER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalOrders, completedOrders, pendingOrders, allOrders] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.count({
        where: { userId, status: "DELIVERED" },
      }),
      prisma.order.count({
        where: {
          userId,
          status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] },
        },
      }),
      prisma.order.findMany({
        where: {
          userId,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
        select: { total: true },
      }),
    ]);

    const totalSpent = allOrders.reduce((sum, order) => sum + Number(order.total), 0);

    return NextResponse.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      totalSpent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
