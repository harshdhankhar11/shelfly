import "dotenv/config";
import prisma from "./prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true },
  });
  console.log("USERS:", users);

  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, createdById: true },
  });
  console.log("PRODUCTS:", products);

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  console.log("ORDERS:", JSON.stringify(orders, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
