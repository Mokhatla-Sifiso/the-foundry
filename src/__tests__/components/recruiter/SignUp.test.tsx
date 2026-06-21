import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUp } from "@/components/recruiter/SignUp";

describe("SignUp validation (§10.5)", () => {
  it("blocks submit and surfaces 5 inline errors when all fields are empty", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(
      <SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: /Send verification code/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Which company are you with?")).toBeInTheDocument();
    expect(screen.getByText("What role are you hiring for?")).toBeInTheDocument();
    expect(screen.getByText("Company website or LinkedIn helps verify you.")).toBeInTheDocument();
  });

  it("rejects free-mail addresses with the spec message", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(
      <SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />,
    );

    await user.type(screen.getByLabelText(/Full name/i), "Jordan Pillay");
    await user.type(screen.getByLabelText(/Work email/i), "jordan@gmail.com");
    await user.type(screen.getByLabelText(/^Company$/i), "Acme Talent");
    await user.type(screen.getByLabelText(/Hiring for/i), "Senior Frontend Engineer");
    await user.type(screen.getByLabelText(/LinkedIn/i), "acme.com");

    await user.click(screen.getByRole("button", { name: /Send verification code/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/personal inboxes \(gmail, outlook…\) can't be verified/i),
    ).toBeInTheDocument();
  });

  it("submits trimmed values when every field is valid", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(
      <SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />,
    );

    await user.type(screen.getByLabelText(/Full name/i), "  Jordan Pillay  ");
    await user.type(screen.getByLabelText(/Work email/i), "jordan@acme.co");
    await user.type(screen.getByLabelText(/^Company$/i), "Acme");
    await user.type(screen.getByLabelText(/Hiring for/i), "Frontend Engineer");
    await user.type(screen.getByLabelText(/LinkedIn/i), "acme.co");

    await user.click(screen.getByRole("button", { name: /Send verification code/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Jordan Pillay",
      email: "jordan@acme.co",
      company: "Acme",
      role: "Frontend Engineer",
      url: "acme.co",
    });
  });
});
