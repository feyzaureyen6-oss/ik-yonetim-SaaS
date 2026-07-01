/**
 * =================================================================================
 * API ENDPOINT: TOPLU YAN HAK VE SOSYAL YARDIM DAĞITIM MOTORU
 * =================================================================================
 * * Sorumluluk Alanı:
 * İK Toplu Yardım Sihirbazı (Wizard) üzerinden gelen çoklu personel ve yan hak verilerini
 * kurumsal bütçe ve veri tutarlılığı kurallarına uygun olarak toplu şekilde işler.
 * * Kabul Edilen Ödeme Sıklığı Standartları (periodType):
 * - "RECURRING" : Her ay düzenli ödenen yan haklar (Örn: Yemek Kartı, Yol Yardımı)
 * - "ONEOFF"    : Sadece bu aya mahsus tek seferlik ödemeler (Örn: Evlilik Yardımı, Prim)
 * - "ANNUAL"    : Yılda 1 kez verilen ve bütçede 12'ye bölünen haklar (Örn: Yakacak Yardımı)
 * * Çakışma Yönetim Senaryoları (conflictPolicy):
 * - "SKIP"      : Personelde aynı isim ve periyotta hak varsa mevcut tutarı korur, atlar.
 * - "OVERWRITE" : Personelde aynı isim ve periyotta hak varsa tutarını yenisiyle günceller.
 * * Güvenlik Politikası:
 * Tüm yazma/güncelleme döngüsü veri kaybını veya yarım kalma riskini (Race Condition) 
 * engellemek amacıyla atomik bir 'Prisma Transaction' tüneli içinde yürütülür.
 * * =================================================================================
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AllowanceInput {
  name: string
  amount: number | string
  periodType: string // Artık 'RECURRING', 'ONEOFF' veya 'ANNUAL' olmalı
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Frontend'den gelen paket yapısı
  const { targetType, departmentId, conflictPolicy, allowances } = body

  // 🛑 Girdi Kontrolü ve Validasyon Katmanı
  if (!targetType || !conflictPolicy || !allowances || !Array.isArray(allowances) || allowances.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Lütfen zorunlu alanları eksiksiz gönderin.' })
  }

  // 🛠️ NOT 1: Yeni standartlarımızın doğruluğunu kontrol eden validasyon döngüsü eklendi.
  const validPeriods = ['RECURRING', 'ONEOFF', 'ANNUAL']
  for (const item of allowances) {
    const period = (item.periodType || '').trim().toUpperCase()
    if (!validPeriods.includes(period)) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Geçersiz ödeme periyodu: [${item.periodType}]. Periyot sadece RECURRING, ONEOFF veya ANNUAL olabilir.` 
      })
    }
  }

  try {
    // 👥 1. Kapsama uyan aktif personelleri buluyoruz
    const targetEmployees = await prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        // 👑 Sihirbazın 2. adımında "Eksikleri Seç" veya "Özel Liste" yapıldıysa 'CUSTOM_LIST' devreye girer
        ...(targetType === 'CUSTOM_LIST' && body.customEmployeeIds 
          ? { id: { in: body.customEmployeeIds } } 
          : (targetType === 'DEPARTMENT' && departmentId ? { departmentId: String(departmentId) } : {})
        )
      },
      select: { id: true }
    })

    if (targetEmployees.length === 0) {
      return {
        success: true,
        message: 'Kapsama uyan veya seçilen herhangi bir aktif personel bulunamadı.'
      }
    }

    // 🔒 2. Güvenli veritabanı tüneli (Transaction) başlatıyoruz
    await prisma.$transaction(async (tx) => {
      
      for (const emp of targetEmployees) {
        
        // Personelin veritabanındaki MEVCUT tüm sosyal yardımlarını bir kerede çekiyoruz
        const currentAllowances = await tx.allowance.findMany({
          where: { employeeId: emp.id }
        })

        for (const item of allowances) {
          const finalName = item.name.trim().toLowerCase() // Arama için normalize et
          const finalAmount = parseFloat(String(item.amount))
          
          // 🛠️ NOT 2: Periyot eşleştirmesi eski 'MONTHLY/YEARLY' yapısından kurtarılarak,
          // yeni kurumsal standart olan 'RECURRING / ONEOFF / ANNUAL' yapısına uyarlandı.
          const finalPeriod = item.periodType.trim().toUpperCase()

          // 👑 GARANTİ EŞLEŞME MOTORU (JS Tarafında Güvenli Filtreleme)
          // Hem isim (büyük/küçük harfsiz) hem de yeni string periyot tipinin birebir uyuşması aranır.
          const matchedAllowance = currentAllowances.find(a => 
            a.name.trim().toLowerCase() === finalName && 
            (a.periodType || '').trim().toUpperCase() === finalPeriod
          )

          if (matchedAllowance) {
            // Eğer personelde bu hak aynı periyotta zaten varsa ve politika OVERWRITE (Üzerine Yaz) ise GÜNCELLE
            if (conflictPolicy === 'OVERWRITE') {
              await tx.allowance.update({
                where: { id: matchedAllowance.id },
                data: { 
                  amount: finalAmount
                  // periodType zaten aynı olduğu için sadece tutarı güncellemek yeterlidir.
                }
              })
            }
            // Politikası 'SKIP' ise sistem bu personelin bu hakkını hiçbir şey yapmadan güvenle atlar (Mevcutları Koru).
            
          } else {
            // Eğer personelde bu isim ve yeni periyotta bir hak yoksa SIFIRDAN YARAT
            await tx.allowance.create({
              data: {
                employeeId: emp.id,
                name: item.name.trim(), // Orijinal yazım formatını koruyarak kaydet
                amount: finalAmount,
                periodType: finalPeriod // 'RECURRING', 'ONEOFF' veya 'ANNUAL' olarak string yazılır
              }
            })
          }
        }
      }
    })

    return { 
      success: true, 
      message: `${targetEmployees.length} adet aktif personelin yan hakları yeni kurumsal periyot standartlarına göre başarıyla işlendi.` 
    }

  } catch (error: any) {
    // Hatanın detayını terminale yazdırıyoruz ki hata anında izleyebilelim
    console.error("====== VERİTABANI BULK İŞLEM HATASI ======", error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Veritabanı Toplu İşlem Hatası: ${error.message || 'Sistemsel bir sorun oluştu.'}` 
    })
  }
})