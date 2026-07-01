//Yardım Silme Servisi
//Dosya Yolu: server/api/allowances/delete.delete.ts

//Görevi: URL'den gelen id parametresine göre o sosyal yardımı veritabanından tamamen siler.



import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Yardım ID zorunludur.' })
  }

  try {
    await prisma.allowance.delete({
      where: { id: id }
    })
    return { success: true, message: 'Sosyal yardım başarıyla silindi.' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Sosyal yardım silinirken hata oluştu.' })
  }
})