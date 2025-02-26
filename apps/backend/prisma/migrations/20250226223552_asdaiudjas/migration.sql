-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_needId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetService" DROP CONSTRAINT "BudgetService_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetService" DROP CONSTRAINT "BudgetService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetService" DROP CONSTRAINT "BudgetService_unitOfMeasurementId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_id_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "Need" DROP CONSTRAINT "Need_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Need" DROP CONSTRAINT "Need_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetCode" DROP CONSTRAINT "PasswordResetCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "Professional" DROP CONSTRAINT "Professional_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_professionalId_fkey";

-- CreateIndex
CREATE INDEX "Budget_needId_idx" ON "Budget"("needId");

-- CreateIndex
CREATE INDEX "Budget_clientId_idx" ON "Budget"("clientId");

-- CreateIndex
CREATE INDEX "Budget_professionalId_idx" ON "Budget"("professionalId");

-- CreateIndex
CREATE INDEX "BudgetService_budgetId_idx" ON "BudgetService"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetService_unitOfMeasurementId_idx" ON "BudgetService"("unitOfMeasurementId");

-- CreateIndex
CREATE INDEX "BudgetService_serviceId_idx" ON "BudgetService"("serviceId");

-- CreateIndex
CREATE INDEX "Client_id_idx" ON "Client"("id");

-- CreateIndex
CREATE INDEX "Image_portfolioId_idx" ON "Image"("portfolioId");

-- CreateIndex
CREATE INDEX "Location_professionalId_idx" ON "Location"("professionalId");

-- CreateIndex
CREATE INDEX "Need_clientId_idx" ON "Need"("clientId");

-- CreateIndex
CREATE INDEX "Need_professionalId_idx" ON "Need"("professionalId");

-- CreateIndex
CREATE INDEX "Need_serviceId_idx" ON "Need"("serviceId");

-- CreateIndex
CREATE INDEX "Need_budgetId_idx" ON "Need"("budgetId");

-- CreateIndex
CREATE INDEX "Portfolio_professionalId_idx" ON "Portfolio"("professionalId");

-- CreateIndex
CREATE INDEX "Portfolio_serviceId_idx" ON "Portfolio"("serviceId");

-- CreateIndex
CREATE INDEX "Professional_id_idx" ON "Professional"("id");

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "Review"("clientId");

-- CreateIndex
CREATE INDEX "Review_professionalId_idx" ON "Review"("professionalId");
