import { readFileSync } from "node:fs";
import path from "node:path";
import { highlightTsx } from "@/lib/highlight";

export const HERO_CODE_FILES = [
  "src/components/sections/Hero.tsx",
  "src/components/sections/HeroPeel.tsx",
  "src/lib/peel.ts",
  "src/components/sections/HeroCodeWall.tsx",
  "src/lib/highlight.ts",
] as const;

function CodeColumn({ file }: Readonly<{ file: string }>): React.ReactElement {
  const lines = highlightTsx(readFileSync(path.join(process.cwd(), file), "utf8"));
  if (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();

  return (
    <div className="code-col">
      <div className="code-tab">{file}</div>
      <pre className="peel-code">
        <code>
          {lines.map((tokens, lineIndex) => (
            <span className="peel-ln" key={lineIndex}>
              <span className="peel-ln-n">{lineIndex + 1}</span>
              {tokens.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  className={token.kind === "plain" ? undefined : `tk-${token.kind}`}
                >
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function HeroCodeWall(): React.ReactElement {
  return (
    <div className="code-wall">
      {HERO_CODE_FILES.map((file) => (
        <CodeColumn key={file} file={file} />
      ))}
    </div>
  );
}
