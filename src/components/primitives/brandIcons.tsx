import { siClaude, siGithub } from "simple-icons";

export function IconClaude(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Claude">
      <path d={siClaude.path} />
    </svg>
  );
}

export function IconGithub(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="GitHub">
      <path d={siGithub.path} />
    </svg>
  );
}
