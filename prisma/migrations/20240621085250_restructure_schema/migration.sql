-- AlterTable
ALTER TABLE "users" ADD COLUMN     "filterContent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "badLabels" TEXT[];
