import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgreementChecks } from "@/components/access/AgreementChecks";

function setup(props: Partial<React.ComponentProps<typeof AgreementChecks>> = {}) {
  const onTermsChange = jest.fn();
  const onPrivacyChange = jest.fn();
  const view = render(
    <AgreementChecks
      acceptedTerms={false}
      acceptedPrivacy={false}
      onTermsChange={onTermsChange}
      onPrivacyChange={onPrivacyChange}
      {...props}
    />,
  );
  return { ...view, onTermsChange, onPrivacyChange };
}

describe("AgreementChecks", () => {
  it("renders both agreements unticked by default", () => {
    setup();
    expect(screen.getByLabelText(/Terms of Use/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Privacy Policy/i)).not.toBeChecked();
  });

  it("links each agreement to its own legal page, opened in a new tab", () => {
    setup();
    const terms = screen.getByRole("link", { name: /Terms of Use/i });
    const privacy = screen.getByRole("link", { name: /Privacy Policy/i });
    expect(terms).toHaveAttribute("href", "/legal/terms");
    expect(privacy).toHaveAttribute("href", "/legal/privacy");
    // A journey mid-verification must survive reading the terms.
    expect(terms).toHaveAttribute("target", "_blank");
    expect(privacy).toHaveAttribute("target", "_blank");
    expect(terms).toHaveAttribute("rel", "noreferrer");
  });

  it("reports each tick separately so consent is never inferred from one box", async () => {
    const user = userEvent.setup();
    const { onTermsChange, onPrivacyChange } = setup();
    await user.click(screen.getByLabelText(/Terms of Use/i));
    expect(onTermsChange).toHaveBeenCalledWith(true);
    expect(onPrivacyChange).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(/Privacy Policy/i));
    expect(onPrivacyChange).toHaveBeenCalledWith(true);
  });

  it("reflects the accepted state passed in", () => {
    setup({ acceptedTerms: true, acceptedPrivacy: true });
    expect(screen.getByLabelText(/Terms of Use/i)).toBeChecked();
    expect(screen.getByLabelText(/Privacy Policy/i)).toBeChecked();
  });

  it("renames the terms per journey", () => {
    setup({ termsLabel: "Recruiter Terms" });
    expect(screen.getByRole("link", { name: "Recruiter Terms" })).toBeInTheDocument();
  });

  it("announces a refusal and wires it to both checkboxes", () => {
    setup({
      error: "Please accept the Terms of Use and Privacy Policy to continue.",
      idPrefix: "guest-consent",
    });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "Please accept the Terms of Use and Privacy Policy to continue.",
    );
    expect(alert).toHaveAttribute("id", "guest-consent-error");
    expect(screen.getByLabelText(/Terms of Use/i)).toHaveAttribute(
      "aria-describedby",
      "guest-consent-error",
    );
    expect(screen.getByLabelText(/Privacy Policy/i)).toHaveAttribute(
      "aria-describedby",
      "guest-consent-error",
    );
  });

  it("leaves the checkboxes undescribed when there is no error", () => {
    setup();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Terms of Use/i)).not.toHaveAttribute("aria-describedby");
  });
});
