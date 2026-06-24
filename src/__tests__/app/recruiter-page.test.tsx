jest.mock("framer-motion");
import { render, screen, waitFor } from "@testing-library/react";
import RecruiterPage from "@/app/recruiter/page";
const originalFetch = global.fetch;
function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}
function mockSession(account: unknown): void {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/recruiter/session")) return jsonResponse({ account });
    return jsonResponse({});
  }) as unknown as typeof global.fetch;
}
describe("RecruiterPage auto-resume", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("starts at the Gate when /api/recruiter/session returns no account", async () => {
    mockSession(null);
    render(<RecruiterPage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Download my CV/i),
    );
  });
  it("jumps to Approved when /api/recruiter/session returns an account", async () => {
    mockSession({
      name: "Jordan Pillay",
      email: "jordan@acme.co",
      company: "Acme",
      role: "Frontend",
      url: "acme.co",
      verifiedAt: 1,
      isAdmin: false,
      screen: { decision: "approve", reason: "Verified." },
    });
    render(<RecruiterPage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("You're verified."),
    );
    expect(screen.getByText(/Thanks, Jordan\./)).toBeInTheDocument();
  });
  it("falls back to the Gate when the session endpoint errors", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ message: "boom" }, 500),
    ) as unknown as typeof global.fetch;
    render(<RecruiterPage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Download my CV/i),
    );
  });
});
