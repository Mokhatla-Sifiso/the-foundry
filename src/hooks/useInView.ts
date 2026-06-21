"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type UseInViewOptions = Readonly<{
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}>;

type UseInViewReturn<T extends Element> = Readonly<{
  ref: RefObject<T | null>;
  inView: boolean;
}>;

export function useInView<T extends Element = HTMLElement>(
  options: UseInViewOptions = {},
): UseInViewReturn<T> {
  const { threshold = 0.1, rootMargin = "0px 0px -12% 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
