import { AI_TOOLS } from "@/lib/ai-tools";

export function AIToolkit(): React.ReactElement {
  return (
    <div className="ai-tk">
      <p className="ai-tk-eyebrow">The tools behind it</p>
      <div className="ai-tk-grid">
        {AI_TOOLS.map((group) => (
          <div key={group.label} className="ai-tk-grp">
            <p className="ai-tk-gl">{group.label}</p>
            <ul className="ai-tk-list">
              {group.tools.map((tool) => (
                <li key={tool.name} className="ai-tk-tool">
                  {tool.kind === "icon" ? (
                    <svg
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label={tool.name}
                      className="ai-tk-svg"
                    >
                      <path d={tool.path} fill="currentColor" />
                    </svg>
                  ) : (
                    <span className="ai-tk-wm" aria-hidden="true">
                      {tool.short}
                    </span>
                  )}
                  {tool.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
