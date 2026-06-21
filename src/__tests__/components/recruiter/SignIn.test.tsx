import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignIn } from "@/components/recruiter/SignIn";
import { LS_ACCOUNTS } from "@/lib/recruiter";

describe("SignIn (§10.9)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("rejects an invalid email format", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);

    await user.type(screen.getByLabelText(/Work email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onCode).not.toHaveBeenCalled();
  });

  it("rejects an email that doesn't have an account on file", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);

    await user.type(screen.getByLabelText(/Work email/i), "stranger@acme.co");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));

    expect(
      screen.getByText(/No access found for that email\. Request access instead\./i),
    ).toBeInTheDocument();
    expect(onCode).not.toHaveBeenCalled();
  });

  it("calls onCode when the email matches a stored account", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    window.localStorage.setItem(
      LS_ACCOUNTS,
      JSON.stringify({
        "jordan@acme.co": {
          name: "Jordan",
          email: "jordan@acme.co",
          company: "Acme",
          role: "Frontend",
          url: "acme.co",
          verifiedAt: 1,
        },
      }),
    );

    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);

    await user.type(screen.getByLabelText(/Work email/i), "jordan@acme.co");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));

    expect(onCode).toHaveBeenCalledWith("jordan@acme.co");
  });
});
