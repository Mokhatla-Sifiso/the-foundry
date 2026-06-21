import "@testing-library/jest-dom";

/*
 * framer-motion uses browser APIs (matchMedia, IntersectionObserver, ResizeObserver)
 * that jsdom does not implement. We shim the minimum surface so components that
 * render `motion.*` elements don't blow up in unit tests. Tests that care about
 * animation behaviour should still mock framer-motion directly per-suite.
 */
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  if (!window.IntersectionObserver) {
    class IntersectionObserverShim {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
    }
    window.IntersectionObserver =
      IntersectionObserverShim as unknown as typeof IntersectionObserver;
  }

  if (!window.ResizeObserver) {
    class ResizeObserverShim {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    window.ResizeObserver = ResizeObserverShim as unknown as typeof ResizeObserver;
  }
}
