import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
config({ path: ".env.local" });
config({ path: ".env" });
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Cannot seed.");
  process.exit(1);
}
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
const SEED_ADMINS = [{ email: "mokhatla.mzwakhe@gmail.com", name: "Mzwakhe Mokhatla" }];
async function main(): Promise<void> {
  for (const admin of SEED_ADMINS) {
    const email = admin.email.toLowerCase();
    await db.adminWhitelist.upsert({
      where: { email },
      update: { name: admin.name },
      create: { email, name: admin.name },
    });
    console.log(`  ✓ admin whitelist · ${email}`);
  }
}
main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
