/*
  Warnings:

  - You are about to drop the column `description` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `document_no` on the `Statement` table. All the data in the column will be lost.
  - Added the required column `no` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_description` to the `Statement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Statement" DROP COLUMN "description",
DROP COLUMN "document_no",
ADD COLUMN     "no" TEXT NOT NULL,
ADD COLUMN     "transaction_description" TEXT NOT NULL;
