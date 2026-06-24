import { render } from "@testing-library/react";
import { Dots } from "@/components/recruiter/Dots";
describe("Dots", () => {
  it("renders 4 segments by default with the active step lit and prior ones done", () => {
    const { container } = render(<Dots step={2} />);
    const items = container.querySelectorAll(".dots i");
    expect(items.length).toBe(4);
    expect(items[0].className).toBe("done");
    expect(items[1].className).toBe("done");
    expect(items[2].className).toBe("on");
    expect(items[3].className).toBe("");
  });
  it("respects a custom total", () => {
    const { container } = render(<Dots step={0} total={3} />);
    expect(container.querySelectorAll(".dots i").length).toBe(3);
  });
});
