//Yeni Yardım Ekleme Servisi
//Dosya Yolu: server/api/allowances/create.post.ts

//Görevi: Ön yüzden gelen verileri alır ve veritabanına yeni bir sosyal yardım olarak kaydeder.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body.employeeId || !body.name || !body.amount || !body.periodType) {
    throw createError({ statusCode: 400, statusMessage: 'Lütfen tüm zorunlu alanları doldurun.' })
  }

  try {
    const newAllowance = await prisma.allowance.create({
      data: {
        employeeId: body.employeeId,
        name: body.name,
        amount: parseFloat(body.amount),
        periodType: body.periodType // "MONTHLY" veya "YEARLY"
      }
    })
    return newAllowance
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Sosyal yardım kaydedilirken hata oluştu.' })
  }
})