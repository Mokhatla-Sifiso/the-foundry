"use client";

import { useEffect } from "react";

/**
 * Premium loader controller — VERBATIM behaviour from §5.3.
 *
 * The `#loader` markup is rendered as static HTML directly in
 * `layout.tsx`'s <body> so it paints on the first HTML chunk, before
 * React hydrates. This component renders nothing — it just runs the
 * two timers that fade and remove the overlay:
 *
 *   - 600ms: add `.hide` class → begins the .7s opacity/visibility fade.
 *   - 1400ms: remove the `#loader` element from the DOM entirely.
 */
export function Loader(): null {
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      const ld = document.getElementById("loader");
      if (ld) ld.classList.add("hide");
    }, 600);
    const t2 = window.setTimeout(() => {
      const ld = document.getElementById("loader");
      if (ld && ld.parentNode) ld.remove();
    }, 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return null;
}
