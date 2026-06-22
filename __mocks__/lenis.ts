/*
 * Manual mock for the `lenis` package — auto-discovered by Jest under
 * <rootDir>/__mocks__/lenis.ts. The real package ships as ESM with a
 * default export wrapped in `node_modules/lenis/dist/lenis.mjs`, which
 * the project's Jest transform doesn't process. None of the unit tests
 * care about smooth-scroll behaviour, so the mock is a no-op shell
 * matching the constructor / `raf` / `destroy` surface used by
 * `SmoothScroll`.
 */

class LenisMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_options?: any) {}
  raf(_time: number): void {}
  destroy(): void {}
}

export default LenisMock;
