import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { NotifyForm, type NotifyFormProps } from "@/components/upgrades/NotifyForm";

function setup(overrides: Partial<NotifyFormProps> = {}): {
  onSubmit: jest.Mock;
  onEdit: jest.Mock;
  rerender: (next: Partial<NotifyFormProps>) => void;
} {
  const onSubmit = jest.fn();
  const onEdit = jest.fn();
  const props: NotifyFormProps = {
    titleId: "t",
    descId: "d",
    state: { status: "idle" },
    onSubmit,
    onEdit,
    emailRef: createRef<HTMLInputElement>(),
    ...overrides,
  };
  const { rerender } = render(<NotifyForm {...props} />);
  return {
    onSubmit,
    onEdit,
    rerender: (next) => rerender(<NotifyForm {...props} {...next} />),
  };
}

const email = (): HTMLElement => screen.getByRole("textbox", { name: "Email address" });
const consent = (): HTMLElement => screen.getByRole("checkbox", { name: /Email me once/ });
const submitButton = (): HTMLElement => screen.getByRole("button", { name: /Notify me|Sending/ });

describe("NotifyForm", () => {
  it("shows the approved title, description and labelled controls", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Get one email when it's live" })).toHaveAttribute(
      "id",
      "t",
    );
    expect(email()).toHaveAttribute("autocomplete", "email");
    expect(consent()).not.toBeChecked();
    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute(
      "href",
      "/legal/privacy#launch-updates",
    );
  });

  it("submits what was entered, with the honeypot empty", () => {
    const { onSubmit } = setup();
    fireEvent.change(email(), { target: { value: "name@company.com" } });
    fireEvent.click(consent());
    fireEvent.submit(email().closest("form") as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledWith({
      email: "name@company.com",
      consent: true,
      website: "",
    });
  });

  it("keeps the honeypot out of sight and out of the tab order", () => {
    const { container } = render(
      <NotifyForm
        titleId="h"
        descId="hd"
        state={{ status: "idle" }}
        onSubmit={() => {}}
        onEdit={() => {}}
        emailRef={createRef()}
      />,
    );
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("while submitting, shows it is busy and ignores another submit", () => {
    const { onSubmit } = setup({ state: { status: "submitting" } });
    expect(submitButton()).toHaveTextContent("Sending");
    expect(submitButton()).toHaveAttribute("aria-disabled", "true");
    expect(email()).toHaveAttribute("readonly");
    fireEvent.click(consent());
    expect(consent()).not.toBeChecked();
    fireEvent.submit(email().closest("form") as HTMLFormElement);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("puts an email error under the field, linked to it, and focuses the field", () => {
    setup({ state: { status: "invalid", field: "email", message: "Enter an email address." } });
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(email()).toHaveAccessibleDescription("Enter an email address.");
    expect(email()).toHaveFocus();
  });

  it("puts a consent error under the checkbox, linked to it, and focuses the checkbox", () => {
    setup({ state: { status: "invalid", field: "consent", message: "Tick the box." } });
    expect(consent()).toHaveAttribute("aria-invalid", "true");
    expect(consent()).toHaveAccessibleDescription("Tick the box.");
    expect(consent()).toHaveFocus();
  });

  it("clears an error once the visitor edits that field", () => {
    const { onEdit } = setup({
      state: { status: "invalid", field: "email", message: "Enter an email address." },
    });
    fireEvent.change(email(), { target: { value: "name@company.com" } });
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("does not report an edit when nothing is in error", () => {
    const { onEdit } = setup();
    fireEvent.change(email(), { target: { value: "a" } });
    fireEvent.click(consent());
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("announces a failure as an alert above the form", () => {
    setup({ state: { status: "failed", message: "Something went wrong. Try again." } });
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
  });
});
