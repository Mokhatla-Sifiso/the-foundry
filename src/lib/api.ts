import toast from "react-hot-toast";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

type FetchInit = RequestInit & { silent?: boolean };

/**
 * Fetch JSON and convert any non-2xx response or thrown error into a toast.
 * Always resolves — never rejects — so call sites can branch on `ok`.
 *
 * Pass `{ silent: true }` to suppress the toast (caller will handle messaging).
 */
export async function apiFetch<T = unknown>(
  url: string,
  init: FetchInit = {},
): Promise<ApiResult<T>> {
  const { silent, headers, ...rest } = init;
  try {
    const res = await fetch(url, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    });
    const text = await res.text();
    const body = text ? safeJson(text) : null;

    if (!res.ok) {
      const message = pickErrorMessage(body, res.status);
      if (!silent) toast.error(message);
      return { ok: false, error: message };
    }
    return { ok: true, data: body as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (!silent) toast.error(message);
    return { ok: false, error: message };
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function pickErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
  }
  if (status === 401) return "Please sign in to continue.";
  if (status === 403) return "You don't have access to do that.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status === 429) return "Too many attempts. Try again in a minute.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return `Request failed (${status}).`;
}
