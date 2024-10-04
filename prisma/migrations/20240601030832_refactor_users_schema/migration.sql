/*
  Warnings:

  - You are about to drop the column `threadId` on the `likes` table. All the data in the column will be lost.
  - Added the required column `targetId` to the `likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_threadId_fkey";

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "threadId",
ADD COLUMN     "targetId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
