import { startOtp } from "@/lib/access/otp";

export async function POST(request: Request): Promise<Response> {
  return startOtp(request, "guest/start");
}
