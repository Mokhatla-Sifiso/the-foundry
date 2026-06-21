jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import { Work } from "@/components/sections/Work";
import { WORK } from "@/lib/constants";

describe("Work", () => {
  it("renders the section heading and a count badge", () => {
    render(<Work />);
    expect(screen.getByRole("heading", { level: 2, name: /selected work/i })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${WORK.length.toString().padStart(2, "0")} projects`))).toBeInTheDocument();
  });

  it("renders an h3 for every WORK entry", () => {
    render(<Work />);
    for (const project of WORK) {
      expect(
        screen.getByRole("heading", { level: 3, name: project.title }),
      ).toBeInTheDocument();
    }
  });
});
