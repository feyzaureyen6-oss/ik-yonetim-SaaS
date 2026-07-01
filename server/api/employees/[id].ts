import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// 🧠 NUXT DİNAMİK PERSONEL ROTASI
// ============================================================================
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Geçersiz Personel ID' })
  }

  // ✏️ PERSONEL GÜNCELLEME (PUT)
  if (method === 'PUT') {
    const body = await readBody(event)
    try {
      const updatedEmployee = await prisma.employee.update({
        where: { id: id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone || null, // Boş bırakıldıysa db'ye null yazarak koruyoruz
          title: body.title || "Uzman",
          iban: body.iban || null,   // Boş bırakıldıysa db'ye null yazarak koruyoruz
          status: body.status || "ACTIVE",
          employmentType: body.employmentType || "FULL_TIME", // Veritabanına eklediğimiz yeni alanımız
          
          // Tarihleri ISO formatına güvenli şekilde çeviriyoruz
          hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
          terminationDate: body.terminationDate ? new Date(body.terminationDate) : null,

          // 🌟 DÜZELTİLEN KESİN ÇÖZÜM:
          // Hata veren 'disconnect' tamamen kaldırıldı. 
          // Prisma, One-to-Many ilişkilerde sadece 'connect' ile eski bağı otomatik günceller.
          department: {
            connect: { id: body.departmentId }
          }
        },
        include: {
          department: true // Ön yüzdeki tablonun anında yenilenmesi için departmanı dahil ediyoruz
        }
      })
      
      // Ön yüzün doğrudan okuyabilmesi için güncel objeyi saf haliyle dönüyoruz
      return updatedEmployee

    } catch (error: any) {
      console.error("Prisma Personel Güncelleme Hatası:", error)
      throw createError({ 
        statusCode: 500, 
        statusMessage: `Personel güncellenirken sistemsel hata oluştu: ${error.message}` 
      })
    }
  }

  // ❌ PERSONEL SİLME (DELETE)
  if (method === 'DELETE') {
    try {
      // 🛡️ GÜVENLİK KALKANI: Bu personelin geçmişe dönük maaş/bordro kaydı var mı?
      const payrollCount = await prisma.payroll.count({
        where: { employeeId: id }
      })

      // Eğer geçmiş finansal kaydı varsa personeli silemeyiz (Mali denetim koruması)
      if (payrollCount > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: `Bu personelin sistemde ${payrollCount} adet maaş bordrosu var! Finansal geçmişi olan bir personeli silemezsiniz. Önce bordroları iptal etmelisiniz.`
        })
      }

      await prisma.employee.delete({ where: { id: id } })
      return { success: true, message: 'Personel başarıyla silindi.' }
    } catch (error: any) {
      if (error.statusCode) throw error
      throw createError({ statusCode: 500, statusMessage: 'Personel silinirken hata oluştu.' })
    }
  }
})