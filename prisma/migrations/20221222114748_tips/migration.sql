-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "tipperId" TEXT NOT NULL,
    "tippeeId" TEXT NOT NULL,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tip_tipperId_key" ON "Tip"("tipperId");

-- CreateIndex
CREATE UNIQUE INDEX "Tip_tippeeId_key" ON "Tip"("tippeeId");

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tipperId_fkey" FOREIGN KEY ("tipperId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tippeeId_fkey" FOREIGN KEY ("tippeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
