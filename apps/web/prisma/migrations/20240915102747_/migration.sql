/*
  Warnings:

  - You are about to drop the column `blance` on the `Statement` table. All the data in the column will be lost.
  - Added the required column `balance` to the `Statement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Statement" DROP COLUMN "blance",
ADD COLUMN     "balance" DECIMAL(65,30) NOT NULL;
