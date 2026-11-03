import { readFileSync } from "node:fs";
import path from "node:path";
import { highlightTsx, type Token } from "@/lib/highlight";

const rejoin = (lines: Token[][]): string =>
  lines.map((tokens) => tokens.map((t) => t.text).join("")).join("\n");

const kindsOf = (source: string): Array<[string, string]> =>
  highlightTsx(source)
    .flat()
    .filter((t) => t.kind !== "plain")
    .map((t) => [t.kind, t.text]);

describe("highlightTsx", () => {
  it("is lossless: rejoining the lines reproduces the source exactly", () => {
    const source = 'import { a } from "b";\n\nexport const x = 1; // note\n';
    expect(rejoin(highlightTsx(source))).toBe(source);
  });

  it("is lossless on the real Hero source file", () => {
    const file = path.join(process.cwd(), "src/components/sections/Hero.tsx");
    const source = readFileSync(file, "utf8");
    const lines = highlightTsx(source);
    expect(rejoin(lines)).toBe(source);
    expect(lines).toHaveLength(source.split("\n").length);
  });

  it("classifies keywords, strings, numbers, tags and comments", () => {
    expect(kindsOf('const a = "x"; // done')).toEqual([
      ["keyword", "const"],
      ["string", '"x"'],
      ["comment", "// done"],
    ]);
    expect(kindsOf("return <Image fill />;")).toEqual([
      ["keyword", "return"],
      ["tag", "Image"],
    ]);
    expect(kindsOf("</motion.div>")).toEqual([["tag", "motion.div"]]);
    expect(kindsOf("delay: 0.25")).toEqual([["number", "0.25"]]);
  });

  it("does not highlight keywords inside strings or comments", () => {
    expect(kindsOf('"return from import"')).toEqual([["string", '"return from import"']]);
    expect(kindsOf("// const is fine here")).toEqual([["comment", "// const is fine here"]]);
  });

  it("splits a multi-line block comment across lines, keeping its kind", () => {
    const lines = highlightTsx("/* one\ntwo */ const");
    expect(lines[0]).toEqual([{ kind: "comment", text: "/* one" }]);
    expect(lines[1]).toEqual([
      { kind: "comment", text: "two */" },
      { kind: "plain", text: " " },
      { kind: "keyword", text: "const" },
    ]);
  });

  it("does not treat digits inside identifiers as numbers", () => {
    expect(kindsOf("y2 h1")).toEqual([]);
  });
});
