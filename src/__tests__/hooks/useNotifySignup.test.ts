import { act, renderHook } from "@testing-library/react";
import { RATE_LIMITED, SERVER_ERROR, useNotifySignup } from "@/hooks/useNotifySignup";

const VALID = { email: " Name@Company.com ", consent: true, website: "" };
const originalFetch = global.fetch;
const fetchMock = jest.fn();

function jsonResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function respond(status: number, body: unknown = {}): void {
  fetchMock.mockResolvedValue(jsonResponse(body, status));
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe("useNotifySignup", () => {
  it("starts idle", () => {
    expect(renderHook(() => useNotifySignup()).result.current.state).toEqual({ status: "idle" });
  });

  it.each([
    ["email", { ...VALID, email: "name@company" }, "Enter an email address like name@company.com."],
    ["consent", { ...VALID, consent: false }, "Tick the box so I can send you the launch email."],
  ])(
    "catches an invalid %s without a request, using the server's own message",
    async (field, input, message) => {
      const { result } = renderHook(() => useNotifySignup());
      await act(() => result.current.submit(input));
      expect(result.current.state).toEqual({ status: "invalid", field, message });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("posts the input and shows the stored address once accepted", async () => {
    respond(202, { ok: true });
    const { result } = renderHook(() => useNotifySignup());
    await act(() => result.current.submit(VALID));
    expect(fetchMock).toHaveBeenCalledWith("/api/updates/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(VALID),
    });
    expect(result.current.state).toEqual({ status: "submitted", email: "name@company.com" });
  });

  it("is submitting while the request is in flight", async () => {
    let finish: (res: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useNotifySignup());
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.submit(VALID);
    });
    expect(result.current.state).toEqual({ status: "submitting" });
    await act(async () => {
      finish(jsonResponse({}, 202));
      await pending;
    });
    expect(result.current.state.status).toBe("submitted");
  });

  it("still posts a filled honeypot, so the server answers it like any sign-up", async () => {
    respond(202, { ok: true });
    const { result } = renderHook(() => useNotifySignup());
    await act(() => result.current.submit({ ...VALID, website: "https://spam.example" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.state).toEqual({ status: "submitted", email: VALID.email });
  });

  it("shows the approved rate-limit line on 429", async () => {
    respond(429, { message: "anything" });
    const { result } = renderHook(() => useNotifySignup());
    await act(() => result.current.submit(VALID));
    expect(result.current.state).toEqual({ status: "failed", message: RATE_LIMITED });
  });

  it("places a server-side field error next to its field", async () => {
    respond(400, { field: "email", message: "Enter an email address like name@company.com." });
    const { result } = renderHook(() => useNotifySignup());
    await act(() => result.current.submit(VALID));
    expect(result.current.state).toEqual({
      status: "invalid",
      field: "email",
      message: "Enter an email address like name@company.com.",
    });
  });

  it.each([
    ["a 400 without a usable field", () => respond(400, { field: "name", message: "x" })],
    [
      "a 400 that is not JSON",
      () =>
        fetchMock.mockResolvedValue({
          status: 400,
          json: async () => JSON.parse("<html>"),
        } as unknown as Response),
    ],
    ["a 403", () => respond(403, { message: "x" })],
    ["a 500", () => respond(500, { message: "x" })],
    ["a network failure", () => fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))],
  ])("shows the approved server-error line for %s", async (_label, arrange) => {
    arrange();
    const { result } = renderHook(() => useNotifySignup());
    await act(() => result.current.submit(VALID));
    expect(result.current.state).toEqual({ status: "failed", message: SERVER_ERROR });
  });

  it("ignores a response that arrives after a reset, so a closed dialog stays closed", async () => {
    let finish: (res: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useNotifySignup());
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.submit(VALID);
    });
    act(() => result.current.reset());
    await act(async () => {
      finish(jsonResponse({}, 202));
      await pending;
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
