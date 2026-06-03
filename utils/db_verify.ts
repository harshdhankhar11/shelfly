import "dotenv/config";
import prisma from "./prisma";

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      emailVerified: true,
    },
  });
  console.log("Updated users:", result);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
