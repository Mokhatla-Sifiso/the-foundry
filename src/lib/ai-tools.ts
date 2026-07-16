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

const OPENAI_PATH =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

const VSCODE_PATH =
  "M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z";

export type ToolMark =
  | Readonly<{ kind: "icon"; name: string; path: string }>
  | Readonly<{ kind: "mono"; name: string; short: string }>;

export type ToolGroup = Readonly<{
  label: string;
  desc: string;
  tools: ReadonlyArray<ToolMark>;
}>;

export const AI_TOOLS: ReadonlyArray<ToolGroup> = [
  {
    label: "Agents in the loop",
    desc: "Draft code, refactors and tests. I review and own the result.",
    tools: [
      { kind: "icon", name: "Claude Code", path: siClaude.path },
      { kind: "icon", name: "Codex", path: OPENAI_PATH },
      { kind: "mono", name: "OpenClaw", short: "OC" },
      { kind: "icon", name: "Cursor", path: siCursor.path },
      { kind: "icon", name: "Copilot", path: siGithubcopilot.path },
    ],
  },
  {
    label: "Think & capture",
    desc: "Where ideas and specs live before they become code.",
    tools: [
      { kind: "icon", name: "Obsidian", path: siObsidian.path },
      { kind: "icon", name: "Notion", path: siNotion.path },
    ],
  },
  {
    label: "Local AI & ops",
    desc: "Private models and tracing for sensitive or offline work.",
    tools: [
      { kind: "icon", name: "Ollama", path: siOllama.path },
      { kind: "mono", name: "Open WebUI", short: "OW" },
      { kind: "mono", name: "LiteLLM", short: "LL" },
      { kind: "mono", name: "Langfuse", short: "Lf" },
    ],
  },
  {
    label: "Edit & ship",
    desc: "The path from editor to production.",
    tools: [
      { kind: "icon", name: "VS Code", path: VSCODE_PATH },
      { kind: "icon", name: "GitHub", path: siGithub.path },
      { kind: "icon", name: "Vercel", path: siVercel.path },
      { kind: "icon", name: "Linear", path: siLinear.path },
      { kind: "icon", name: "Figma", path: siFigma.path },
      { kind: "icon", name: "Warp", path: siWarp.path },
    ],
  },
];
