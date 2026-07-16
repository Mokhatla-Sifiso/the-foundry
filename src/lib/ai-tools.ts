import {
  siClaude,
  siCursor,
  siGithubcopilot,
  siObsidian,
  siNotion,
  siOllama,
  siGithub,
  siVercel,
  siLinear,
  siFigma,
  siWarp,
} from "simple-icons";

export type ToolMark =
  | Readonly<{ kind: "icon"; name: string; path: string }>
  | Readonly<{ kind: "word"; name: string; short: string }>;

export type ToolGroup = Readonly<{ label: string; tools: ReadonlyArray<ToolMark> }>;

export const AI_TOOLS: ReadonlyArray<ToolGroup> = [
  {
    label: "Agents in the loop",
    tools: [
      { kind: "icon", name: "Claude Code", path: siClaude.path },
      { kind: "word", name: "Codex", short: "Cx" },
      { kind: "word", name: "OpenClaw", short: "OC" },
      { kind: "icon", name: "Cursor", path: siCursor.path },
      { kind: "icon", name: "Copilot", path: siGithubcopilot.path },
    ],
  },
  {
    label: "Think & capture",
    tools: [
      { kind: "icon", name: "Obsidian", path: siObsidian.path },
      { kind: "icon", name: "Notion", path: siNotion.path },
    ],
  },
  {
    label: "Local AI & ops",
    tools: [
      { kind: "icon", name: "Ollama", path: siOllama.path },
      { kind: "word", name: "Open WebUI", short: "W" },
      { kind: "word", name: "LiteLLM", short: "L" },
      { kind: "word", name: "Langfuse", short: "Lf" },
    ],
  },
  {
    label: "Edit & ship",
    tools: [
      { kind: "word", name: "VS Code", short: "VS" },
      { kind: "icon", name: "GitHub", path: siGithub.path },
      { kind: "icon", name: "Vercel", path: siVercel.path },
      { kind: "icon", name: "Linear", path: siLinear.path },
      { kind: "icon", name: "Figma", path: siFigma.path },
      { kind: "icon", name: "Warp", path: siWarp.path },
    ],
  },
];
