import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUp } from "@/components/recruiter/SignUp";
type User = ReturnType<typeof userEvent.setup>;
function setupUser(): User {
  return userEvent.setup({ delay: null });
}
async function enter(user: User, label: RegExp, value: string): Promise<void> {
  await user.click(screen.getByLabelText(label));
  await user.paste(value);
}
async function fillValid(user: User): Promise<void> {
  await enter(user, /Full name/i, "Jordan Pillay");
  await enter(user, /Work email/i, "jordan@acme.co");
  await enter(user, /^Company$/i, "Acme");
  await enter(user, /Hiring for/i, "Frontend Engineer");
  await enter(user, /LinkedIn/i, "acme.co");
  await user.click(screen.getByLabelText(/Recruiter Terms/i));
  await user.click(screen.getByLabelText(/Privacy Policy/i));
}
describe("SignUp validation", () => {
  it("blocks submit and surfaces 5 inline errors when all fields are empty", async () => {
    const onSubmit = jest.fn();
    const user = setupUser();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Which company are you with?")).toBeInTheDocument();
    expect(screen.getByText("What role are you hiring for?")).toBeInTheDocument();
    expect(screen.getByText("Company website or LinkedIn helps verify you.")).toBeInTheDocument();
  });
  it("does not block free-mail addresses client-side (server enforces the rule with admin bypass)", async () => {
    const onSubmit = jest.fn();
    const user = setupUser();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await enter(user, /Full name/i, "Jordan Pillay");
    await enter(user, /Work email/i, "jordan@gmail.com");
    await enter(user, /^Company$/i, "Acme Talent");
    await enter(user, /Hiring for/i, "Senior Frontend Engineer");
    await enter(user, /LinkedIn/i, "acme.com");
    await user.click(screen.getByLabelText(/Recruiter Terms/i));
    await user.click(screen.getByLabelText(/Privacy Policy/i));
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
  it("requires both Terms and Privacy checkboxes before submit", async () => {
    const onSubmit = jest.fn();
    const user = setupUser();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await enter(user, /Full name/i, "Jordan");
    await enter(user, /Work email/i, "jordan@acme.co");
    await enter(user, /^Company$/i, "Acme");
    await enter(user, /Hiring for/i, "Frontend");
    await enter(user, /LinkedIn/i, "acme.co");
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/accept the Recruiter Terms and Privacy Policy/i)).toBeInTheDocument();
  });
  it("submits trimmed values + acceptance flags when every field is valid", async () => {
    const onSubmit = jest.fn();
    const user = setupUser();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Jordan Pillay",
      email: "jordan@acme.co",
      company: "Acme",
      role: "Frontend Engineer",
      url: "acme.co",
      acceptedTerms: true,
      acceptedPrivacy: true,
    });
  });
});
