/*
  Warnings:

  - You are about to drop the column `threadId` on the `replies` table. All the data in the column will be lost.
  - Added the required column `targetId` to the `replies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "replies" DROP CONSTRAINT "replies_threadId_fkey";

-- AlterTable
ALTER TABLE "replies" DROP COLUMN "threadId",
ADD COLUMN     "targetId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
