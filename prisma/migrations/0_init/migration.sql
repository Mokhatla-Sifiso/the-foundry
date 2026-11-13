CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "screen_decision" AS ENUM ('pending', 'approve', 'reject');

CREATE TYPE "consent_action" AS ENUM ('grant', 'withdraw', 'update', 'accept_terms', 'accept_privacy');

CREATE TYPE "access_tier" AS ENUM ('guest', 'recruiter', 'executive');

CREATE TYPE "access_request_kind" AS ENUM ('resource', 'demo', 'repo');

CREATE TYPE "access_request_status" AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedTermsAt" TIMESTAMP(3),
    "acceptedPrivacyAt" TIMESTAMP(3),
    "acceptedTermsVer" TEXT,
    "acceptedPrivacyVer" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_whitelist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_whitelist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recruiter_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "decision" "screen_decision" NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "consent_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "action" "consent_action" NOT NULL,
    "payload" JSONB NOT NULL,
    "policyVer" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "access_request" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "access_tier" NOT NULL,
    "kind" "access_request_kind" NOT NULL,
    "detail" JSONB NOT NULL,
    "message" TEXT,
    "status" "access_request_status" NOT NULL DEFAULT 'pending',
    "reviewToken" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "decidedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_request_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

CREATE UNIQUE INDEX "admin_whitelist_email_key" ON "admin_whitelist"("email");

CREATE UNIQUE INDEX "recruiter_profile_userId_key" ON "recruiter_profile"("userId");

CREATE INDEX "consent_log_userId_idx" ON "consent_log"("userId");

CREATE INDEX "consent_log_clientId_idx" ON "consent_log"("clientId");

CREATE UNIQUE INDEX "access_request_reviewToken_key" ON "access_request"("reviewToken");

CREATE INDEX "access_request_email_idx" ON "access_request"("email");

CREATE INDEX "access_request_status_idx" ON "access_request"("status");

ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recruiter_profile" ADD CONSTRAINT "recruiter_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "consent_log" ADD CONSTRAINT "consent_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
