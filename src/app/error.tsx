"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    toast.error("Something went wrong. We're recovering the page.");
    console.error("[global-error]", error);
  }, [error]);
  return (
    <main style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>We hit a snag.</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        The page failed to load. Try refreshing, your session is safe.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          border: "1px solid currentColor",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
