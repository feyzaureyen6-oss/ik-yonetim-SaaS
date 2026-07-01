/*
  Warnings:

  - You are about to drop the column `incomeTax` on the `Payroll` table. All the data in the column will be lost.
  - Added the required column `parameterId` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Allowance" ADD COLUMN     "isTaxable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "incomeTax",
ADD COLUMN     "advances" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "allowancesTotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "cumulativeTaxBase" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "incomeTaxBase" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "monthlyTaxBase" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "parameterId" TEXT NOT NULL,
ADD COLUMN     "taxExemption" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "workedDays" INTEGER NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE "PayrollParameter" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sgkWorkerRate" DOUBLE PRECISION NOT NULL DEFAULT 14.0,
    "unemploymentWorkerRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sgkEmployerRate" DOUBLE PRECISION NOT NULL DEFAULT 15.5,
    "unemploymentEmployerRate" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "stampTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.00759,
    "taxBracket1Limit" DOUBLE PRECISION NOT NULL,
    "taxBracket1Rate" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "taxBracket2Limit" DOUBLE PRECISION NOT NULL,
    "taxBracket2Rate" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "taxBracket3Limit" DOUBLE PRECISION NOT NULL,
    "taxBracket3Rate" DOUBLE PRECISION NOT NULL DEFAULT 27.0,
    "taxBracket4Limit" DOUBLE PRECISION NOT NULL,
    "taxBracket4Rate" DOUBLE PRECISION NOT NULL DEFAULT 35.0,
    "taxBracket5Rate" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "minimumWageGross" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollParameter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollParameter_year_key" ON "PayrollParameter"("year");

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "PayrollParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
