import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { UserRole, AccountStatus } from "@/app/generated/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;
    const { id } = await params;
    const body = await req.json();

    const { role, accountStatus } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id === adminId && role && role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot demote yourself from ADMIN role" }, { status: 400 });
    }

    if (id === adminId && accountStatus && accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "You cannot suspend your own admin account" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const dataToUpdate: any = {};

      if (role !== undefined && role !== existingUser.role) {
        dataToUpdate.role = role as UserRole;
        await tx.activityLog.create({
          data: {
            userId: adminId,
            action: "UPDATE_USER_ROLE",
            entityType: "user",
            entityId: id,
            oldValue: existingUser.role,
            newValue: role,
          },
        });
      }

      if (accountStatus !== undefined && accountStatus !== existingUser.accountStatus) {
        dataToUpdate.accountStatus = accountStatus as AccountStatus;
        await tx.activityLog.create({
          data: {
            userId: adminId,
            action: "UPDATE_USER_STATUS",
            entityType: "user",
            entityId: id,
            oldValue: existingUser.accountStatus,
            newValue: accountStatus,
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          accountStatus: true,
        },
      });

      return updatedUser;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user account" }, { status: 500 });
  }
}
