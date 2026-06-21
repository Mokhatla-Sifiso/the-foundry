"use client";

import { useEffect } from "react";

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
