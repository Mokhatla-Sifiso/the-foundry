export class NotifyError extends Error {
  constructor() {
    super("Your request was saved, but the notification email failed to send.");
    this.name = "NotifyError";
  }
}

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
