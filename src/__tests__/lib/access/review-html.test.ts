/**
 * @jest-environment node
 */
import {
  esc,
  reviewCard,
  reviewEmpty,
  reviewPage,
  reviewResult,
  stamp,
} from "@/lib/access/review-html";

const CREATED = new Date("2026-07-17T13:42:07Z");

function card(overrides: Partial<Parameters<typeof reviewCard>[0]> = {}): string {
  return reviewCard({
    eyebrow: "Silver tier",
    heading: "Review guest access",
    name: "Priya Naidoo",
    email: "priya@acme.co",
    fields: [{ label: "Resources", value: "CV (PDF)", accent: true }],
    message: null,
    createdAt: CREATED,
    token: "tok-123",
    approveLabel: "Approve · 24 hours",
    rejectLabel: "Decline",
    note: "Approving opens their access.",
    ...overrides,
  });
}

describe("esc", () => {
  it("neutralises the characters that would break out of markup", () => {
    expect(esc(`<script>"&"</script>`)).toBe("&lt;script&gt;&quot;&amp;&quot;&lt;/script&gt;");
  });

  it("escapes the ampersand first, so escapes are not double-encoded", () => {
    expect(esc("&lt;")).toBe("&amp;lt;");
  });
});

describe("stamp", () => {
  it("renders to the minute with an explicit timezone", () => {
    expect(stamp(CREATED)).toBe("2026-07-17 13:42 UTC");
  });
});

describe("reviewCard", () => {
  it("shows who asked, what for, and when", () => {
    const html = card();
    expect(html).toContain("Priya Naidoo");
    expect(html).toContain("priya@acme.co");
    expect(html).toContain("CV (PDF)");
    expect(html).toContain("2026-07-17 13:42 UTC");
  });

  it("carries the token and an action in each form, and nothing else", () => {
    const html = card();
    expect(html).toContain('value="tok-123"');
    expect(html).toContain('value="approve"');
    expect(html).toContain('value="reject"');
    expect(html).toContain("Approve · 24 hours");
    expect(html).toContain("Decline");
  });

  it("posts rather than links, so an email client cannot decide by prefetching", () => {
    const html = card();
    expect(html).toContain('method="POST"');
    expect(html).not.toContain("<a href");
  });

  it("escapes requester-controlled text: name, email, message and fields", () => {
    const html = card({
      name: "<img src=x onerror=alert(1)>",
      message: "</div><script>alert(2)</script>",
      fields: [{ label: "Resources", value: '"><b>bold</b>' }],
    });
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>bold</b>");
    expect(html).toContain("&lt;img src=x");
  });

  it("escapes the token, which lands inside an attribute", () => {
    expect(card({ token: '"><script>x</script>' })).not.toContain("<script>");
  });

  it("omits empty fields rather than printing blank rows", () => {
    const html = card({
      fields: [
        { label: "Preferred slot", value: "Tue 22 July" },
        { label: "Focus", value: "" },
      ],
    });
    expect(html).toContain("Preferred slot");
    expect(html).not.toContain("Focus");
  });

  it("only renders the message block when there is a message", () => {
    expect(card({ message: null })).not.toContain('class="msg"');
    expect(card({ message: "hello" })).toContain('class="msg"');
  });
});

describe("reviewPage", () => {
  it("serves uncacheable, unindexable HTML", async () => {
    const res = reviewPage("Guest access", reviewResult(true, "Approved."));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Robots-Tag")).toContain("noindex");
    // The token sits in the URL, so it must not leak onward via the referrer.
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    await expect(res.text()).resolves.toContain("Approved.");
  });

  it("escapes the title", async () => {
    const res = reviewPage("<script>x</script>", reviewEmpty("Gone", "Nothing here."));
    await expect(res.text()).resolves.not.toContain("<script>x</script>");
  });
});

describe("reviewResult", () => {
  it("distinguishes a decision from a no-op", () => {
    expect(reviewResult(true, "Approved.")).toContain("Done");
    expect(reviewResult(false, "Already handled.")).toContain("No change");
  });
});
