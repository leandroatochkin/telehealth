-- CreateEnum
CREATE TYPE "ApiProvider" AS ENUM ('STREAM', 'GEMINI');

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "provider" "ApiProvider" NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "tokensPrompt" INTEGER,
    "tokensResponse" INTEGER,
    "modelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiUsage_provider_createdAt_idx" ON "ApiUsage"("provider", "createdAt");
