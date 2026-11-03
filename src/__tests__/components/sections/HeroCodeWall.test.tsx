import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { HERO_CODE_FILES, HeroCodeWall } from "@/components/sections/HeroCodeWall";
import nextConfig from "../../../../next.config";

const read = (file: string): string => readFileSync(path.join(process.cwd(), file), "utf8");

describe("HeroCodeWall", () => {
  it("renders one column per real source file, headed by its path, Hero.tsx first", () => {
    const { container } = render(<HeroCodeWall />);
    const tabs = Array.from(container.querySelectorAll(".code-tab")).map((t) => t.textContent);
    expect(tabs).toEqual([...HERO_CODE_FILES]);
    expect(tabs[0]).toBe("src/components/sections/Hero.tsx");
  });

  it("renders every file verbatim, one numbered line per source line", () => {
    const { container } = render(<HeroCodeWall />);
    const columns = Array.from(container.querySelectorAll(".code-col"));
    columns.forEach((column, i) => {
      const expected = read(HERO_CODE_FILES[i]).replace(/\n$/, "").split("\n");
      const lines = Array.from(column.querySelectorAll(".peel-ln"));
      expect(lines).toHaveLength(expected.length);
      lines.forEach((line, n) => expect(line.textContent).toBe(`${n + 1}${expected[n]}`));
    });
  });

  it("shows no em dashes anywhere on the wall (it is rendered on the homepage)", () => {
    const { container } = render(<HeroCodeWall />);
    expect(container.textContent).not.toContain(String.fromCharCode(0x2014));
  });

  it("ships every file it reads with the server bundle for /", () => {
    const traced = nextConfig.outputFileTracingIncludes?.["/"] ?? [];
    HERO_CODE_FILES.forEach((file) => expect(traced).toContain(`./${file}`));
  });
});
