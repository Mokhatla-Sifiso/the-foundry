describe("lenisBus", () => {
  beforeEach(() => {
    // Fresh module so the internal subscriber array is isolated per test.
    jest.resetModules();
  });

  it("delivers the scroll value to a subscribed listener on emit", async () => {
    const { lenisBus } = await import("@/lib/lenis-bus");
    const listener = jest.fn();
    lenisBus.on(listener);
    lenisBus.emit(42);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(42);
  });

  it("fans out a single emit to every subscriber", async () => {
    const { lenisBus } = await import("@/lib/lenis-bus");
    const a = jest.fn();
    const b = jest.fn();
    lenisBus.on(a);
    lenisBus.on(b);
    lenisBus.emit(7);
    expect(a).toHaveBeenCalledWith(7);
    expect(b).toHaveBeenCalledWith(7);
  });

  it("stops notifying a listener after its unsubscribe is called", async () => {
    const { lenisBus } = await import("@/lib/lenis-bus");
    const listener = jest.fn();
    const off = lenisBus.on(listener);
    lenisBus.emit(1);
    off();
    lenisBus.emit(2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it("only unsubscribes the target listener, leaving others intact", async () => {
    const { lenisBus } = await import("@/lib/lenis-bus");
    const keep = jest.fn();
    const drop = jest.fn();
    lenisBus.on(keep);
    const off = lenisBus.on(drop);
    off();
    lenisBus.emit(99);
    expect(drop).not.toHaveBeenCalled();
    expect(keep).toHaveBeenCalledWith(99);
  });

  it("is safe to call an unsubscribe function more than once", async () => {
    const { lenisBus } = await import("@/lib/lenis-bus");
    const listener = jest.fn();
    const off = lenisBus.on(listener);
    off();
    // Second call hits the indexOf === -1 branch and must not throw.
    expect(() => off()).not.toThrow();
    lenisBus.emit(5);
    expect(listener).not.toHaveBeenCalled();
  });

  it("does nothing on emit when there are no subscribers", async () => {
    const { lenisBus } = await import("@/lib/lenis-bus");
    expect(() => lenisBus.emit(123)).not.toThrow();
  });
});
