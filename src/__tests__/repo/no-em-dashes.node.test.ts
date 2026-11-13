import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const EM_DASH = new RegExp([", ", "&" + "mdash;", "&" + "#8212;", "\\\\u2014"].join("|"));

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !/\.(png|jpe?g|gif|ico|pdf|woff2?|ttf|otf)$/i.test(file));

describe("repository hygiene", () => {
  it("has no em dashes in any tracked text file", () => {
    const offenders = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      if (text.includes("\u0000")) return false;
      if (file === "src/__tests__/repo/no-em-dashes.node.test.ts") return false;
      return EM_DASH.test(text);
    });
    expect(offenders).toEqual([]);
  });
});
