-- CreateEnum
CREATE TYPE "update_subscriber_status" AS ENUM ('pending', 'confirmed');

-- CreateTable
CREATE TABLE "update_subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "update_subscriber_status" NOT NULL DEFAULT 'pending',
    "confirmTokenHash" TEXT,
    "confirmExpiresAt" TIMESTAMP(3),
    "unsubscribeTokenHash" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "update_subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "update_subscriber_email_key" ON "update_subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "update_subscriber_confirmTokenHash_key" ON "update_subscriber"("confirmTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "update_subscriber_unsubscribeTokenHash_key" ON "update_subscriber"("unsubscribeTokenHash");

-- CreateIndex
CREATE INDEX "update_subscriber_status_idx" ON "update_subscriber"("status");
