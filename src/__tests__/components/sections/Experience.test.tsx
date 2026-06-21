jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import { Experience } from "@/components/sections/Experience";
import { EXPERIENCE } from "@/lib/constants";

describe("Experience", () => {
  it("renders the section heading and the position count", () => {
    render(<Experience />);
    expect(screen.getByRole("heading", { level: 2, name: /experience/i })).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${EXPERIENCE.length.toString().padStart(2, "0")} positions`)),
    ).toBeInTheDocument();
  });

  it("renders one list item per EXPERIENCE entry inside a single list", () => {
    render(<Experience />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(EXPERIENCE.length);
  });

  it("renders the role text for every EXPERIENCE entry", () => {
    render(<Experience />);
    for (const row of EXPERIENCE) {
      expect(screen.getByText(row.role)).toBeInTheDocument();
    }
  });
});
