-- CreateIndex
CREATE INDEX "statement_index" ON "Statement"("transaction_date", "bank_name", "credit_amount");
