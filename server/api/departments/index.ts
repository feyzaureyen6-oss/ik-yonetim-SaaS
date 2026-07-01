import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Gelen isteğin metodunu alıyoruz (GET, POST vb.)
  const method = getMethod(event)

  // --------------------------------------------------------
  // 1. GET İSTEĞİ: Tüm Departmanları Listele
  // --------------------------------------------------------
  if (method === 'GET') {
    try {
      const departments = await prisma.department.findMany({
        orderBy: {
          name: 'asc' // Departmanları alfabetik sırala
        },
        include: {
          _count: {
            select: { employees: true } // Her departmanda kaç personel olduğunu da sayalım!
          }
        }
      })
      return { success: true, data: departments }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Departmanlar getirilirken hata oluştu: ${error.message}`
      })
    }
  }

  // --------------------------------------------------------
  // 2. POST İSTEĞİ: Yeni Departman Ekle
  // --------------------------------------------------------
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Validasyon: Departman adı boş gönderildiyse uyar
      if (!body.name || body.name.trim() === '') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Departman adı boş bırakılamaz.'
        })
      }

      // Aynı isimde departman var mı kontrol et
      const existingDept = await prisma.department.findUnique({
        where: { name: body.name.trim() }
      })

      if (existingDept) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bu isimde bir departman zaten mevcut.'
        })
      }

      // Veritabanına kaydet
      const newDepartment = await prisma.department.create({
        data: {
          name: body.name.trim()
        }
      })

      return { success: true, message: 'Departman başarıyla oluşturuldu.', data: newDepartment }
    } catch (error: any) {
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || `Departman eklenirken hata: ${error.message}`
      })
    }
  }
})