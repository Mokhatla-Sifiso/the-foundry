import { render, screen } from "@testing-library/react";
import { ExperienceRow } from "@/components/sections/ExperienceRow";
import type { ExperienceRow as ExperienceRowData } from "@/lib/constants";

const ROW: ExperienceRowData = {
  period: "2025 – present",
  company: "MTN Group",
  role: "Acting Technical Lead — StudioSync",
  blurb: "Owns the microfrontend platform's architecture and release cadence.",
};

describe("ExperienceRow", () => {
  it("renders period, company, role, and blurb", () => {
    render(<ExperienceRow row={ROW} />);
    expect(screen.getByText(ROW.period)).toBeInTheDocument();
    expect(screen.getByText(ROW.company)).toBeInTheDocument();
    expect(screen.getByText(ROW.role)).toBeInTheDocument();
    expect(screen.getByText(ROW.blurb)).toBeInTheDocument();
  });

  it("declares role=listitem so it composes inside an enclosing list", () => {
    render(<ExperienceRow row={ROW} />);
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });
});
