import { AI_TOOLS } from "@/lib/ai-tools";

export function AIToolkit(): React.ReactElement {
  return (
    <div className="ai-tk">
      <p className="ai-tk-eyebrow">The tools behind it</p>
      <div className="ai-tk-groups">
        {AI_TOOLS.map((group) => (
          <div key={group.label} className="ai-tk-grp">
            <p className="ai-tk-gl">{group.label}</p>
            <p className="ai-tk-gd">{group.desc}</p>
            <ul className="ai-tk-row">
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
                    <span className="ai-tk-mono" aria-hidden="true">
                      {tool.short}
                    </span>
                  )}
                  <span className="ai-tk-nm">{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
