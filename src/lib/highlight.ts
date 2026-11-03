export type TokenKind = "comment" | "string" | "tag" | "keyword" | "number" | "plain";

export type Token = Readonly<{ kind: TokenKind; text: string }>;

const KEYWORDS = [
  "as",
  "async",
  "await",
  "const",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "from",
  "function",
  "if",
  "import",
  "interface",
  "let",
  "new",
  "null",
  "return",
  "true",
  "type",
  "typeof",
  "undefined",
];

// Group order is the precedence order: a comment or string swallows any
// keyword-looking text inside it before the later alternatives are tried.
const PATTERN = new RegExp(
  [
    "(?<comment>\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)",
    "(?<string>\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`(?:\\\\.|[^`\\\\])*`)",
    "(?<tag>(?<=<\\/?)[A-Za-z][\\w.]*)",
    `(?<keyword>\\b(?:${KEYWORDS.join("|")})\\b)`,
    "(?<number>\\b\\d+(?:\\.\\d+)?\\b)",
  ].join("|"),
  "g",
);

const MATCH_KINDS: ReadonlyArray<Exclude<TokenKind, "plain">> = [
  "comment",
  "string",
  "tag",
  "keyword",
  "number",
];

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  for (const match of source.matchAll(PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) tokens.push({ kind: "plain", text: source.slice(cursor, start) });
    const kind = MATCH_KINDS.find((k) => match.groups?.[k] !== undefined) ?? "plain";
    tokens.push({ kind, text: match[0] });
    cursor = start + match[0].length;
  }
  if (cursor < source.length) tokens.push({ kind: "plain", text: source.slice(cursor) });
  return tokens;
}

/**
 * Lossless TSX highlighter: returns one token array per source line, where
 * joining every line's token texts with "\n" reproduces `source` exactly.
 * Multi-line tokens (block comments, template strings) are split across
 * lines and keep their kind on each fragment.
 */
export function highlightTsx(source: string): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokenize(source)) {
    token.text.split("\n").forEach((fragment, i) => {
      if (i > 0) lines.push([]);
      if (fragment.length > 0) lines[lines.length - 1].push({ kind: token.kind, text: fragment });
    });
  }
  return lines;
}
