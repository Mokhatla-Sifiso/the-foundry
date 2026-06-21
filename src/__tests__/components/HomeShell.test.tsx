import { render, screen } from "@testing-library/react";
import { HomeShell } from "@/components/sections/HomeShell";

describe("HomeShell", () => {
  it("shows the studio eyebrow, name heading, and rebuild note", () => {
    render(<HomeShell />);

    expect(screen.getByText(/the foundry/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /mzwakhe mokhatla/i })).toBeInTheDocument();
    expect(screen.getByText(/studio rebuild in progress/i)).toBeInTheDocument();
  });
});
