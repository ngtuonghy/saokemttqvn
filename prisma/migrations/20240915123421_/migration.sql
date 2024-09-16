/*
  Warnings:

  - You are about to alter the column `credit` on the `Statement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `Decimal(20,0)`.
  - You are about to alter the column `balance` on the `Statement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,0)`.

*/
-- AlterTable
ALTER TABLE "Statement" ALTER COLUMN "credit" SET DATA TYPE DECIMAL(20,0),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,0);
