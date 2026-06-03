import "dotenv/config";
import { hash } from "bcryptjs";
import prisma from "./prisma";

async function main() {
  const hashedPassword = await hash("password123", 10);
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: hashedPassword,
    },
  });
  console.log("Updated users passwords:", result);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
