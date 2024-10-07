/*
  Warnings:

  - You are about to alter the column `credit` on the `Statement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,0)` to `DoublePrecision`.
  - You are about to alter the column `balance` on the `Statement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,0)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Statement" ALTER COLUMN "credit" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "balance" SET DATA TYPE DOUBLE PRECISION;
