import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "prisma", "migrations");
const BASELINE = "0_init";

const migrations = readdirSync(DIR).filter((name) => statSync(join(DIR, name)).isDirectory());

describe("prisma migrations", () => {
  it("are locked to PostgreSQL", () => {
    expect(readFileSync(join(DIR, "migration_lock.toml"), "utf8")).toMatch(
      /provider = "postgresql"/,
    );
  });

  it("start from a documented baseline", () => {
    expect(migrations).toContain(BASELINE);
    expect(existsSync(join(DIR, BASELINE, "BASELINE.md"))).toBe(true);
  });

  it.each(migrations.filter((name) => name !== BASELINE))(
    "%s is versioned and reversible",
    (name) => {
      expect(name).toMatch(/^\d{14}_[a-z0-9_]+$/);
      expect(existsSync(join(DIR, name, "migration.sql"))).toBe(true);
      expect(readFileSync(join(DIR, name, "down.sql"), "utf8")).toMatch(/\bDROP\b|\bALTER\b/);
    },
  );
});
