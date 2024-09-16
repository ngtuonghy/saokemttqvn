/*
  Warnings:

  - Added the required column `page_number` to the `Statement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Statement" ADD COLUMN     "page_number" INTEGER NOT NULL;
