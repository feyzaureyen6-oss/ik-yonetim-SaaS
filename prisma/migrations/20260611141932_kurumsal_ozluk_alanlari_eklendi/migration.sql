-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "iban" TEXT,
ADD COLUMN     "terminationDate" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Uzman';
