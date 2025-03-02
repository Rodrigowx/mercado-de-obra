-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "mercado-de-obra";

-- CreateTable
CREATE TABLE "mercado-de-obra"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Professional" (
    "id" INTEGER NOT NULL,
    "profileImage" TEXT,
    "skills" INTEGER[],
    "availability" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Client" (
    "id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "professionalIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Portfolio" (
    "id" SERIAL NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Location" (
    "id" SERIAL NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."PasswordResetCode" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."EmailVerificationCode" (
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Review" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL,
    "organization" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Budget" (
    "id" SERIAL NOT NULL,
    "needId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "laborCost" DOUBLE PRECISION,
    "materialList" TEXT[],
    "materialCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "serviceDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."Need" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceId" INTEGER NOT NULL,
    "budgetId" INTEGER,

    CONSTRAINT "Need_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."UnitOfMeasurement" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "UnitOfMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado-de-obra"."BudgetService" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "unitOfMeasurementId" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceId" INTEGER,
    "serviceValue" DOUBLE PRECISION,

    CONSTRAINT "BudgetService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_role_key" ON "mercado-de-obra"."User"("email", "role");

-- CreateIndex
CREATE INDEX "Professional_id_idx" ON "mercado-de-obra"."Professional"("id");

-- CreateIndex
CREATE INDEX "Client_id_idx" ON "mercado-de-obra"."Client"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "mercado-de-obra"."Service"("name");

-- CreateIndex
CREATE INDEX "Portfolio_professionalId_idx" ON "mercado-de-obra"."Portfolio"("professionalId");

-- CreateIndex
CREATE INDEX "Portfolio_serviceId_idx" ON "mercado-de-obra"."Portfolio"("serviceId");

-- CreateIndex
CREATE INDEX "Image_portfolioId_idx" ON "mercado-de-obra"."Image"("portfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_professionalId_key" ON "mercado-de-obra"."Location"("professionalId");

-- CreateIndex
CREATE INDEX "Location_professionalId_idx" ON "mercado-de-obra"."Location"("professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetCode_userId_key" ON "mercado-de-obra"."PasswordResetCode"("userId");

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "mercado-de-obra"."Review"("clientId");

-- CreateIndex
CREATE INDEX "Review_professionalId_idx" ON "mercado-de-obra"."Review"("professionalId");

-- CreateIndex
CREATE INDEX "Budget_needId_idx" ON "mercado-de-obra"."Budget"("needId");

-- CreateIndex
CREATE INDEX "Budget_clientId_idx" ON "mercado-de-obra"."Budget"("clientId");

-- CreateIndex
CREATE INDEX "Budget_professionalId_idx" ON "mercado-de-obra"."Budget"("professionalId");

-- CreateIndex
CREATE INDEX "Need_clientId_idx" ON "mercado-de-obra"."Need"("clientId");

-- CreateIndex
CREATE INDEX "Need_professionalId_idx" ON "mercado-de-obra"."Need"("professionalId");

-- CreateIndex
CREATE INDEX "Need_serviceId_idx" ON "mercado-de-obra"."Need"("serviceId");

-- CreateIndex
CREATE INDEX "Need_budgetId_idx" ON "mercado-de-obra"."Need"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasurement_code_key" ON "mercado-de-obra"."UnitOfMeasurement"("code");

-- CreateIndex
CREATE INDEX "BudgetService_budgetId_idx" ON "mercado-de-obra"."BudgetService"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetService_unitOfMeasurementId_idx" ON "mercado-de-obra"."BudgetService"("unitOfMeasurementId");

-- CreateIndex
CREATE INDEX "BudgetService_serviceId_idx" ON "mercado-de-obra"."BudgetService"("serviceId");
