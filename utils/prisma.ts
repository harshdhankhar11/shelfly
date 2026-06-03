import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma";

let prisma: PrismaClient;

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL is required to initialize PrismaClient");
    }

    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({ adapter });
}

declare global {
    var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
    prisma = createPrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = createPrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;