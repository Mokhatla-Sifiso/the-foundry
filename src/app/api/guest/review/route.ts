import { pendingRequestByToken, reviewGuestRequest } from "@/lib/access/guest";
import { GUEST_GRANT_HOURS, resourceLabel } from "@/lib/access/resources";
import { reviewCard, reviewEmpty, reviewPage, reviewResult } from "@/lib/access/review-html";

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) {
    return reviewPage("Guest access", reviewEmpty("Invalid link", "No request token was provided."));
  }
  const req = await pendingRequestByToken(token);
  if (!req) {
    return reviewPage(
      "Guest access",
      reviewEmpty("Nothing to review", "This link is invalid, or the request was already handled."),
    );
  }
  return reviewPage(
    "Review guest access",
    reviewCard({
      eyebrow: "Silver tier",
      heading: "Review guest access",
      name: req.name,
      email: req.email,
      fields: [
        {
          label: "Resources",
          value: req.resources.map(resourceLabel).join(", ") || "Not specified",
          accent: true,
        },
      ],
      message: req.message,
      createdAt: req.createdAt,
      token,
      approveLabel: `Approve · ${GUEST_GRANT_HOURS} hours`,
      rejectLabel: "Decline",
      note: `Approving emails them a link and opens their access for ${GUEST_GRANT_HOURS} hours. Declining emails them too, without a reason.`,
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
      return reviewPage("Guest access", reviewEmpty("Invalid request", "Something was missing."));
    }
    const result = await reviewGuestRequest(token, action);
    return reviewPage("Guest access", reviewResult(result.ok, result.message));
  } catch (err) {
    console.error("[guest/review]", err);
    return reviewPage("Guest access", reviewEmpty("Something went wrong", "Please try that again."));
  }
}
