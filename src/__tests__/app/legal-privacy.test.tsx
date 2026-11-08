import { render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/legal/privacy/page";

describe("Privacy Policy: launch updates (FR-UG-10)", () => {
  it("has the section the sign-up's consent box links to", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: "Launch updates" })).toHaveAttribute(
      "id",
      "launch-updates",
    );
  });

  it("states what is stored, the basis, how long it is kept and how to withdraw", () => {
    const { container } = render(<PrivacyPage />);
    const section =
      container.querySelector("#launch-updates")?.nextElementSibling?.nextElementSibling;
    const text = section?.textContent ?? "";
    expect(text).toContain("your email address, when you gave consent");
    expect(text).toContain("No IP address or browser details are stored with your sign-up");
    expect(text).toContain("your consent");
    expect(text).toContain("A sign-up you never confirm is deleted after 7 days");
    expect(text).toContain("use the unsubscribe link");
  });
});
