/*
  Warnings:

  - You are about to drop the column `balance` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `doc_no` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `name_bank` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Statement` table. All the data in the column will be lost.
  - Added the required column `bank_name` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credit_amount` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_no` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_name` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_date` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Statement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Statement" DROP COLUMN "balance",
DROP COLUMN "createdAt",
DROP COLUMN "credit",
DROP COLUMN "date",
DROP COLUMN "doc_no",
DROP COLUMN "name_bank",
DROP COLUMN "updatedAt",
ADD COLUMN     "balance_amount" DECIMAL(20,0),
ADD COLUMN     "bank_name" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "credit_amount" DECIMAL(20,0) NOT NULL,
ADD COLUMN     "document_no" TEXT NOT NULL,
ADD COLUMN     "reference_name" TEXT NOT NULL,
ADD COLUMN     "transaction_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
