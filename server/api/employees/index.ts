import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // --------------------------------------------------------
  // 1. GET İSTEĞİ: Tüm Personelleri Departmanlarıyla Birlikte Listele
  // --------------------------------------------------------
  if (method === 'GET') {
    try {
      const employees = await prisma.employee.findMany({
        include: {
          department: {
            select: {
              name: true // Personeli listelerken departmanının sadece adını getirmek yeterli
            }
          }
        },
        orderBy: {
          firstName: 'asc' // İsim sırasına göre diz
        }
      })
      return { success: true, data: employees }
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Personeller getirilirken hata oluştu: ${error.message}`
      })
    }
  }

  // --------------------------------------------------------
  // 2. POST İSTEĞİ: Yeni Personel Ekle (İşe Alım)
  // --------------------------------------------------------
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Zorunlu alanların validasyonu
      if (!body.firstName || !body.lastName || !body.email || !body.departmentId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ad, soyad, e-posta ve departman alanları zorunludur.'
        })
      }

      // 1. E-posta tekil mi (Unique) kontrolü
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: body.email.trim() }
      })

      if (existingEmployee) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bu e-posta adresiyle kayıtlı bir personel zaten var.'
        })
      }

      // 2. Seçilen departman gerçekten veritabanında var mı kontrolü
      const departmentExists = await prisma.department.findUnique({
        where: { id: body.departmentId }
      })

      if (!departmentExists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Seçilen departman sistemde bulunamadı.'
        })
      }

      // 3. Personeli Veritabanına Kaydet
      const newEmployee = await prisma.employee.create({
        data: {
          firstName: body.firstName.trim(),
          lastName: body.lastName.trim(),
          email: body.email.trim(),
          phone: body.phone ? body.phone.trim() : null,
          departmentId: body.departmentId,
          // 🌟 Yeni eklenen alanları backend'e bağlıyoruz:
           title: body.title || "Uzman",
           iban: body.iban || null,
            // Tarihleri ISO formatına güvenli şekilde çeviriyoruz
           hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
           terminationDate: body.terminationDate ? new Date(body.terminationDate) : null,
           status: body.status || "ACTIVE",
           employmentType: body.employmentType || "FULL_TIME"
          
        }
      })

      return { success: true, message: 'Personel başarıyla işe alındı.', data: newEmployee }
    } catch (error: any) {
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || `Personel eklenirken hata: ${error.message}`
      })
    }
  }
})