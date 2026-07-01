/*
  Warnings:

  - You are about to alter the column `incomeTaxBase` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,4)`.
  - Added the required column `incomeTax` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "incomeTax" DECIMAL(19,4) NOT NULL,
ALTER COLUMN "incomeTaxBase" DROP DEFAULT,
ALTER COLUMN "incomeTaxBase" SET DATA TYPE DECIMAL(19,4);
