import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface BulkEmployeeInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  employmentType?: 'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | 'INTERN'
  iban?: string
  hireDate?: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ employees: BulkEmployeeInput[] }>(event)
    
    if (!body || !body.employees || !Array.isArray(body.employees)) {
      throw createError({ statusCode: 400, statusMessage: 'Geçersiz personel listesi formatı.' })
    }

    const inputList = body.employees
    const successInserted: any[] = []
    const failedRows: any[] = []

    // Güvenlik önlemi: Eğer sistemde hiç departman yoksa geçici bir departman bul/yarat
    let defaultDepartment = await prisma.department.findFirst()
    if (!defaultDepartment) {
      defaultDepartment = await prisma.department.create({
        data: { name: 'Genel Yönetim', code: 'GNL' }
      })
    }

    // Performans ve çakışma yönetimi için personelleri tek tek kontrol ederek işliyoruz
    for (const [index, emp] of inputList.entries()) {
      const rowNumber = index + 1

      // Temel zorunlu alan kontrolü
      if (!emp.firstName || !emp.lastName || !emp.email) {
        failedRows.push({ row: rowNumber, email: emp.email || 'Bilinmiyor', reason: 'Ad, Soyad veya E-posta alanı boş olamaz.' })
        continue
      }

      // Sistemde bu e-posta adresi zaten var mı? (Duplicate check)
      const existingEmp = await prisma.employee.findUnique({
        where: { email: emp.email.trim().toLowerCase() }
      })

      if (existingEmp) {
        failedRows.push({ row: rowNumber, email: emp.email, reason: 'Bu e-posta adresine sahip bir personel sistemde zaten kayıtlı.' })
        continue
      }

      try {
        // Personeli veritabanına ekle
        const newEmployee = await prisma.employee.create({
          data: {
            firstName: emp.firstName.trim(),
            lastName: emp.lastName.trim(),
            email: emp.email.trim().toLowerCase(),
            phone: emp.phone ? emp.phone.trim() : null,
            title: emp.title ? emp.title.trim() : 'Uzman',
            employmentType: emp.employmentType || 'FULL_TIME',
            iban: emp.iban ? emp.iban.trim() : null,
            hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date(),
            status: 'ACTIVE',
            departmentId: defaultDepartment.id // İlk aşamada varsayılan departmana atıyoruz
          }
        })
        successInserted.push(newEmployee)
      } catch (dbError: any) {
        failedRows.push({ row: rowNumber, email: emp.email, reason: `Veritabanı kayıt hatası: ${dbError.message}` })
      }
    }

    return {
      success: true,
      summary: {
        totalProcessed: inputList.length,
        successCount: successInserted.length,
        failedCount: failedRows.length
      },
      failedRows
    }

  } catch (error: any) {
    console.error("Toplu personel yükleme hatası:", error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Toplu yükleme işlemi sırasında sunucu hatası oluştu.'
    })
  }
})