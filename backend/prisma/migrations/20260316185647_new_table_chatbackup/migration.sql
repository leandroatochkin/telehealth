-- CreateTable
CREATE TABLE "ChatBackup" (
    "id" TEXT NOT NULL,
    "streamMessageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatBackup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatBackup_streamMessageId_key" ON "ChatBackup"("streamMessageId");

-- CreateIndex
CREATE INDEX "ChatBackup_channelId_idx" ON "ChatBackup"("channelId");
