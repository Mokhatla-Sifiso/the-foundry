"use client";
import { useEffect } from "react";
export function Loader(): null {
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      const ld = document.getElementById("loader");
      if (ld) ld.classList.add("hide");
    }, 600);
    return () => {
      window.clearTimeout(t1);
    };
  }, []);
  return null;
}
