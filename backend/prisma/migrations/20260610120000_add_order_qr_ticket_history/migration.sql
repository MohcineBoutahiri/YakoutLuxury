-- Add QR/ticket fields without breaking existing orders.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "Order" ADD COLUMN "qrCodeUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "ticketPrintedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "lastStatusChangedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "lastStatusChangedById" TEXT;

WITH numbered_orders AS (
  SELECT
    "id",
    "createdAt",
    ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", "id") AS sequence_number
  FROM "Order"
)
UPDATE "Order" AS orders
SET
  "orderNumber" = CONCAT(
    'YL-',
    EXTRACT(YEAR FROM numbered_orders."createdAt")::INT,
    '-',
    LPAD(numbered_orders.sequence_number::TEXT, 5, '0')
  ),
  "qrToken" = gen_random_uuid()::TEXT
FROM numbered_orders
WHERE orders."id" = numbered_orders."id";

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "qrToken" SET NOT NULL;

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_qrToken_key" ON "Order"("qrToken");
CREATE INDEX "Order_lastStatusChangedById_idx" ON "Order"("lastStatusChangedById");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_lastStatusChangedById_fkey"
FOREIGN KEY ("lastStatusChangedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "oldStatus" "OrderStatus",
  "newStatus" "OrderStatus" NOT NULL,
  "changedById" TEXT,
  "note" TEXT,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX "OrderStatusHistory_changedById_idx" ON "OrderStatusHistory"("changedById");
CREATE INDEX "OrderStatusHistory_source_idx" ON "OrderStatusHistory"("source");
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
