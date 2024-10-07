/*
  Warnings:

  - You are about to drop the `statement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "statement";

-- CreateTable
CREATE TABLE "Statement" (
    "id" SERIAL NOT NULL,
    "document_no" TEXT NOT NULL,
    "credit_amount" DECIMAL(20,0) NOT NULL,
    "balance_amount" DECIMAL(20,0),
    "bank_name" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "page_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);
