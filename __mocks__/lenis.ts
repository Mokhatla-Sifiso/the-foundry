class LenisMock {
  constructor(_options?: Record<string, unknown>) {}
  raf(_time: number): void {}
  destroy(): void {}
}
export default LenisMock;
