jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import RecruiterPage from "@/app/recruiter/page";
import { LS_ACCOUNTS, LS_SESSION } from "@/lib/recruiter";

describe("RecruiterPage auto-resume (§10.3)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("starts at the Gate when no session is stored", () => {
    render(<RecruiterPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Download my CV/i,
    );
  });

  it("jumps straight to Approved when LS_SESSION points at a stored account", () => {
    window.localStorage.setItem(
      LS_ACCOUNTS,
      JSON.stringify({
        "jordan@acme.co": {
          name: "Jordan Pillay",
          email: "jordan@acme.co",
          company: "Acme",
          role: "Frontend",
          url: "acme.co",
          verifiedAt: 1,
        },
      }),
    );
    window.localStorage.setItem(LS_SESSION, "jordan@acme.co");

    render(<RecruiterPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "You're verified.",
    );
    expect(screen.getByText(/Thanks, Jordan\./)).toBeInTheDocument();
  });

  it("ignores a stale session whose email no longer has an account", () => {
    window.localStorage.setItem(LS_SESSION, "ghost@acme.co");

    render(<RecruiterPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Download my CV/i,
    );
  });
});
