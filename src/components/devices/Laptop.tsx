import { ASSISTANT_NAME } from "@/lib/constants";

type LaptopProps = Readonly<{ assistantName?: string }>;

/**
 * MacBook mockup — VERBATIM markup, content, and SVG data from §8.1.
 *
 * Sidebar nav, 4-stat overview, deploy sparkline (polyline points are
 * VERBATIM), and an Insights column whose bullets quote the assistant
 * by name (default "Clerk", overridable via `assistantName` to support
 * the Tweaks panel from §12).
 */
export function Laptop({ assistantName = ASSISTANT_NAME }: LaptopProps = {}): React.ReactElement {
  return (
    <div className="laptop">
      <div className="laptop-lid">
        <div className="laptop-scr">
          <aside className="ldash-side">
            <div className="ldash-logo">
              <span className="ld" />
              {assistantName}
            </div>
            <nav className="ldash-nav">
              <a className="on" href="#">
                <span className="dot" />
                Dashboard
              </a>
              <a href="#">Code Review</a>
              <a href="#">Deployments</a>
              <a href="#">Analytics</a>
              <a href="#">Settings</a>
            </nav>
          </aside>

          <main className="ldash-main">
            <div className="ldash-head">
              <h4>Today&apos;s overview</h4>
              <span className="badge">
                <i />
                {assistantName} monitoring
              </span>
            </div>

            <div className="ldash-stats">
              <div className="ldash-stat">
                <div className="sl">PRs Reviewed</div>
                <div className="sv">24</div>
                <div className="sd">↑ 12%</div>
              </div>
              <div className="ldash-stat">
                <div className="sl">Deploys</div>
                <div className="sv">12</div>
                <div className="sd">↑ 8%</div>
              </div>
              <div className="ldash-stat">
                <div className="sl">Uptime</div>
                <div className="sv">99.8%</div>
                <div className="sd">↑ 0.3%</div>
              </div>
              <div className="ldash-stat">
                <div className="sl">Tests</div>
                <div className="sv">847</div>
                <div className="sd">↑ 5%</div>
              </div>
            </div>

            <div className="ldash-chart">
              <div className="ldash-ch">
                <div className="ct">Deploys — 7 days</div>
                <svg viewBox="0 0 200 50" width="100%" height={40} aria-hidden="true">
                  <polyline
                    points="0,42 28,38 56,40 84,30 112,32 140,22 168,15 200,8"
                    stroke="var(--candy)"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="ldash-ch ldash-ins">
                <div className="it">{assistantName} Insights</div>
                <div className="ib">
                  <span className="id" />
                  Sprint velocity up 15% — consider tighter cycles
                </div>
                <div className="ib">
                  <span className="id" />
                  3 PRs need attention before merge
                </div>
                <div className="ib">
                  <span className="id" />
                  API latency spike at 02:14 — auto-resolved
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="laptop-base">
        <div className="laptop-notch" />
      </div>
    </div>
  );
}
