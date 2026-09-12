-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compensation" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "baseSalary" DECIMAL(65,30) NOT NULL,
    "bonus" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stock" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCompensation" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compensation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_normalizedName_key" ON "Company"("normalizedName");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_normalizedName_key" ON "Role"("normalizedName");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");

-- CreateIndex
CREATE INDEX "Location_country_city_idx" ON "Location"("country", "city");

-- CreateIndex
CREATE INDEX "Compensation_companyId_idx" ON "Compensation"("companyId");

-- CreateIndex
CREATE INDEX "Compensation_roleId_idx" ON "Compensation"("roleId");

-- CreateIndex
CREATE INDEX "Compensation_levelId_idx" ON "Compensation"("levelId");

-- CreateIndex
CREATE INDEX "Compensation_locationId_idx" ON "Compensation"("locationId");

-- CreateIndex
CREATE INDEX "Compensation_currency_idx" ON "Compensation"("currency");

-- CreateIndex
CREATE INDEX "Compensation_companyId_roleId_levelId_idx" ON "Compensation"("companyId", "roleId", "levelId");

-- AddForeignKey
ALTER TABLE "Compensation" ADD CONSTRAINT "Compensation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compensation" ADD CONSTRAINT "Compensation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compensation" ADD CONSTRAINT "Compensation_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compensation" ADD CONSTRAINT "Compensation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
