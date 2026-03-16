-- CreateTable
CREATE TABLE "zoom_meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "joinUrl" TEXT,
    "startUrl" TEXT,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "createdById" TEXT NOT NULL,
    "syncGoogleCalendar" BOOLEAN NOT NULL DEFAULT false,
    "inviteClient" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zoom_meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zoom_meeting_participant" (
    "id" TEXT NOT NULL,
    "zoomMeetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "zoom_meeting_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zoom_meeting_projectId_idx" ON "zoom_meeting"("projectId");

-- CreateIndex
CREATE INDEX "zoom_meeting_createdById_idx" ON "zoom_meeting"("createdById");

-- CreateIndex
CREATE INDEX "zoom_meeting_startAt_idx" ON "zoom_meeting"("startAt");

-- CreateIndex
CREATE UNIQUE INDEX "zoom_meeting_participant_zoomMeetingId_userId_key" ON "zoom_meeting_participant"("zoomMeetingId", "userId");

-- CreateIndex
CREATE INDEX "zoom_meeting_participant_zoomMeetingId_idx" ON "zoom_meeting_participant"("zoomMeetingId");

-- CreateIndex
CREATE INDEX "zoom_meeting_participant_userId_idx" ON "zoom_meeting_participant"("userId");

-- AddForeignKey
ALTER TABLE "zoom_meeting" ADD CONSTRAINT "zoom_meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zoom_meeting" ADD CONSTRAINT "zoom_meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zoom_meeting_participant" ADD CONSTRAINT "zoom_meeting_participant_zoomMeetingId_fkey" FOREIGN KEY ("zoomMeetingId") REFERENCES "zoom_meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zoom_meeting_participant" ADD CONSTRAINT "zoom_meeting_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
