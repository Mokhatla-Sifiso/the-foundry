import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (pooled Neon connection string).",
    );
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}

/**
 * Lazy Prisma proxy. We never construct the real client until something
 * actually touches it (model accessor, $connect, etc.). This keeps `next build`
 * from instantiating Prisma during page-data collection — important because
 * builds run without DATABASE_URL on CI.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
    const value = Reflect.get(globalForPrisma.prisma, prop, receiver);
    return typeof value === "function" ? value.bind(globalForPrisma.prisma) : value;
  },
});
