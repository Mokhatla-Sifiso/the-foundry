import { IconGithub } from "@/components/primitives/brandIcons";

export function TabletDevice(): React.ReactElement {
  return (
    <>
      <div className="tablet-scr gh">
        <div className="gh-top">
          <span className="gh-mark" aria-hidden="true">
            <IconGithub />
          </span>
          <span className="gh-pr">
            v1 access system <span className="gh-num">#25</span>
          </span>
          <span className="gh-merged">Merged</span>
        </div>
        <div className="gh-checks">
          <div className="gh-ck">
            <span className="gh-ok" aria-hidden="true" />
            Type-check · Lint · Test · Build
            <span className="gh-mut">58s</span>
          </div>
          <div className="gh-ck">
            <span className="gh-ok" aria-hidden="true" />
            329 tests passed
            <span className="gh-mut">coverage ✓</span>
          </div>
          <div className="gh-ck">
            <span className="gh-ok" aria-hidden="true" />
            Vercel — production
            <span className="gh-mut">ready</span>
          </div>
        </div>
        <div className="gh-ship">All checks passed · shipped</div>
      </div>
    </>
  );
}
