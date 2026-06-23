"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster(): React.ReactElement {
  return (
    <HotToaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 4500,
        style: {
          background: "var(--card, #0a0a0a)",
          color: "var(--fg, #fafafa)",
          border: "1px solid var(--border, rgba(255,255,255,0.08))",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#10b981", secondary: "#0a0a0a" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#0a0a0a" }, duration: 6000 },
      }}
    />
  );
}
