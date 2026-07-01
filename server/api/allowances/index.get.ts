//Yardımları Listeleme Servisi
//Dosya Yolu: server/api/allowances/index.get.ts

//Görevi: Sadece o personelin yardımlarını veritabanından çekip ön yüze yollar.


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const employeeId = query.employeeId as string

  if (!employeeId) {
    throw createError({ statusCode: 400, statusMessage: 'Personel ID zorunludur.' })
  }

  try {
    const allowances = await prisma.allowance.findMany({
      where: { employeeId: employeeId },
      orderBy: { createdAt: 'desc' }
    })
    return allowances
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Yardımlar getirilirken hata oluştu.' })
  }
})