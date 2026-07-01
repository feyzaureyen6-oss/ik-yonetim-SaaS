/*
  Warnings:

  - You are about to alter the column `amount` on the `Allowance` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `baseSalary` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `bonus` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `deductions` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `netSalary` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `overtimeHourlyRate` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `overtimeHours` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `grossSalary` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `sgkEmployerPay` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `sgkWorkerPay` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `stampTax` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `totalEmployerCost` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `unemploymentEmployer` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `unemploymentWorker` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `advances` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `allowancesTotal` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `cumulativeTaxBase` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,4)`.
  - You are about to alter the column `monthlyTaxBase` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,4)`.
  - You are about to alter the column `taxExemption` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,4)`.
  - You are about to alter the column `taxBracket1Limit` on the `PayrollParameter` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `taxBracket2Limit` on the `PayrollParameter` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `taxBracket3Limit` on the `PayrollParameter` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `taxBracket4Limit` on the `PayrollParameter` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `minimumWageGross` on the `PayrollParameter` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.

*/
-- AlterTable
ALTER TABLE "Allowance" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Payroll" ALTER COLUMN "baseSalary" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "bonus" DROP DEFAULT,
ALTER COLUMN "bonus" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "deductions" DROP DEFAULT,
ALTER COLUMN "deductions" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "netSalary" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "overtimeHourlyRate" DROP DEFAULT,
ALTER COLUMN "overtimeHourlyRate" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "overtimeHours" DROP DEFAULT,
ALTER COLUMN "overtimeHours" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "grossSalary" DROP DEFAULT,
ALTER COLUMN "grossSalary" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "sgkEmployerPay" DROP DEFAULT,
ALTER COLUMN "sgkEmployerPay" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "sgkWorkerPay" DROP DEFAULT,
ALTER COLUMN "sgkWorkerPay" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "stampTax" DROP DEFAULT,
ALTER COLUMN "stampTax" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "totalEmployerCost" DROP DEFAULT,
ALTER COLUMN "totalEmployerCost" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "unemploymentEmployer" DROP DEFAULT,
ALTER COLUMN "unemploymentEmployer" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "unemploymentWorker" DROP DEFAULT,
ALTER COLUMN "unemploymentWorker" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "advances" DROP DEFAULT,
ALTER COLUMN "advances" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "allowancesTotal" DROP DEFAULT,
ALTER COLUMN "allowancesTotal" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "cumulativeTaxBase" DROP DEFAULT,
ALTER COLUMN "cumulativeTaxBase" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "monthlyTaxBase" DROP DEFAULT,
ALTER COLUMN "monthlyTaxBase" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxExemption" DROP DEFAULT,
ALTER COLUMN "taxExemption" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "PayrollParameter" ALTER COLUMN "taxBracket1Limit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxBracket2Limit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxBracket3Limit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "taxBracket4Limit" SET DATA TYPE DECIMAL(19,4),
ALTER COLUMN "minimumWageGross" SET DATA TYPE DECIMAL(19,4);
