import { act, render } from "@testing-library/react";
import { Screening } from "@/components/recruiter/Screening";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("Screening (§10.7 sequence)", () => {
  it("ticks email at 550ms, domain at 1200ms, then screen + onDone after 700ms", async () => {
    const screen = jest.fn().mockResolvedValue({ decision: "approve", reason: "OK" });
    const onDone = jest.fn();
    const { container } = render(
      <Screening email="jordan@acme.co" screen={screen} onDone={onDone} />,
    );

    const checks = (): NodeListOf<Element> => container.querySelectorAll(".checks .c");
    expect(checks()[0].className).not.toMatch(/ok/);

    
    await act(async () => {
      jest.advanceTimersByTime(550);
    });
    expect(checks()[0].className).toMatch(/ok/);

    
    await act(async () => {
      jest.advanceTimersByTime(650);
    });
    expect(checks()[1].className).toMatch(/ok/);

    
    await act(async () => {
      await Promise.resolve();
    });
    expect(checks()[2].className).toMatch(/ok/);

    
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(onDone).toHaveBeenCalledWith({ decision: "approve", reason: "OK" });
  });

  it("falls back to an approve result when screen() rejects", async () => {
    const screen = jest.fn().mockRejectedValue(new Error("network"));
    const onDone = jest.fn();
    render(<Screening email="jordan@acme.co" screen={screen} onDone={onDone} />);

    
    await act(async () => {
      jest.advanceTimersByTime(550);
    });
    
    await act(async () => {
      jest.advanceTimersByTime(650);
    });
    
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    
    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(onDone).toHaveBeenCalledWith({
      decision: "approve",
      reason: "Verified via work email and domain.",
    });
  });
});
