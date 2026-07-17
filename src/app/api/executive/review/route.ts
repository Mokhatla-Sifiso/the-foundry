import { pendingExecutiveByToken, reviewExecutiveRequest } from "@/lib/access/executive";
import { reviewCard, reviewEmpty, reviewPage, reviewResult } from "@/lib/access/review-html";

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) {
    return reviewPage(
      "Executive request",
      reviewEmpty("Invalid link", "No request token was provided."),
    );
  }
  const req = await pendingExecutiveByToken(token);
  if (!req) {
    return reviewPage(
      "Executive request",
      reviewEmpty("Nothing to review", "This link is invalid, or the request was already handled."),
    );
  }
  const isDemo = req.kind === "demo";
  return reviewPage(
    isDemo ? "Review demo request" : "Review repo access",
    reviewCard({
      eyebrow: "Black tier",
      heading: isDemo ? "Review demo request" : "Review repo access",
      name: req.name,
      email: req.email,
      fields: isDemo
        ? [
            { label: "Preferred slot", value: req.slot, accent: true },
            { label: "Focus", value: req.topic },
          ]
        : [
            { label: "Repositories", value: req.repos, accent: true },
            { label: "Purpose", value: req.purpose },
          ],
      message: req.message,
      createdAt: req.createdAt,
      token,
      approveLabel: "Mark handled",
      rejectLabel: "Decline",
      note: "This only clears the request from your queue. Nothing is emailed to them, so reply to this notification to take it further.",
    }),
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const form = await request.formData();
    const token = String(form.get("token") ?? "");
    const raw = String(form.get("action") ?? "");
    const action = raw === "approve" ? "approve" : raw === "reject" ? "reject" : null;
    if (!token || !action) {
      return reviewPage("Executive request", reviewEmpty("Invalid request", "Something was missing."));
    }
    const result = await reviewExecutiveRequest(token, action);
    return reviewPage("Executive request", reviewResult(result.ok, result.message));
  } catch (err) {
    console.error("[executive/review]", err);
    return reviewPage(
      "Executive request",
      reviewEmpty("Something went wrong", "Please try that again."),
    );
  }
}
