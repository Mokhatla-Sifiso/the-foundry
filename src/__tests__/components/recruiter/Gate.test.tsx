import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gate } from "@/components/recruiter/Gate";

describe("Gate", () => {
  it("renders the spec eyebrow, headline, and sub copy", () => {
    render(<Gate onRequestAccess={() => {}} onHaveAccess={() => {}} />);
    expect(screen.getByText(/Verified recruiter access/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Download my CV — for verified recruiters\./i,
    );
    expect(screen.getByText(/Takes about a minute with your work email/i)).toBeInTheDocument();
  });

  it("triggers onRequestAccess and onHaveAccess on the matching buttons", async () => {
    const onRequest = jest.fn();
    const onHave = jest.fn();
    const user = userEvent.setup();
    render(<Gate onRequestAccess={onRequest} onHaveAccess={onHave} />);

    await user.click(screen.getByRole("button", { name: /Request access/i }));
    expect(onRequest).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /I already have access/i }));
    expect(onHave).toHaveBeenCalledTimes(1);
  });

  it("includes the Howto disclosure as a closed details element by default", () => {
    const { container } = render(<Gate onRequestAccess={() => {}} onHaveAccess={() => {}} />);
    const details = container.querySelector("details.howto");
    expect(details).not.toBeNull();
    expect((details as HTMLDetailsElement).open).toBe(false);
  });
});
