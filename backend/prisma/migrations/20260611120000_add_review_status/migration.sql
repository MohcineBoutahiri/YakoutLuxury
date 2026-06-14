CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Review"
ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "Review"
SET "status" = CASE
  WHEN "isApproved" = true THEN 'APPROVED'::"ReviewStatus"
  ELSE 'PENDING'::"ReviewStatus"
END;

CREATE INDEX "Review_status_idx" ON "Review"("status");
