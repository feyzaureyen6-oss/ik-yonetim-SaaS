import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Geçersiz Bordro ID' })
  }

  // --------------------------------------------------------------------------
  // ✏️ SENARYO 1: BORDRO GÜNCELLEME (PUT) - Decimal Hassasiyetli
  // --------------------------------------------------------------------------
  if (method === 'PUT') {
    const body = await readBody(event)

    try {
      const y = Number(body.year) || new Date().getFullYear()
      const p = await prisma.payrollParameter.findUnique({ where: { year: y } }) || {
        sgkWorkerRate: 14.0, unemploymentWorkerRate: 1.0, 
        taxBracket1Limit: 158000, taxBracket1Rate: 15.0,
        taxBracket2Limit: 390000, taxBracket2Rate: 20.0,
        stampTaxRate: 0.00759, sgkEmployerRate: 15.5, unemploymentEmployerRate: 2.0
      }

      // 1. Decimal Dönüşümleri
      const baseSalary = new Prisma.Decimal(body.baseSalary || 0)
      const advances = new Prisma.Decimal(body.advances || 0)
      const deductions = new Prisma.Decimal(body.deductions || 0)
      const bonus = new Prisma.Decimal(body.overtimeHours || 0).times(body.overtimeHourlyRate || 0)
      const allowances = new Prisma.Decimal(body.allowances || 0)
      const targetNet = baseSalary.plus(bonus).plus(allowances) // Sosyal yardımları buraya ekleyebilirsin

      // 2. 🧮 Dinamik Yasal Motor (Decimal)
      const getTaxRate = (amount: Prisma.Decimal) => {
        if (amount.lte(p.taxBracket1Limit)) return new Prisma.Decimal(p.taxBracket1Rate).div(100)
        return new Prisma.Decimal(p.taxBracket2Rate).div(100)
      }

      const sWorker = new Prisma.Decimal(p.sgkWorkerRate).div(100)
      const uWorker = new Prisma.Decimal(p.unemploymentWorkerRate).div(100)
      const stamp = new Prisma.Decimal(p.stampTaxRate)
      
      let taxRate = getTaxRate(targetNet)
      
      // Katsayı = 1 - (SGK + İşsizlik + (GelirVergisi * (1 - SGK - İşsizlik)) + Damga)
      let katsayi = new Prisma.Decimal(1).minus(
        sWorker.plus(uWorker)
        .plus(taxRate.times(new Prisma.Decimal(1).minus(sWorker).minus(uWorker)))
        .plus(stamp)
      )
      
      let grossSalary = targetNet.div(katsayi)

      // 3. Kesintiler
      const sgkWorkerPay = grossSalary.times(sWorker)
      const unemploymentWorker = grossSalary.times(uWorker)
      const incomeTaxBase = grossSalary.minus(sgkWorkerPay).minus(unemploymentWorker)
      
      taxRate = getTaxRate(incomeTaxBase)
      const incomeTax = incomeTaxBase.times(taxRate)
      const stampTax = grossSalary.times(stamp)
      
      const sgkEmployerPay = grossSalary.times(new Prisma.Decimal(p.sgkEmployerRate).div(100))
      const unemploymentEmployer = grossSalary.times(new Prisma.Decimal(p.unemploymentEmployerRate).div(100))
      
      const netSalary = grossSalary.minus(sgkWorkerPay).minus(unemploymentWorker).minus(incomeTax).minus(stampTax).minus(advances).minus(deductions)
      const totalEmployerCost = grossSalary.plus(sgkEmployerPay).plus(unemploymentEmployer)
     

      
      // 4. Veritabanı Güncelleme
      const updatedPayroll = await prisma.payroll.update({
        where: { id: id },
        data: {
          month: Number(body.month),
          year: y,
          workedDays: Number(body.workedDays) || 30,
          baseSalary, advances, deductions,
          allowancesTotal: new Prisma.Decimal(body.allowances || 0),
          overtimeHours: new Prisma.Decimal(body.overtimeHours || 0),
          overtimeHourlyRate: new Prisma.Decimal(body.overtimeHourlyRate || 0),
          bonus, grossSalary, sgkWorkerPay, unemploymentWorker, 
          incomeTax, stampTax, netSalary, sgkEmployerPay, 
          unemploymentEmployer, totalEmployerCost,
          isPaid: Boolean(body.isPaid)
        }
      })

      return { success: true, data: updatedPayroll }

    } catch (error: any) {
      throw createError({ statusCode: 500, statusMessage: `Güncelleme hatası: ${error.message}` })
    }
  }

  // DELETE senaryosu olduğu gibi kalabilir (değişim gerektirmez)
  if (method === 'DELETE') {
    try {
      await prisma.payroll.delete({ where: { id: id } })
      return { success: true, message: 'Bordro kaydı silindi.' }
    } catch (error: any) {
      throw createError({ statusCode: 500, statusMessage: 'Silme işlemi başarısız.' })
    }
  }
})