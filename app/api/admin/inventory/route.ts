import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || "";
    const reason = searchParams.get("reason") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (productId) {
      whereClause.productId = productId;
    }

    if (reason) {
      whereClause.reason = reason;
    }

    const [logs, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              sku: true,
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch inventory history" }, { status: 500 });
  }
}
