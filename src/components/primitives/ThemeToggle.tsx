"use client";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle(): React.ReactElement {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark mode"
      className="theme-switch"
      onClick={toggle}
    >
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-knob">
          <svg viewBox="0 0 28 28" focusable="false">
            <path
              className="theme-switch-wave"
              opacity="0.55"
              d="M-2 19C6 14 12 23 20 18c5-3 8-2 10-1v13H-2z"
            />
            <path className="theme-switch-wave" opacity="0.9" d="M-2 23c9-3 16 4 32-2v9H-2z" />
            <g className="theme-switch-sun">
              <circle cx="14" cy="11" r="3" />
              <path d="M14 4.4v1.3M14 16.3v1.3M7.4 11h1.3M19.3 11h1.3M9.3 6.3l.9.9M17.8 14.8l.9.9M18.7 6.3l-.9.9M10.2 14.8l-.9.9" />
            </g>
            <path
              className="theme-switch-moon"
              d="M14.6 5.6a5.6 5.6 0 1 0 5.2 7.5 4.6 4.6 0 0 1-5.2-7.5z"
            />
          </svg>
        </span>
      </span>
    </button>
  );
}
