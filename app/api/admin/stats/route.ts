import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      activeProductsCount,
      totalOrdersCount,
      pendingOrdersCount,
      userGroups,
      deliveredSum,
      productsWithStock,
      recentOrdersList,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, sku: true, currentStock: true, minStockLevel: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(deliveredSum._sum.total || 0);

    const lowStockProducts = productsWithStock
      .filter((p) => {
        if (p.minStockLevel === null) return false;
        return Number(p.currentStock) < Number(p.minStockLevel);
      })
      .slice(0, 5);

    const lowStockCount = productsWithStock.filter((p) => {
      if (p.minStockLevel === null) return false;
      return Number(p.currentStock) < Number(p.minStockLevel);
    }).length;

    const userStats = {
      ADMIN: 0,
      SELLER: 0,
      BUYER: 0,
    };
    userGroups.forEach((g) => {
      if (g.role === "ADMIN" || g.role === "SELLER" || g.role === "BUYER") {
        userStats[g.role] = g._count.id;
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentOrders, allCompletedOrders, ordersByStatusGroup] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, status: true },
      }),
      prisma.order.findMany({
        where: { status: "DELIVERED" },
        select: { createdAt: true, total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const orderTrendsMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      orderTrendsMap[label] = 0;
    }

    recentOrders.forEach((o) => {
      const label = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (orderTrendsMap[label] !== undefined) {
        orderTrendsMap[label]++;
      }
    });

    const orderTrends = Object.entries(orderTrendsMap).map(([date, count]) => ({
      date,
      count,
    }));

    const revenueTrendsMap: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((m) => {
      revenueTrendsMap[m] = 0;
    });

    allCompletedOrders.forEach((o) => {
      const m = months[new Date(o.createdAt).getMonth()];
      if (revenueTrendsMap[m] !== undefined) {
        revenueTrendsMap[m] += Number(o.total);
      }
    });

    const revenueTrends = Object.entries(revenueTrendsMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    const statusDistribution = ordersByStatusGroup.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));

    return NextResponse.json({
      metrics: {
        activeProducts: activeProductsCount,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount,
        lowStock: lowStockCount,
        totalRevenue,
        users: userStats,
      },
      charts: {
        orderTrends,
        revenueTrends,
        statusDistribution,
      },
      recentOrders: recentOrdersList,
      lowStockProducts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to compile statistics" }, { status: 500 });
  }
}
