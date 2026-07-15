jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";

const toastError = toast.error as jest.Mock;

type FakeResponse = { ok: boolean; status: number; text: () => Promise<string> };

function mockFetchOnce(res: Partial<FakeResponse>): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: res.ok ?? true,
    status: res.status ?? 200,
    text: res.text ?? (async () => ""),
  });
}

describe("apiFetch", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    toastError.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("success", () => {
    it("returns parsed JSON data on a 2xx response", async () => {
      mockFetchOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ hello: "world" }),
      });
      const result = await apiFetch<{ hello: string }>("/api/thing");
      expect(result).toEqual({ ok: true, data: { hello: "world" } });
      expect(toastError).not.toHaveBeenCalled();
    });

    it("returns null data when the response body is empty", async () => {
      mockFetchOnce({ ok: true, status: 204, text: async () => "" });
      const result = await apiFetch("/api/empty");
      expect(result).toEqual({ ok: true, data: null });
    });

    it("returns the raw text as data when the body is not valid JSON", async () => {
      mockFetchOnce({ ok: true, status: 200, text: async () => "plain-text" });
      const result = await apiFetch("/api/text");
      expect(result).toEqual({ ok: true, data: "plain-text" });
    });

    it("sends a JSON Content-Type header and merges caller headers", async () => {
      mockFetchOnce({ ok: true, status: 200, text: async () => "{}" });
      await apiFetch("/api/thing", { headers: { "X-Custom": "1" } });
      expect(global.fetch).toHaveBeenCalledWith("/api/thing", {
        headers: { "Content-Type": "application/json", "X-Custom": "1" },
      });
    });

    it("does not forward the silent flag to fetch", async () => {
      mockFetchOnce({ ok: true, status: 200, text: async () => "{}" });
      await apiFetch("/api/thing", { silent: true, method: "POST" });
      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(init).not.toHaveProperty("silent");
      expect(init.method).toBe("POST");
    });
  });

  describe("error responses", () => {
    it("prefers a body `message` field and shows a toast", async () => {
      mockFetchOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: "Bad thing" }),
      });
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: "Bad thing" });
      expect(toastError).toHaveBeenCalledWith("Bad thing");
    });

    it("falls back to a body `error` field", async () => {
      mockFetchOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: "Nope" }),
      });
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: "Nope" });
    });

    it("suppresses the toast when silent is true", async () => {
      mockFetchOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ message: "boom" }),
      });
      const result = await apiFetch("/api/thing", { silent: true });
      expect(result).toEqual({ ok: false, error: "boom" });
      expect(toastError).not.toHaveBeenCalled();
    });

    it.each([
      [401, "Please sign in to continue."],
      [403, "You don't have access to do that."],
      [404, "We couldn't find what you were looking for."],
      [429, "Too many attempts. Try again in a minute."],
      [500, "Something went wrong on our side. Please try again."],
      [503, "Something went wrong on our side. Please try again."],
    ])("maps status %s to a friendly message when body has none", async (status, message) => {
      mockFetchOnce({ ok: false, status: status as number, text: async () => "" });
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: message });
      expect(toastError).toHaveBeenCalledWith(message);
    });

    it("uses the generic fallback for an unmapped status", async () => {
      mockFetchOnce({ ok: false, status: 418, text: async () => "" });
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: "Request failed (418)." });
    });

    it("ignores non-string message/error fields and uses the status fallback", async () => {
      mockFetchOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 123, error: null }),
      });
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: "Request failed (400)." });
    });
  });

  describe("network failures", () => {
    it("returns the Error message and toasts when fetch rejects with an Error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("offline"));
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: "offline" });
      expect(toastError).toHaveBeenCalledWith("offline");
    });

    it("returns 'Network error' when fetch rejects with a non-Error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce("weird");
      const result = await apiFetch("/api/thing");
      expect(result).toEqual({ ok: false, error: "Network error" });
      expect(toastError).toHaveBeenCalledWith("Network error");
    });

    it("suppresses the toast on network failure when silent is true", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("offline"));
      const result = await apiFetch("/api/thing", { silent: true });
      expect(result).toEqual({ ok: false, error: "offline" });
      expect(toastError).not.toHaveBeenCalled();
    });
  });
});
