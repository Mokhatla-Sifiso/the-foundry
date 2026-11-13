import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);

function scriptKind(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.(js|mjs|cjs)$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function scriptComments(file: string, text: string): number {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));
  const found = new Set<number>();
  const add = (ranges: ts.CommentRange[] | undefined): void => {
    for (const range of ranges ?? []) found.add(range.pos);
  };
  const inJsxText = (node: ts.Node): boolean =>
    node.parent !== undefined &&
    (node.parent.kind === ts.SyntaxKind.JsxElement ||
      node.parent.kind === ts.SyntaxKind.JsxFragment);
  const visit = (node: ts.Node): void => {
    if (ts.isJsxExpression(node) && !node.expression) {
      found.add(node.getStart(source));
      return;
    }
    if (node.kind !== ts.SyntaxKind.JsxText && !inJsxText(node)) {
      add(ts.getLeadingCommentRanges(text, node.pos));
      add(ts.getTrailingCommentRanges(text, node.end));
    }
    ts.forEachChild(node, visit);
  };
  add(ts.getLeadingCommentRanges(text, 0));
  visit(source);
  add(ts.getLeadingCommentRanges(text, source.endOfFileToken.pos));
  return found.size;
}

function cssComments(text: string): number {
  let count = 0;
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "/" && text[i + 1] === "*") {
      count++;
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 1;
    }
  }
  return count;
}

function lineComments(text: string, marker: RegExp): number {
  return text.split("\n").filter((line) => marker.test(line)).length;
}

function commentsIn(file: string): number {
  const text = readFileSync(file, "utf8");
  if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) return scriptComments(file, text);
  if (file.endsWith(".css")) return cssComments(text);
  if (file.endsWith(".sql")) return lineComments(text, /^\s*--/);
  if (file.endsWith(".prisma")) return lineComments(text, /^\s*\/\//);
  if (file.endsWith(".json")) return lineComments(text, /^\s*(\/\/|\/\*)/);
  if (file.endsWith(".md")) return (text.match(/<!--/g) ?? []).length;
  if (/(\.ya?ml|\.toml|\.env\.example|\.gitignore|\.prettierignore)$/.test(file)) {
    return lineComments(text, /^\s*#/);
  }
  return 0;
}

describe("repository hygiene", () => {
  it("has no comments in any tracked file", () => {
    const offenders = files
      .map((file) => [file, commentsIn(file)] as const)
      .filter(([, count]) => count > 0)
      .map(([file, count]) => `${file}: ${count}`);
    expect(offenders).toEqual([]);
  });
});
