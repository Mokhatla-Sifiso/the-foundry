import { Resend } from "resend";
const FROM = process.env.RESEND_FROM ?? "Mzwakhe Mokhatla <noreply@example.com>";
let resend: Resend | null = null;
function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const client = getResend();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email] RESEND_API_KEY missing — OTP for ${to}: ${otp}`);
      return;
    }
    throw new Error("RESEND_API_KEY missing");
  }
  const subject = "Your access code";
  const text = `Your one-time code is ${otp}. It expires in 5 minutes.`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #0a0a0a;">
      <h2 style="margin: 0 0 12px;">Your access code</h2>
      <p style="margin: 0 0 16px;">Use this code to continue:</p>
      <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 0 0 16px;">${otp}</p>
      <p style="color: #6b7280; font-size: 13px;">Expires in 5 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;
  const result = await client.emails.send({ from: FROM, to, subject, text, html });
  if (result.error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] Resend rejected the send (${result.error.message}). ` +
          `Falling back to console for ${to}. OTP: ${otp}`,
      );
      return;
    }
    throw new Error(result.error.message);
  }
}
