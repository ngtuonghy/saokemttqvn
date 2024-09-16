/*
  Warnings:

  - You are about to alter the column `credit` on the `Statement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,0)` to `Decimal(20,2)`.

*/
-- AlterTable
ALTER TABLE "Statement" ALTER COLUMN "credit" SET DATA TYPE DECIMAL(20,2);
