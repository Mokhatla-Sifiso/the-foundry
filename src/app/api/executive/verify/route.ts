import { verifyOtp } from "@/lib/access/otp";

export async function POST(request: Request): Promise<Response> {
  return verifyOtp(request, "executive/verify");
}
