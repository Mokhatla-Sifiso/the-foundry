jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Approved } from "@/components/recruiter/Approved";
import type { RecruiterAccount } from "@/lib/recruiter";

const ACCOUNT: RecruiterAccount = {
  name: "Jordan Pillay",
  email: "jordan@acme.co",
  company: "Acme Talent",
  role: "Senior Frontend Engineer",
  url: "acme.co",
  verifiedAt: 1717000000000,
};

describe("Approved", () => {
  it("renders the personalised headline, who card, and download link", () => {
    render(<Approved account={ACCOUNT} onSignOut={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "You're verified.",
    );
    expect(screen.getByText(/Thanks, Jordan\./)).toBeInTheDocument();
    expect(screen.getByText(ACCOUNT.name)).toBeInTheDocument();
    expect(screen.getByText(/Senior Frontend Engineer · Acme Talent/)).toBeInTheDocument();
    expect(screen.getByText(ACCOUNT.email)).toBeInTheDocument();

    const dl = screen.getByRole("link", { name: /Download CV \(PDF\)/i });
    expect(dl).toHaveAttribute("href", "/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf");
    expect(dl).toHaveAttribute("download");
  });

  it("calls onSignOut when 'Not you? Sign out' is clicked", async () => {
    const onSignOut = jest.fn();
    const user = userEvent.setup();
    render(<Approved account={ACCOUNT} onSignOut={onSignOut} />);
    await user.click(screen.getByRole("button", { name: /Not you\? Sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
