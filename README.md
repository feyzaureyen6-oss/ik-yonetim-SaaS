
[![Ekran Görüntüsü](https://github.com/feyzaureyen6-oss/ik-yonetim-SaaS/blob/main/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202026-07-01%20230741.png?raw=true)](https://github.com/feyzaureyen6-oss/ik-yonetim-SaaS/commit/d4c444dbf73ba9e39a9936c1805d1008fe0a0cfd)


İK Yönetim ve Bordro SaaS Sistemi

Bu sistem, şirketlerin personel özlük haklarından finansal analizlerine kadar tüm süreci dijitalleştiren, uçtan uca bir yönetim platformudur. Platform; departman kurulumundan, bordro hesaplamalarına ve geçmiş ödeme arşivlemeye kadar tüm operasyonları tek bir panel üzerinden yönetilmesini sağlar.

Sistem Modülleri ve İşleyiş
1. Departmanlar Sayfası
Şirketin hiyerarşik yapısının temelidir.

Yeni departmanlar oluşturulabilir ve organizasyon şeması düzenlenebilir.

Bu sayfada kurulan departman yapısı, personel yönetimi ve bordro hesaplamaları için referans noktası olarak kullanılır.

2. Personel Yönetimi Sayfası
Personel sözleşmelerinin ve yan hakların yönetildiği merkezdir.

Personel kartları üzerinden kişisel bilgiler, departman atamaları ve istihdam türleri takip edilir.

"Akıllı Toplu Personel Yükleme" ile hızlı veri girişi sağlanır.

"Toplu Yardım Tanımla" özelliğiyle yemek, yol gibi yan haklar personel bazlı olarak sisteme kaydedilir.

İşlem menüsü sayesinde personelin özlük bilgileri düzenlenebilir veya sistemden çıkarılabilir.

3. Maaş & Bordrolama Yönetimi Sayfası
Operasyonel işlemlerin yürütüldüğü, bordro hesaplama merkezidir.

"Yeni Maaş Hesapla" bölümünde; çalışma günü takibi, fazla mesai, avanslar ve özel kesintiler girilerek maaş hesaplamaları yapılır.

"Geçen Ayı Kopyala" butonuyla önceki dönem verileri hızlıca aktarılabilir.

Detaylı Analiz: Her bordro kaydı için "Düzenle" ekranında; yasal kesintiler, vergi matrahları ve şirkete olan toplam maliyet kırılımları detaylı olarak incelenir.

Bordro Karnesi (): İK birimlerinin personel bazlı hak edişleri, kümülatif matrahları ve yıllık brüt kazançları şeffafça takip etmesini sağlar.

İşlemler menüsünden personelin maaş pusulası (PDF) alınabilir, bordro geçmişi incelenebilir veya yanlış işlemler iptal edilebilir.

4. Geçmiş Ödemeler Sayfası
Tüm ödemelerin sicil bazlı tutulduğu arşivdir.

Yapılan tüm bordro hesaplamaları veritabanında saklanır ve personel sicil numaraları ile takip edilir.

Yıl ve ay bazlı filtreleme seçenekleri ile geçmişe dönük veriler listelenebilir.

Muhasebe süreçleri için "Excel Olarak İndir" özelliği ile tüm veriler dışa aktarılabilir.

5. Finansal Analiz Sayfası
Şirket maliyetlerinin ve personel hak edişlerinin özetlendiği analiz ekranıdır.

Toplam aktif kadro, şirket toplam maliyeti ve net ödeme tutarları gibi veriler anlık gösterge kartları (dashboard) ile izlenir.

Format Desteği: Raporlar ve grafikler; SVG, PNG ve CSV formatlarında indirilebilir.

Veri Odaklı Karar: İK yöneticileri, geçmiş verileri ve mevcut bütçeyi grafiksel olarak kıyaslayarak stratejik kararlar alır.

Şirket içi maliyet dağılımları ve personel maaş gelişimleri grafiksel olarak raporlanır.

💻 Teknik Yapı
Frontend: Nuxt 4, Vue 3, Vuetify 3 (Dinamik arayüz ve tablo yönetimi).

Backend: Node.js, TypeScript.

Veritabanı: Prisma ORM.

Dosya İşlemleri: PDF (Maaş pusulası) ve Excel (Raporlama) dışa aktarım desteği.

# Projeyi klonlayın
git clone https://github.com/feyzaureyen6-oss/ik-yonetim-SaaS.git

# Bağımlılıkları yükleyin
npm install

# Veritabanını hazırlayın
npx prisma db push

# Projeyi başlatın
npm run dev
Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
