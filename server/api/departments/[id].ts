import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// 🧠 NUXT DİNAMİK ROTA NOTU (Feyza'nın Akıllı Yol Haritası)
// ============================================================================
// Klasör yapımız: /server/api/departments/
// 1. 'index.ts' -> /api/departments (Düz istekleri karşılar: Listeleme ve Yeni Ekleme)
// 2. '[id].ts'   -> /api/departments/XYZ (Dinamik istekleri karşılar: Güncelleme ve Silme)
//
// Dosya adının köşeli parantez '[id]' olması, Nuxt'a URL'den bir parametre 
// (ID) geleceğini söyler. Örn: /api/departments/clm123abc
// ============================================================================

export default defineEventHandler(async (event) => {
  // 🛰️ 1. Adım: İstek tipini (PUT/DELETE) ve URL'ye gömülen o eşsiz ID'yi yakalıyoruz
  const method = getMethod(event)
  const id = getRouterParam(event, 'id') // URL'deki [id] değerini söker alır

  // Güvenlik Duvarı: Eğer ID gelmediyse arkadaki veritabanını yorma, anında hata fırlat
  if (!id) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Geçersiz İstek: Departman ID si merkez ağa ulaşmadı.' 
})
  }

  // --------------------------------------------------------------------------
  // ✏️ SENARYO 1: DEPARTMAN ADI GÜNCELLEME (PUT İSTEĞİ)
  // --------------------------------------------------------------------------
  if (method === 'PUT') {
    const body = await readBody(event) // Ön yüzden gönderilen yeni veriyi (body) oku
    
    // Boş veri kontrolü
    if (!body.name || body.name.trim() === '') {
      throw createError({ statusCode: 400, statusMessage: 'Departman adı boş bırakılamaz!' })
    }

    try {
      // Prisma ile ilgili ID'ye sahip departmanın adını güncelliyoruz
      const updatedDepartment = await prisma.department.update({
        where: { id: id },
        data: { name: body.name }
      })
      return { success: true, data: updatedDepartment }
    } catch (error) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Veritabanı güncellenirken merkez istasyonda bir hata oluştu.' 
      })
    }
  }

  // --------------------------------------------------------------------------
  // ❌ SENARYO 2: DEPARTMAN SİLME (DELETE İSTEĞİ)
  // --------------------------------------------------------------------------
  if (method === 'DELETE') {
    try {
      // 🛡️ KRİTİK GÜVENLİK KALKANI:
      // Veritabanı bütünlüğünü korumak için, silinmek istenen departmana bağlı 
      // herhangi bir personel var mı diye sayım yapıyoruz.
      const employeeCount = await prisma.employee.count({
        where: { departmentId: id }
      })

      // İlişkisel Veritabanı Koruması: Eğer içeride personel varsa silmeyi ENGELLE!
      if (employeeCount > 0) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: `Bu departmanda aktif ${employeeCount} personel var. Personelleri silmeden veya başka departmana taşımadan bu departmanı imha edemezsiniz!` 
        })
      }

      // Departman tamamen boşsa, silme işlemine yeşil ışık yak
      await prisma.department.delete({
        where: { id: id }
      })

      return { success: true, message: 'Departman sistemden başarıyla temizlendi.' }
    } catch (error: any) {
      // Eğer bizim yukarıda fırlattığımız "içeride personel var" hatasıysa aynen ön yüze ilet
      if (error.statusCode) throw error
      
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Departman silinirken sistemsel bir veritabanı hatası oluştu.' 
      })
    }
  }
})