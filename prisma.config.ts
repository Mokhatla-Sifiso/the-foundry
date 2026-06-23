import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

config({ path: ".env.local" });
config({ path: ".env" });

const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: datasourceUrl ? { url: datasourceUrl } : undefined,
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
