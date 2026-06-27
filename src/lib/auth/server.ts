import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { sendOtpEmail } from "./email";
const secret = process.env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret-change-me";
export const auth = betterAuth({
  appName: "Mzwakhe Mokhatla, Recruiter Access",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: false },
  user: {
    additionalFields: {
      name: { type: "string", required: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5,
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp }) {
        await sendOtpEmail(email, otp);
      },
    }),
    nextCookies(),
  ],
});
export type Auth = typeof auth;
