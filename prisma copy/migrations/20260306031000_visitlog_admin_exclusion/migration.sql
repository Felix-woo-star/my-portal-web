-- Add admin-identification metadata to analytics logs.
ALTER TABLE "VisitLog"
ADD COLUMN "username" TEXT,
ADD COLUMN "userRole" TEXT,
ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "VisitLog_isAdmin_createdAt_idx" ON "VisitLog" ("isAdmin", "createdAt");
