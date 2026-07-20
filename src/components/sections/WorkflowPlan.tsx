import { Reveal } from "@/components/primitives/Reveal";
import { fetchProject, relTime, type Lang, type Project, type Pull } from "@/lib/github";

/* ================================================================== *
 * Live project dashboard — real data from the connected GitHub repo:
 * pull-request activity, language mix, and contributors. Server
 * component; data is fetched with ISR (5 min).
 * ================================================================== */
export async function WorkflowPlan(): Promise<React.ReactElement> {
  const project = await fetchProject();
  return (
    <section id="workflow" className="sec lp">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Ways of working
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lp-h">
            How I deliver <span className="em">what I ship.</span>
          </h2>
        </Reveal>
        {project ? <Dashboard project={project} /> : <Unavailable />}
      </div>
    </section>
  );
}

/* ---- language accent colours (fall back to the site accent) ---- */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  CSS: "#663399",
  HTML: "#e34c26",
  Shell: "#89e051",
  MDX: "#fcb32c",
  Dockerfile: "#384d54",
  PLpgSQL: "#336790",
  Python: "#3572a5",
};
const langColor = (name: string): string => LANG_COLORS[name] ?? "var(--candy)";

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }): React.ReactElement {
  return (
    <div className="lp-kpi">
      <span className="lp-kpi-value">{value}</span>
      <span className="lp-kpi-label">{label}</span>
      {sub ? <span className="lp-kpi-sub">{sub}</span> : null}
    </div>
  );
}

function ActivityRow({ pull, now }: { pull: Pull; now: number }): React.ReactElement {
  const verb = pull.state === "merged" ? "Merged" : pull.state === "closed" ? "Closed" : "Opened";
  return (
    <a className="lp-act" href={pull.url} target="_blank" rel="noreferrer">
      <span className={`lp-badge lp-badge--${pull.state}`}>{verb}</span>
      <span className="lp-act-title">{pull.title}</span>
      <span className="lp-act-meta">
        #{pull.number} · {pull.author} · {relTime(pull.at, now)}
      </span>
    </a>
  );
}

function LangBar({ languages }: { languages: readonly Lang[] }): React.ReactElement {
  return (
    <>
      <div className="lp-langbar" role="img" aria-label="Language breakdown">
        {languages.map((l) => (
          <span key={l.name} style={{ width: `${l.pct}%`, background: langColor(l.name) }} title={`${l.name} ${l.pct}%`} />
        ))}
      </div>
      <ul className="lp-langlist">
        {languages.map((l) => (
          <li key={l.name}>
            <span className="lp-dot" style={{ background: langColor(l.name) }} aria-hidden="true" />
            {l.name} <span className="lp-langpct">{l.pct}%</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Dashboard({ project }: { project: Project }): React.ReactElement {
  const { repo, pulls, openPulls, mergedPulls, languages, contributors } = project;
  // Render-time snapshot for the relative timestamps (server component, ISR-cached).
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return (
    <Reveal delay={0.12} className="lp-card">
      <header className="lp-head">
        <div className="lp-id">
          <span className="lp-kicker">Live project</span>
          <a className="lp-repo" href={repo.url} target="_blank" rel="noreferrer">
            {repo.fullName}
          </a>
        </div>
        <a className="lp-live" href={repo.url} target="_blank" rel="noreferrer">
          <span className="lp-live-dot" aria-hidden="true" />
          Live · pushed {relTime(repo.pushedAt, now)}
        </a>
      </header>
      {repo.description ? <p className="lp-desc">{repo.description}</p> : null}

      <div className="lp-kpis">
        <Kpi label="Pull requests" value={openPulls + mergedPulls} sub={`${openPulls} open · ${mergedPulls} merged`} />
        <Kpi label="Contributors" value={contributors.length || "—"} />
        <Kpi label="Languages" value={languages.length || "—"} sub={repo.language ?? undefined} />
        <Kpi label="Stars" value={repo.stars} sub={`${repo.forks} forks`} />
      </div>

      <div className="lp-grid">
        <section className="lp-panel lp-activity">
          <h3 className="lp-panel-h">Recent pull requests</h3>
          {pulls.length ? (
            <div className="lp-actlist">
              {pulls.map((pl) => (
                <ActivityRow key={pl.number} pull={pl} now={now} />
              ))}
            </div>
          ) : (
            <p className="lp-empty">No pull requests yet.</p>
          )}
        </section>

        <aside className="lp-side">
          {languages.length ? (
            <section className="lp-panel">
              <h3 className="lp-panel-h">Languages</h3>
              <LangBar languages={languages} />
            </section>
          ) : null}
          {contributors.length ? (
            <section className="lp-panel">
              <h3 className="lp-panel-h">Contributors</h3>
              <ul className="lp-contribs">
                {contributors.map((c) => (
                  <li key={c.login}>
                    <a href={c.url} target="_blank" rel="noreferrer">
                      <span className="lp-ava" aria-hidden="true">
                        {c.login.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="lp-contrib-login">{c.login}</span>
                      <span className="lp-contrib-count">{c.contributions}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </Reveal>
  );
}

function Unavailable(): React.ReactElement {
  return (
    <Reveal delay={0.12} className="lp-card">
      <p className="lp-empty">
        Live project data is briefly unavailable.{" "}
        <a href="https://github.com/Mokhatla-Sifiso/the-foundry" target="_blank" rel="noreferrer">
          View the repository on GitHub →
        </a>
      </p>
    </Reveal>
  );
}
