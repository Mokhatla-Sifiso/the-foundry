import { render } from "@testing-library/react";
import { Tape } from "@/components/upgrades/Tape";
import { useTapeScene, type TapeScene } from "@/hooks/useTapeScene";
import { PHRASE, PRESETS, resolveTapes } from "@/lib/tape/geometry";

jest.mock("@/hooks/useTapeScene", () => ({
  ...jest.requireActual("@/hooks/useTapeScene"),
  useTapeScene: jest.fn(),
}));

const scene = useTapeScene as jest.Mock;
const refs = { stage: { current: null }, ceiling: { current: null }, avoid: [] };

function laidOut(): TapeScene {
  const stage = { width: 1440, height: 900, boxTop: 64, boxHeight: 724 };
  return {
    layout: "desktop",
    fitted: true,
    strips: resolveTapes(stage, PRESETS.desktop, 0.62).map((geometry) => ({
      geometry,
      print: { start: -120, repeats: 4 },
    })),
  };
}

describe("Tape", () => {
  it("is hidden from assistive technology", () => {
    scene.mockReturnValue(laidOut());
    const { container } = render(<Tape {...refs} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders only the measuring phrase until the first layout", () => {
    scene.mockReturnValue(null);
    const { container } = render(<Tape {...refs} />);
    expect(container.querySelectorAll(".ug-tape")).toHaveLength(0);
    expect(container.querySelector(".ug-tape__measure")).toHaveTextContent(PHRASE);
    expect(container.firstElementChild).not.toHaveAttribute("data-fit");
  });

  it("renders each strip with its geometry and a sharp and a soft face of the same print", () => {
    const laid = laidOut();
    scene.mockReturnValue(laid);
    const { container } = render(<Tape {...refs} />);
    const strips = container.querySelectorAll<HTMLElement>(".ug-tape");
    expect(strips).toHaveLength(3);
    expect(container.firstElementChild).toHaveAttribute("data-fit", "ok");
    expect(container.firstElementChild).toHaveAttribute("data-layout", "desktop");

    const [first] = strips;
    const g = laid.strips[0].geometry;
    expect(first).toHaveClass(`ug-tape--far-${g.far}`);
    expect(first.style.getPropertyValue("--thick")).toBe(`${g.thick}px`);
    expect(first.style.getPropertyValue("--delay")).toBe(`${g.delay}s`);
    expect(first.style.getPropertyValue("--phase")).toBe("-120px");
    expect(first.style.getPropertyValue("--bloom")).toBe(`${g.bloom}%`);
    for (const face of first.querySelectorAll(".ug-tape__face")) {
      const repeats = face.querySelectorAll(".ug-tape__print > span");
      expect(repeats).toHaveLength(4);
      expect(repeats[0]).toHaveTextContent(PHRASE);
    }
  });

  it("flags a layout that could not be fitted, for diagnosis", () => {
    scene.mockReturnValue({ ...laidOut(), fitted: false });
    const { container } = render(<Tape {...refs} />);
    expect(container.firstElementChild).toHaveAttribute("data-fit", "failed");
  });
});
