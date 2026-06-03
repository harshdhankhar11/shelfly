import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalOrders, completedOrders, pendingOrders, totalSpentSum] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.count({
        where: { userId, status: "DELIVERED" },
      }),
      prisma.order.count({
        where: { userId, status: "PENDING" },
      }),
      prisma.order.aggregate({
        where: { userId },
        _sum: {
          total: true,
        },
      }),
    ]);

    const totalSpent = totalSpentSum._sum.total ? Number(totalSpentSum._sum.total) : 0;

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
