import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const targetAllowanceName = (query.targetAllowanceName as string) || 'Yemek Kartı / Ödeneği'
    const targetBudgetAllowanceName = (query.targetBudgetAllowanceName as string) || 'ALL'

    // 👥 2. Toplam Aktif Personel Sayısı
    const totalActiveEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' }
    })

    // 🔧 3. Dinamik Bütçe Filtre
    const budgetFilter: any = {
      employee: { status: 'ACTIVE' }
    }

    if (targetBudgetAllowanceName !== 'ALL') {
      budgetFilter.name = { equals: targetBudgetAllowanceName, mode: 'insensitive' }
    }

    // 🔄 4, 5, 6. AGGREGATE MOTORU (Decimal Hassasiyeti ile)
    const getSum = async (period: string) => {
      const result = await prisma.allowance.aggregate({
        where: { ...budgetFilter, periodType: period },
        _sum: { amount: true }
      })
      // _sum.amount Decimal döner, null ise 0 döndür
      return result._sum.amount || new Prisma.Decimal(0)
    }

    const recurringSum = await getSum('RECURRING')
    const oneOffSum = await getSum('ONEOFF')
    const annualSum = await getSum('ANNUAL')

    // 🧮 MATEMATİKSEL KONSOLİDASYON MOTORU
    // (Annual / 12) için Decimal.div kullanıyoruz
    const totalMonthlyBudget = recurringSum
      .plus(oneOffSum)
      .plus(annualSum.div(12))

    // 🔍 7. Eksik Personel Sayısı
    const employeesWithNoSpecificAllowance = await prisma.employee.count({
      where: {
        status: 'ACTIVE',
        allowances: {
          none: {
            name: { equals: targetAllowanceName, mode: 'insensitive' }
          }
        }
      }
    })

    return {
      success: true,
      stats: {
        activeStaffCount: totalActiveEmployees || 0,
        // Decimal'i Number'a çevirerek frontend'e yolla
        totalMonthlyBudget: totalMonthlyBudget.toNumber(), 
        missingAllowanceCount: employeesWithNoSpecificAllowance || 0
      }
    }
  } catch (error: any) {
    console.error("İstatistik hesaplama hatası:", error)
    throw createError({
      statusCode: 500,
      statusMessage: 'İstatistik motorunda hesaplama hatası.'
    })
  }
})