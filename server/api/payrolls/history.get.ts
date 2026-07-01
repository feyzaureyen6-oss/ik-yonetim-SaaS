// server/api/payrolls/history.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    return await prisma.payroll.findMany({
      where: { isPaid: true },
      // Departman verisini dahil etmek için iç içe include yapıyoruz
      include: { 
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Veriler çekilirken bir hata oluştu',
    })
  }
})