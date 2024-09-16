-- CreateTable
CREATE TABLE "Statement" (
    "id" SERIAL NOT NULL,
    "credit" DECIMAL(65,30) NOT NULL,
    "blance" DECIMAL(65,30),
    "name_bank" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);
