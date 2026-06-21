import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Otp } from "@/components/recruiter/Otp";

const inputs = (): HTMLInputElement[] =>
  Array.from(document.querySelectorAll(".otp input")) as HTMLInputElement[];

describe("Otp", () => {
  it("renders 6 inputs and the email + demo code in the note", () => {
    render(
      <Otp
        email="jordan@acme.co"
        code="123456"
        onVerify={() => {}}
        onResend={() => {}}
      />,
    );
    expect(inputs().length).toBe(6);
    expect(screen.getByText("jordan@acme.co")).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
  });

  it("advances focus on each digit and disables verify until all 6 are filled", async () => {
    const onVerify = jest.fn();
    const user = userEvent.setup();
    render(
      <Otp
        email="jordan@acme.co"
        code="123456"
        onVerify={onVerify}
        onResend={() => {}}
      />,
    );

    const verify = screen.getByRole("button", { name: /Verify email/i });
    expect((verify as HTMLButtonElement).disabled).toBe(true);

    // Type the code one digit at a time; userEvent.type doesn't follow our
    // focus-advance, so we drive each box directly.
    const all = inputs();
    for (let i = 0; i < 6; i += 1) {
      all[i].focus();
      await user.keyboard(String(i + 1));
    }

    expect((verify as HTMLButtonElement).disabled).toBe(false);
    await user.click(verify);
    expect(onVerify).toHaveBeenCalledWith("123456");
  });

  it("distributes pasted digits across boxes", async () => {
    const user = userEvent.setup();
    render(
      <Otp
        email="jordan@acme.co"
        code="123456"
        onVerify={() => {}}
        onResend={() => {}}
      />,
    );
    const first = inputs()[0];
    first.focus();
    await user.paste("987654");

    const after = inputs().map((i) => i.value).join("");
    expect(after).toBe("987654");
  });

  it("backspace on empty box moves focus to previous", async () => {
    const user = userEvent.setup();
    render(
      <Otp
        email="jordan@acme.co"
        code="123456"
        onVerify={() => {}}
        onResend={() => {}}
      />,
    );
    const all = inputs();
    all[0].focus();
    await user.keyboard("1");
    expect(document.activeElement).toBe(all[1]);
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(all[0]);
  });

  it("shows caller-supplied error text + aria-invalid on inputs", () => {
    render(
      <Otp
        email="jordan@acme.co"
        code="123456"
        error="That code doesn't match. Try again."
        onVerify={() => {}}
        onResend={() => {}}
      />,
    );
    expect(screen.getByText(/That code doesn't match/i)).toBeInTheDocument();
    expect(inputs()[0].getAttribute("aria-invalid")).toBe("true");
  });

  it("Resend triggers onResend", async () => {
    const onResend = jest.fn();
    const user = userEvent.setup();
    render(
      <Otp
        email="jordan@acme.co"
        code="123456"
        onVerify={() => {}}
        onResend={onResend}
      />,
    );
    await user.click(screen.getByText("Resend"));
    expect(onResend).toHaveBeenCalledTimes(1);
  });
});
