/*
  Warnings:

  - Added the required column `doc_no` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Made the column `blance` on table `Statement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Statement" ADD COLUMN     "doc_no" TEXT NOT NULL,
ALTER COLUMN "blance" SET NOT NULL;
