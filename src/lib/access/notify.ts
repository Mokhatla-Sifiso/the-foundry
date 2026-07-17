/** A request row was saved, but the owner could not be told that it exists. */
export class NotifyError extends Error {
  constructor() {
    super("Your request was saved, but the notification email failed to send.");
    this.name = "NotifyError";
  }
}

/**
 * Settle an owner notification and a courtesy receipt independently.
 *
 * Sending them together in a Promise.all means a rejected receipt also discards
 * the owner notification and fails the caller, even though the row is already
 * committed. The receipt is best-effort; the owner notification is the only
 * thing that surfaces a pending request for review, so only it is fatal.
 */
export async function notifyOwner(
  tag: string,
  email: string,
  owner: Promise<void>,
  receipt: Promise<void>,
): Promise<void> {
  const [ownerResult, receiptResult] = await Promise.allSettled([owner, receipt]);
  if (receiptResult.status === "rejected") {
    console.error(`[${tag}] receipt to ${email} failed:`, receiptResult.reason);
  }
  if (ownerResult.status === "rejected") {
    console.error(`[${tag}] owner notification for ${email} failed:`, ownerResult.reason);
    throw new NotifyError();
  }
}
