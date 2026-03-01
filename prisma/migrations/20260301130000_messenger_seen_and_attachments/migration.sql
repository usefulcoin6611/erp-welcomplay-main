-- AlterTable: conversation_participant - add lastSeenMessageId, lastSeenAt
ALTER TABLE "conversation_participant" ADD COLUMN "lastSeenMessageId" TEXT;
ALTER TABLE "conversation_participant" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- CreateTable: message_attachment
CREATE TABLE "message_attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,

    CONSTRAINT "message_attachment_pkey" PRIMARY KEY ("id")
);

-- AlterTable: message - content optional (default '')
ALTER TABLE "message" ALTER COLUMN "content" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "message_attachment_messageId_idx" ON "message_attachment"("messageId");

-- AddForeignKey: conversation_participant.lastSeenMessageId -> message.id
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_lastSeenMessageId_fkey" 
  FOREIGN KEY ("lastSeenMessageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: message_attachment.messageId -> message.id
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_messageId_fkey" 
  FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
