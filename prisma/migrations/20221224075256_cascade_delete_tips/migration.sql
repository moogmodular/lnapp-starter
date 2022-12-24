-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_tippeeId_fkey";

-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_tipperId_fkey";

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tipperId_fkey" FOREIGN KEY ("tipperId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tippeeId_fkey" FOREIGN KEY ("tippeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
