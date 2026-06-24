import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignIn } from "@/components/recruiter/SignIn";
describe("SignIn", () => {
  it("rejects an invalid email format", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);
    await user.type(screen.getByLabelText(/Work email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onCode).not.toHaveBeenCalled();
  });
  it("calls onCode for a well-formed email (server handles existence check)", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);
    await user.type(screen.getByLabelText(/Work email/i), "jordan@acme.co");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));
    expect(onCode).toHaveBeenCalledWith("jordan@acme.co");
  });
});
