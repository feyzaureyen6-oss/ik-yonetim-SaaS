import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // --------------------------------------------------------------------------
  // 1. GET İSTEĞİ: Tüm Bordroları Personel Bilgileriyle Listele
  // --------------------------------------------------------------------------
 if (method === 'GET') {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, email: true, iban: true }
        }
      },
      // Yıl ve ay azalan (en yeni önce), isimler artan (A-Z) sıralama
      orderBy: [
        { year: 'desc' }, 
        { month: 'desc' },
        { employee: { firstName: 'asc' } }
      ]
    })
    
    return { 
      success: true, 
      data: payrolls.map(p => ({
        ...p,
        // Tüm Decimal alanlarını Number'a çevir (frontend hesaplamaları için şart)
        incomeTaxBase: p.incomeTaxBase?.toNumber() || 0,
        grossSalary: p.grossSalary?.toNumber() || 0,
        netSalary: p.netSalary?.toNumber() || 0,
        cumulativeTaxBase: p.cumulativeTaxBase?.toNumber() || 0
      })) 
    }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Bordro kayıtları getirilirken hata oluştu: ${error.message}`
      })
    }
  }

  // --------------------------------------------------------------------------
  // 2. POST İSTEĞİ: Yeni Maaş/Bordro Girişi Yap (Yasal Motorlu)
  // --------------------------------------------------------------------------
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      if (!body.employeeId || !body.month || !body.year || body.baseSalary === undefined) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Personel, yıl, ay ve net ana maaş alanları zorunludur.'
        })
      }

      const m = parseInt(body.month)
      const y = parseInt(body.year)
      
      // --- DÜZENLENEN KISIM: Kümülatif Matrah (Decimal ile toplama) ---
      const previousPayrolls = await prisma.payroll.findMany({
        where: { employeeId: body.employeeId, year: y },
        select: { incomeTaxBase: true }
      })
      const cumulativeTaxBase = previousPayrolls.reduce(
        (sum, p) => sum.plus(p.incomeTaxBase || 0), 
        new Prisma.Decimal(0)
      )
      // -----------------------------------------------------------
      
      const employeeExists = await prisma.employee.findUnique({
        where: { id: body.employeeId }
      })

      if (!employeeExists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Bordro kesilmek istenen personel sistemde bulunamadı.'
        })
      }

      const existingPayroll = await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: { employeeId: body.employeeId, month: m, year: y }
        }
      })

      if (existingPayroll) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bu personelin ilgili ay ve yıl için zaten bir bordro kaydı mevcut.'
        })
      }

      let parameters = await prisma.payrollParameter.findUnique({ where: { year: y } })

      if (!parameters) {
        parameters = await prisma.payrollParameter.create({
          data: {
            year: y,
            sgkWorkerRate: 14.0,
            unemploymentWorkerRate: 1.0,
            sgkEmployerRate: 15.5,
            unemploymentEmployerRate: 2.0,
            stampTaxRate: 0.00759,
            taxBracket1Limit: new Prisma.Decimal(158000), 
            taxBracket1Rate: 15.0,
            taxBracket2Limit: new Prisma.Decimal(390000),
            taxBracket2Rate: 20.0,
            taxBracket3Limit: new Prisma.Decimal(910000),
            taxBracket3Rate: 27.0,
            taxBracket4Limit: new Prisma.Decimal(3200000),
            taxBracket4Rate: 35.0,
            taxBracket5Rate: 40.0,
            minimumWageGross: new Prisma.Decimal(25002.0)
          }
        })
      }
      
      
// 4. Form Değerlerini Yakalama ve Güvenli Sayısallaştırma
      const base = new Prisma.Decimal(body.baseSalary || 0)
      const workedDays = body.workedDays ? parseInt(body.workedDays) : 30
      const hours = new Prisma.Decimal(body.overtimeHours || 0)
      const rate = new Prisma.Decimal(body.overtimeHourlyRate || 0)
      
      const advances = new Prisma.Decimal(body.advances || 0)
      const deductions = new Prisma.Decimal(body.deductions || 0)

      // 5. Değişken ve Sosyal Gelirlerin Hesaplanması
      const calculatedBonus = hours.times(rate) 

      const activeAllowances = await prisma.allowance.findMany({
        where: { employeeId: body.employeeId }
      })
      const allowancesTotal = activeAllowances.reduce((sum, item) => sum.plus(item.amount), new Prisma.Decimal(0))

      // 6. 🧮 YASAL REVERSE-MATRİX (NET'TEN BRÜT'E) MOTORU
      const baseEarningsForGross = base.plus(calculatedBonus).plus(allowancesTotal);
      const sgkWorkerRate = new Prisma.Decimal(parameters.sgkWorkerRate).div(100);
      const unempWorkerRate = new Prisma.Decimal(parameters.unemploymentWorkerRate).div(100);
      const stampTaxRate = new Prisma.Decimal(parameters.stampTaxRate);

      const getTaxRate = (currentBase: Prisma.Decimal) => {
        const totalBase = cumulativeTaxBase.plus(currentBase);
        if (totalBase.lte(parameters!.taxBracket1Limit)) return new Prisma.Decimal(parameters!.taxBracket1Rate).div(100);
        if (totalBase.lte(parameters!.taxBracket2Limit)) return new Prisma.Decimal(parameters!.taxBracket2Rate).div(100);
        if (totalBase.lte(parameters!.taxBracket3Limit)) return new Prisma.Decimal(parameters!.taxBracket3Rate).div(100);
        return new Prisma.Decimal(parameters!.taxBracket4Rate).div(100);
      };

      let incomeTaxRate = getTaxRate(baseEarningsForGross);
      // Katsayı formülü: 1 - (SGK + İşsizlik + (GelirVergisi * (1 - SGK - İşsizlik)) + Damga)
      let katsayi = new Prisma.Decimal(1).minus(
        sgkWorkerRate.plus(unempWorkerRate)
        .plus(incomeTaxRate.times(new Prisma.Decimal(1).minus(sgkWorkerRate).minus(unempWorkerRate)))
        .plus(stampTaxRate)
      );
      let grossSalary = baseEarningsForGross.div(katsayi);

      // 7. ⚖️ YASAL KESİNTİLER
      const sgkWorkerPay = grossSalary.times(sgkWorkerRate);
      const unemploymentWorker = grossSalary.times(unempWorkerRate);
      
      const incomeTaxBaseVal = grossSalary.minus(sgkWorkerPay.plus(unemploymentWorker));
      incomeTaxRate = getTaxRate(incomeTaxBaseVal); 
      const incomeTax = incomeTaxBaseVal.times(incomeTaxRate);
      const stampTax = grossSalary.times(stampTaxRate);

      // İşveren payları
      const sgkEmployerPay = grossSalary.times(new Prisma.Decimal(parameters.sgkEmployerRate).div(100));
      const unemploymentEmployer = grossSalary.times(new Prisma.Decimal(parameters.unemploymentEmployerRate).div(100));
      const totalEmployerCost = grossSalary.plus(sgkEmployerPay).plus(unemploymentEmployer);

      // 8. 💰 NİHAİ NET MAAŞ
      const netSalary = grossSalary.minus(sgkWorkerPay).minus(unemploymentWorker).minus(incomeTax).minus(stampTax).minus(advances).minus(deductions);

      // 9. Veri Tabanına Kurumsal Kayıt
      const newPayroll = await prisma.payroll.create({
        data: {
          employeeId: body.employeeId,
          month: m,
          year: y,
          baseSalary: base,
          workedDays: workedDays,
          overtimeHours: hours,
          overtimeHourlyRate: rate,
          bonus: calculatedBonus,
          allowancesTotal: allowancesTotal,
          incomeTaxBase: incomeTaxBaseVal,
          monthlyTaxBase: incomeTaxBaseVal,
          cumulativeTaxBase: cumulativeTaxBase.plus(incomeTaxBaseVal),
          advances: advances,
          deductions: deductions,
          netSalary: netSalary,
          isPaid: body.isPaid || false,
          
          grossSalary: grossSalary,
          sgkWorkerPay: sgkWorkerPay,
          unemploymentWorker: unemploymentWorker,
          incomeTax: incomeTax,
          stampTax: stampTax,
          sgkEmployerPay: sgkEmployerPay,
          unemploymentEmployer: unemploymentEmployer,
          totalEmployerCost: totalEmployerCost,
          
          parameterId: parameters.id
        },
        include: { employee: { select: { firstName: true, lastName: true, email: true } } }
      })
      return { 
        success: true, 
        message: 'Bordro, yasal kalemler ve şirket maliyetleri başarıyla hesaplanıp kurumsal standartta kaydedildi.', 
        data: newPayroll 
      }
    } catch (error: any) {
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || `Bordro oluşturulurken sistemsel hata: ${error.message}`
      })
    }
  }
})