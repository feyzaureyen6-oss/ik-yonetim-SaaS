<template>
  <div class="pa-4 bg-grey-lighten-4">
    <!-- 📄 Üst Başlık ve Aksiyon Butonları Panel Alanı -->
    <v-row class="mb-2" align="center" justify="space-between">
      <v-col cols="12" md="5">
        <h1 class="text-h4 font-weight-bold text-indigo-darken-3">Özlük ve Personel Yönetimi</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Personel sözleşmelerini ve yan hakları yönetin.</p>
      </v-col>
      <v-col cols="12" md="7" class="d-flex justify-md-end align-center gap-2 flex-wrap">
        <!-- 📥 Toplu Gelişmiş Personel Yükleme Butonu (Sürükle-Bırak Modalı Açar) -->
        <v-btn color="success-darken-1" prepend-icon="mdi-file-excel" @click="openBulkImportDialog">
          Akıllı Toplu Personel Yükle
        </v-btn>
        <!-- 👥 Toplu Sosyal Yardım Dağıtım Sihirbazını Tetikleyen Buton -->
        <v-btn color="purple-darken-2" prepend-icon="mdi-account-group" @click="openBulkAllowanceDialog">
          Toplu Yardım Tanımla
        </v-btn>
        <!-- ➕ Standart Tekil Yeni Personel Kartı Oluşturma Modalı -->
        <v-btn color="indigo-darken-2" prepend-icon="mdi-plus" @click="openCreateDialog">
          Yeni Personel Ekle
        </v-btn>
      </v-col>
    </v-row>

    <!-- 📊 OPERASYONEL ÖZET BİLGİ KARTLARI -->
    <v-row dense class="mb-4">
      <!-- Kart 1: Toplam Aktif Kadro Sayısı -->
      <v-col cols="12" sm="4">
        <v-card color="indigo-lighten-5" class="py-2 px-3 border-start border-xl border-indigo-darken-3" elevation="1" height="105">
          <div class="d-flex align-center justify-space-between h-100">
            <div>
              <div class="text-caption text-indigo-darken-3 font-weight-medium">TOPLAM AKTİF KADRO</div>
              <div class="text-h4 font-weight-bold text-indigo-darken-4 mt-1">
                {{ stats.activeStaffCount }} <span class="text-subtitle-2 font-weight-regular text-grey-darken-2">Personel</span>
              </div>
            </div>
            <v-icon size="40" color="indigo-darken-2" class="opacity-60">mdi-account-multiple</v-icon>
          </div>
        </v-card>
      </v-col>

      <!-- Kart 2: Toplam Konsolide Aylık Bütçe Yükü (Amortisman Hesaplamalı) -->
<!-- Kart 2: Toplam Konsolide Aylık Bütçe Yükü (Amortisman Hesaplamalı) -->
<v-col cols="12" sm="4">
  <!-- Kart 3 ile aynı yükseklik (105) ve esnek h-100 yapısı -->
  <v-card color="purple-lighten-5" class="py-2 px-3 border-start border-xl border-purple-darken-3" elevation="1" height="105">
    <div class="d-flex align-center justify-space-between h-100">
      <div style="flex-grow: 1; max-width: 75%;">
        
        <!-- Üst Satır: Başlık Etiketi ve Kart 3 ile Aynı Yapıdaki select Menüsü -->
        <div class="d-flex align-center gap-1">
          <span class="text-caption font-weight-medium text-purple-darken-3">
            BÜTÇE:
          </span>
          <!-- 🛠️ Kart 3'ün stiliyle birebir aynı yerel select yapısı -->
          <select v-model="selectedBudgetAllowance" class="bg-white border rounded px-1 text-caption font-weight-bold" style="outline: none; max-width: 150px; cursor: pointer;">
            <option value="ALL">Tüm Yan Haklar</option>
            <option value="Yemek Kartı / Ödeneği">Yemek Kartı</option>
                  <option value="Yol / Ulaşım Yardımı">Yol Yardımı</option>
                  <option value="Yakacak Desteği">Yakacak Desteği</option>
                  <option value="Özel Sağlık Sigortası">Sağlık Sigortası</option>
                  <option value="İletişim / İnternet Desteği">İletişim Desteği</option>
          </select>
        </div>

        <!-- Orta Satır: Bütçe Rakamı -->
        <div class="text-h4 font-weight-bold text-purple-darken-4 mt-1">
          {{ formatMoney(stats.totalMonthlyBudget) }} <span class="text-subtitle-2 font-weight-regular text-grey-darken-2">₺ / Ay</span>
        </div>

      </div>

      <!-- Sağ Taraf: Orijinal İkon Konumu -->
      <v-icon size="40" color="purple-darken-2" class="opacity-60">
        mdi-cash-multiple
      </v-icon>
    </div>
  </v-card>
</v-col>
      <!-- Kart 3: Akıllı Eksik Hak Tanımları Takipçisi (Seçime Göre Dinamik Hesaplar) -->
      <v-col cols="12" sm="4">
        <v-card :color="stats.missingAllowanceCount > 0 ? 'amber-lighten-5' : 'green-lighten-5'" 
                :class="['py-2', 'px-3', 'border-start', 'border-xl', stats.missingAllowanceCount > 0 ? 'border-amber-darken-4' : 'border-green-darken-4']" 
                elevation="1" height="105">
          <div class="d-flex align-center justify-space-between h-100">
            <div style="flex-grow: 1; max-width: 75%;">
              <div class="d-flex align-center gap-1">
                <span :class="['text-caption', 'font-weight-medium', stats.missingAllowanceCount > 0 ? 'text-amber-darken-4' : 'text-green-darken-4']">
                  EKSİK HAK:
                </span>
                <!-- Yan Hak Takip Seçim Menüsü: Değişiklik anında 'onMissingTrackChange' fonksiyonu ile istatistikleri günceller -->
                <select v-model="selectedMissingAllowanceTrack" @change="onMissingTrackChange" class="bg-white border rounded px-1 text-caption font-weight-bold" style="outline: none; max-width: 150px; cursor: pointer;">
                  <option value="Yemek Kartı / Ödeneği">Yemek Kartı</option>
                  <option value="Yol / Ulaşım Yardımı">Yol Yardımı</option>
                  <option value="Yakacak Desteği">Yakacak Desteği</option>
                  <option value="Özel Sağlık Sigortası">Sağlık Sigortası</option>
                  <option value="İletişim / İnternet Desteği">İletişim Desteği</option>
                </select>
              </div>
              <div :class="['text-h4', 'font-weight-bold', 'mt-1', stats.missingAllowanceCount > 0 ? 'text-amber-darken-4' : 'text-green-darken-4']">
                {{ stats.missingAllowanceCount }} <span class="text-subtitle-2 font-weight-regular text-grey-darken-2">Personel</span>
              </div>
            </div>
            <v-icon size="40" :color="stats.missingAllowanceCount > 0 ? 'amber-darken-3' : 'green-darken-3'" class="opacity-60">
              {{ stats.missingAllowanceCount > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
            </v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 🔍 Hızlı Filtreleme ve Arama Alanı -->
    <v-card class="mb-4" outlined>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="İsim veya unvan ile ara..." variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="selectedDeptFilter" :items="[{ id: 'ALL', name: 'Tüm Departmanlar' }, ...departments]" item-title="name" item-value="id" label="Departman Filtresi" variant="outlined" density="compact" hide-details></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 📋 Ana Personel Listesi Veri Tablosu -->
    <v-card>
      <v-data-table :headers="headers" :items="filteredEmployees" :loading="tableLoading">
        <!-- Ad Soyad Birleştirme Hücresi -->
        <template v-slot:item.fullName="{ item }">
          <span class="font-weight-bold">{{ item.firstName }} {{ item.lastName }}</span>
        </template>
        
        <!-- Departman Adı Güvenli Gösterim Hücresi -->
        <template v-slot:item.departmentName="{ item }">
          {{ item.department?.name || 'Departmansız' }}
        </template>

        <!-- İstihdam Türü Çevirici Hücresi (Full-time -> Tam Zamanlı vb.) -->
        <template v-slot:item.employmentType="{ item }">
          {{ getEmpTypeName(item.employmentType) }}
        </template>

        <!-- Giriş Tarihi Formatlayıcı Hücresi -->
        <template v-slot:item.hireDate="{ item }">
          {{ formatDate(item.hireDate) }}
        </template>
        
       <template v-slot:item.status="{ item }">
  <!-- 🟢 AKTİF PERSONEL -->
  <v-chip v-if="item.status === 'ACTIVE'" color="green" size="small" class="font-weight-bold">
    Aktif
  </v-chip>

  <!-- 🔴 İŞTEN AYRILAN PERSONEL -->
  <div v-else-if="item.status === 'TERMINATED'" class="d-flex flex-column align-center">
    <v-chip color="red" size="small" class="font-weight-bold">
      Ayrıldı
    </v-chip>
    <!-- 🛠️ YENİ EKLENEN TARİH GÖSTERGESİ -->
    <!-- Personelin çıkış tarihi varsa formatlayıp altına küçük ve şık bir alt yazı olarak basıyoruz -->
    <span v-if="item.terminationDate" class="text-caption text-grey-darken-1 mt-1 font-weight-medium" style="font-size: 0.75rem !important;">
      {{ formatDate(item.terminationDate) }}
    </span>
  </div>
</template>
        
        <!-- Satır İçi Aksiyon Butonları (Yan Hak Girişi, Düzenleme, Fesih, Silme) -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn icon="mdi-gift" size="small" variant="text" color="purple-darken-2" title="Sosyal Yardım / Yan Hak" @click="openAllowanceDialog(item)"></v-btn>
            <v-btn icon="mdi-pencil" size="small" variant="text" color="indigo-darken-2" title="Düzenle" @click="openEditDialog(item)"></v-btn>
            <v-btn v-if="item.status === 'ACTIVE'" icon="mdi-account-cancel" size="small" variant="text" color="orange-darken-2" title="İş Akdini Feshet" @click="openTerminateDialog(item)"></v-btn>
            <v-btn icon="mdi-trash-can" size="small" variant="text" color="red" title="Sistemden Sil" @click="openDeleteDialog(item)"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 📥 DİYALOG: SÜRÜKLE-BIRAK EXCEL / CSV AKILLI TOPLU PERSONEL YÜKLEME PANELİ -->
    <v-dialog v-model="bulkImportDialog" max-width="650px" persistent>
      <v-card>
        <v-card-title class="bg-success-darken-1 text-white d-flex align-center justify-between">
          <span>Kurumsal Toplu Personel Yükleme</span>
          <v-spacer></v-spacer>
          <v-icon>mdi-file-upload-outline</v-icon>
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="text-body-2 mb-3 text-grey-darken-3">
            Excel (`.xlsx`, `.xls`) veya standart `.csv` dosyalarınızı bu alana sürükleyip bırakabilir ya da tıklayarak seçebilirsiniz.
            Sütun yerleşimi soldan sağa şu düzende olmalıdır: <br>
            <code class="bg-grey-lighten-2 px-1 rounded text-deep-orange-darken-4 font-weight-bold" style="font-size: 0.75rem;">
              Ad, Soyad, E-posta, Telefon, Unvan, İstihdamTürü, İşeGirişTarihi, IBAN
            </code>
          </p>

          <!-- 🎛️ Sürükle-Bırak Tetikleyici Bölgesi -->
          <div 
            :class="['drop-zone', isDragging ? 'drop-zone--active' : '']"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileSelect"
          >
            <input type="file" ref="fileInputRef" class="d-none" accept=".csv,.xlsx,.xls" @change="handleFileSelectChange" />
            
            <!-- Dosya Seçilmemişse Görünecek Alan -->
            <div v-if="!selectedImportFile" class="text-center py-4">
              <v-icon size="48" color="success" class="mb-2">mdi-cloud-upload</v-icon>
              <div class="text-body-1 font-weight-medium text-grey-darken-2">Dosyayı buraya sürükleyin veya tıklayın</div>
              <div class="text-caption text-grey">Desteklenen uzantılar: .xlsx, .xls, .csv</div>
            </div>
            
            <!-- Dosya Seçildiyse Görünecek Önizleme Alanı -->
            <div v-else class="text-center py-4">
              <v-icon size="48" color="indigo" class="mb-2">mdi-file-check</v-icon>
              <div class="text-body-1 font-weight-bold text-indigo-darken-3">{{ selectedImportFile.name }}</div>
              <div class="text-caption text-grey-darken-1">{{ (selectedImportFile.size / 1024).toFixed(2) }} KB</div>
              <v-btn size="x-small" color="red" variant="text" class="mt-1" @click.stop="clearSelectedFile">Dosyayı Kaldır</v-btn>
            </div>
          </div>

          <!-- Yükleme Sonrası Sonuç Rapor Özeti -->
          <v-alert v-if="importSummary" type="info" variant="tonal" class="mt-4">
            <div class="font-weight-bold">İşlem Özeti:</div>
            <div>Okunan Toplam Satır: {{ importSummary.totalProcessed }}</div>
            <div class="text-success font-weight-medium">Veritabanına Yazılan: {{ importSummary.successCount }}</div>
            <div class="text-error font-weight-medium">Hata Nedeniyle Atlanan: {{ importSummary.failedCount }}</div>
          </v-alert>

          <!-- Hata Alan Satırların Detay Listesi -->
          <div v-if="importErrors.length > 0" class="mt-3 border rounded overflow-y-auto" style="max-height: 150px;">
            <div class="bg-red-lighten-5 text-red-darken-4 text-caption font-weight-bold pa-2 border-bottom">İçeri Alınamayan Hatalı Satırlar:</div>
            <v-table density="compact">
              <tbody>
                <tr v-for="err in importErrors" :key="err.row">
                  <td class="text-caption">Satır {{ err.row }}</td>
                  <td class="text-caption font-weight-bold text-grey-darken-3">{{ err.email }}</td>
                  <td class="text-caption text-red font-weight-medium">{{ err.reason }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="outlined" @click="closeBulkImportDialog">Kapat</v-btn>
          <v-btn color="success" variant="flat" :loading="importLoading" :disabled="!selectedImportFile" @click="handleBulkImportSubmit">Dosyayı Ayrıştır ve Yükle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 📝 DİYALOG: TEKİL PERSONEL EKLEME VE DÜZENLEME FORMU -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="bg-indigo-darken-2 text-white">
          {{ isEditMode ? 'Personel Bilgilerini Güncelle' : 'Yeni Personel Kaydı' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="formRef" v-model="isFormValid">
            <v-row dense>
              <v-col cols="12" sm="6"><v-text-field v-model="form.firstName" label="Adı" variant="outlined" density="compact" :rules="requiredRule" required /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.lastName" label="Soyadı" variant="outlined" density="compact" :rules="requiredRule" required /></v-col>
              <v-col cols="12"><v-text-field v-model="form.email" label="E-posta" variant="outlined" density="compact" :rules="emailRules" required /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.phone" label="Telefon" variant="outlined" density="compact" placeholder="05xxxxxxxxx" maxlength="11" :rules="phoneRules" /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.title" label="Unvan" variant="outlined" density="compact" :rules="requiredRule" required /></v-col>
              <v-col cols="12" sm="6"><v-select v-model="form.departmentId" :items="departments" item-title="name" item-value="id" label="Departman" variant="outlined" density="compact" :rules="requiredRule" required /></v-col>
              <v-col cols="12" sm="6"><v-select v-model="form.employmentType" :items="employmentTypes" item-title="name" item-value="id" label="İstihdam Türü" variant="outlined" density="compact" :rules="requiredRule" required /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.hireDate" type="date" label="İşe Giriş Tarihi" variant="outlined" density="compact" :rules="requiredRule" required /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.iban" label="IBAN Numarası" placeholder="TR..." variant="outlined" density="compact" maxlength="26" :rules="ibanRules" /></v-col>
              <v-col cols="12" v-if="isEditMode">
                <v-select v-model="form.status" :items="[{id: 'ACTIVE', name: 'Aktif'}, {id: 'TERMINATED', name: 'Ayrıldı'}]" item-title="name" item-value="id" label="Durum" variant="outlined" density="compact" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDialog">İptal</v-btn>
          <v-btn color="indigo-darken-2" variant="flat" :loading="submitLoading" :disabled="!isFormValid" @click="handleSubmit">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🎁 DİYALOG: TEKLİ YAN HAK / SOSYAL YARDIM TANIMLAMA PANELİ -->
    <v-dialog v-model="allowanceDialog" max-width="600px" persistent>
      <v-card class="pa-2">
        <v-card-title class="bg-purple-darken-2 text-white rounded-t d-flex justify-space-between align-center">
          <span>{{ selectedEmployeeForAllowance?.firstName }} {{ selectedEmployeeForAllowance?.lastName }} - Yan Hak Girişi</span>
          <v-icon>mdi-gift-outline</v-icon>
        </v-card-title>

        <v-card-text class="pt-4">
          <div class="text-subtitle-1 font-weight-bold mb-3 text-purple-darken-3">Yeni Ödeme Tanımla</div>
          <v-row dense class="align-center">
            <v-col cols="12" sm="4">
              <v-select v-model="allowanceForm.selectedTypeId" :items="singleAllowanceOptions" item-title="label" item-value="id" label="Yardım Türü" variant="outlined" density="compact"></v-select>
            </v-col>

            <v-col cols="12" sm="3">
              <v-text-field v-model="allowanceForm.amount" type="number" label="Tutar" variant="outlined" density="compact" suffix="₺"></v-text-field>
            </v-col>

            <!-- 🛠️ NOT 1: Tekli yardım girişindeki bu alan mutabık kaldığımız kurumsal model (`RECURRING`, `ONEOFF`, `ANNUAL`) ile tam uyumludur. -->
            <v-col cols="12" sm="5">
              <v-select 
                v-model="allowanceForm.periodType" 
                :items="[
                  { id: 'RECURRING', name: 'Her Ay Düzenli (Yinelenen)' },
                  { id: 'ONEOFF', name: 'Sadece Bu Ay (Tek Seferlik)' },
                  { id: 'ANNUAL', name: 'Yılda 1 Kez (Yıllık)' }
                ]" 
                item-title="name" 
                item-value="id" 
                label="Ödeme Sıklığı" 
                variant="outlined" 
                density="compact"
              ></v-select>
            </v-col>
          </v-row>

          <v-row dense class="mt-n2 mb-2">
            <v-col cols="12" class="d-flex justify-end">
              <v-btn color="purple-darken-2" variant="flat" prepend-icon="mdi-plus" @click="handleAddAllowance">
                Listeye Ekle
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div class="text-subtitle-1 font-weight-bold mb-2 text-grey-darken-3">Personele Tanımlı Güncel Haklar</div>
          <v-table class="border rounded" density="comfortable">
            <thead>
              <tr class="bg-grey-lighten-3">
                <th class="text-left">Yardım Adı</th>
                <th class="text-center">Tutar</th>
                <th class="text-center">Sıklık</th>
                <th class="text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in allowanceList" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-center font-weight-bold text-success">{{ item.amount }} ₺</td>
                <td class="text-center">
                  <!-- Arka plandan gelen periodType tipine göre renkli çiplerle gösterim -->
                  <v-chip v-if="item.periodType === 'RECURRING'" color="teal" size="x-small">Yinelenen</v-chip>
                  <v-chip v-else-if="item.periodType === 'ONEOFF'" color="blue" size="x-small">Tek Seferlik</v-chip>
                  <v-chip v-else color="orange-darken-3" size="x-small">Yıllık</v-chip>
                </td>
                <td class="text-right">
                  <v-btn icon="mdi-trash-can-outline" size="small" variant="text" color="red" @click="handleDeleteAllowance(item.id)"></v-btn>
                </td>
              </tr>
              <tr v-if="allowanceList.length === 0">
                <td colspan="4" class="text-center text-grey py-4">Bu çalışana ait girilmiş bir ödeme kaydı bulunamadı.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions class="px-4 pb-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="outlined" @click="allowanceDialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🧙‍♂️ DİYALOG: TOPLU YAN HAK SOSYAL YARDIM DAĞITIM SİHİRBAZI -->
    <v-dialog v-model="bulkAllowanceDialog" max-width="750px" persistent>
      <v-card>
        <v-card-title class="bg-purple-darken-3 text-white d-flex justify-between align-center">
          <span>Toplu Sosyal Yardım Dağıtım Sihirbazı</span>
          <v-spacer></v-spacer>
          <v-chip color="white" class="text-purple-darken-4 font-weight-bold" size="small">
            Adım {{ currentStep }} / 2
          </v-chip>
        </v-card-title>

        <v-window v-model="currentStep">
          <!-- 1. ADIM: Hedef Kapsam, Çakışma ve Hak Detayı Seçimi -->
          <v-window-item :value="1">
            <v-card-text class="pt-4">
              <div class="text-subtitle-2 font-weight-bold mb-1">1. Hedef Kapsamı Seçin</div>
              <v-card variant="outlined" class="pa-3 mb-4">
                <v-radio-group v-model="bulkTargetType" inline hide-details>
                  <v-radio label="Tüm Aktif Çalışanlar" value="ALL" color="purple"></v-radio>
                  <v-radio label="Belirli Bir Departman" value="DEPARTMENT" color="purple"></v-radio>
                </v-radio-group>
                <v-select v-if="bulkTargetType === 'DEPARTMENT'" v-model="bulkDepartmentId" :items="departments" item-title="name" item-value="id" label="Hedef Departman" variant="outlined" density="compact" class="mt-3" hide-details></v-select>
              </v-card>

              <div class="text-subtitle-2 font-weight-bold mb-1">2. Çakışma Politikası</div>
              <v-card variant="outlined" class="pa-3 mb-4">
                <v-radio-group v-model="bulkConflictPolicy" inline hide-details>
                  <v-radio label="Mevcutları Koru" value="SKIP" color="indigo"></v-radio>
                  <v-radio label="Üzerine Yaz" value="OVERWRITE" color="orange"></v-radio>
                </v-radio-group>
              </v-card>

              <div class="text-subtitle-2 font-weight-bold mb-2">3. Dağıtılacak Yardım Türü ve Tutarı</div>
              <v-card variant="outlined" class="pa-3">
                <v-row dense class="align-center">
                  <v-col cols="12" sm="4">
                    <v-select v-model="wizardAllowance.selectedTypeId" :items="singleAllowanceOptions" item-title="label" item-value="id" label="Yardım Türü" variant="outlined" density="compact" hide-details></v-select>
                    <v-text-field v-if="wizardAllowance.selectedTypeId === 'CUSTOM'" v-model="wizardAllowance.customName" placeholder="Özel Yardım Adı" variant="outlined" density="compact" hide-details class="mt-2"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field v-model="wizardAllowance.amount" type="number" label="Dağıtılacak Tutar" variant="outlined" density="compact" hide-details suffix="₺"></v-text-field>
                  </v-col>
                  
                  <!-- 🛠️ NOT 2: DEĞİŞTİRİLEN KRİTİK ALAN! 
                       Eski tasarımdaki kurumsal mimariye uymayan 'MONTHLY' (Aylık) ve 'YEARLY' (Yıllık) seçenekleri kaldırıldı.
                       Arka plandaki `RECURRING`, `ONEOFF`, `ANNUAL` anahtarlarıyla tam mutabakat sağlandı. -->
                  <v-col cols="12" sm="4">
                    <v-select 
                      v-model="wizardAllowance.periodType" 
                      :items="[
                        { id: 'RECURRING', name: 'Her Ay Düzenli (Yinelenen)' },
                        { id: 'ONEOFF', name: 'Sadece Bu Ay (Tek Seferlik)' },
                        { id: 'ANNUAL', name: 'Yılda 1 Kez (Yıllık)' }
                      ]" 
                      item-title="name" 
                      item-value="id" 
                      label="Ödeme Sıklığı" 
                      variant="outlined" 
                      density="compact" 
                      hide-details
                    ></v-select>
                  </v-col>
                </v-row>
              </v-card>
            </v-card-text>
            <v-card-actions class="px-6 pb-4">
              <v-btn color="grey-darken-1" variant="text" @click="bulkAllowanceDialog = false">İptal</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="purple-darken-3" variant="flat" append-icon="mdi-arrow-right" @click="goToStepTwo">İleri</v-btn>
            </v-card-actions>
          </v-window-item>

          <!-- 2. ADIM: Personel Filtreleme ve Dağıtımı Tamamlama -->
          <v-window-item :value="2">
            <v-card-text class="pt-4">
              <div class="d-flex flex-wrap gap-2 mb-3 justify-between align-center">
                <div class="d-flex gap-1">
                  <v-btn size="small" variant="outlined" color="grey-darken-2" @click="selectAllWizardEmployees(true)">Tümünü Seç</v-btn>
                  <v-btn size="small" variant="outlined" color="grey-darken-2" @click="selectAllWizardEmployees(false)">Temizle</v-btn>
                </div>
                <!-- Akıllı Filtreleme Butonu: Bu hakkı henüz almamış kişileri yakalar -->
                <v-btn size="small" variant="flat" color="indigo-darken-2" prepend-icon="mdi-auto-fix" @click="selectWhoDoesNotHaveThisAllowance">Eksikleri Seç</v-btn>
              </div>
              <v-text-field v-model="wizardSearchQuery" prepend-inner-icon="mdi-magnify" label="Personel ara..." variant="outlined" density="compact" class="mb-3" hide-details></v-text-field>
              
              <div class="border rounded overflow-y-auto" style="max-height: 250px;">
                <v-table density="comfortable">
                  <tbody>
                    <tr v-for="emp in filteredWizardEmployees" :key="emp.id">
                      <td><v-checkbox v-model="emp.checked" color="purple" hide-details density="compact"></v-checkbox></td>
                      <td>
                        <div class="font-weight-bold text-body-2">{{ emp.firstName }} {{ emp.lastName }}</div>
                        <div class="text-caption text-grey">{{ emp.title }}</div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card-text>
            <v-card-actions class="px-6 pb-4">
              <v-btn color="grey-darken-1" variant="outlined" @click="currentStep = 1">Geri</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="success" variant="flat" :loading="bulkSubmitLoading" @click="handleBulkAllowanceSubmit">Dağıtımı Tamamla</v-btn>
            </v-card-actions>
          </v-window-item>
        </v-window>
      </v-card>
    </v-dialog>

    <!-- ⚠️ DİYALOG: İŞ AKDİ FESİH ONAY PANELİ -->
    <v-dialog v-model="terminateDialog" max-width="450px">
      <v-card>
        <v-card-title class="bg-orange-darken-3 text-white">İş Akdi Sonlandırma</v-card-title>
        <v-card-text class="pt-4">
          <p><strong>{{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}</strong> iş sözleşmesini feshetmek üzeresiniz.</p>
          <v-text-field v-model="terminationDateInput" type="date" label="Ayrılış Tarihi" variant="outlined" density="compact" class="mt-2"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="terminateDialog = false">İptal</v-btn>
          <v-btn color="orange-darken-3" variant="flat" @click="handleTerminate">Sözleşmeyi Feshet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🚨 DİYALOG: SİSTEMDEN KALICI SİLME ONAY PANELİ -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-red text-white">Kayıt Silinsin mi?</v-card-title>
        <v-card-text class="pt-4"><strong>{{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}</strong> kalıcı olarak silinecektir.</v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn variant="text" @click="deleteDialog = false">Vazgeç</v-btn><v-btn color="error" variant="flat" @click="handleDelete">Sil</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 🔔 ANLIK BİLDİRİM (TOAST) SİSTEMİ -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">{{ snackbar.text }}</v-snackbar>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue' // 🛠️ YENİ GÜNCELLEME: watch fonksiyonu Vue'dan import edildi.

// 📡 API Haberleşme Katmanı: composable içinden CRUD (Ekle, Oku, Güncelle, Sil) fonksiyonlarını çekiyoruz.
const { getEmployees, createEmployee, updateEmployee, deleteEmployee, getDepartments } = useApi()

// 📊 Reaktif Değişkenler (State Yönetimi)
const employees = ref([])          // Sistemdeki tüm personellerin listesi
const departments = ref([])        // Şirket içi departman listesi
const dialog = ref(false)          // Yeni personel ekleme / düzenle modal penceresi kontrolü
const deleteDialog = ref(false)    // Personel silme onay penceresi kontrolü
const terminateDialog = ref(false) // İşten çıkış işlemlerinin yapıldığı pencere kontrolü
const tableLoading = ref(false)     // Ana personel tablosunun yükleniyor animasyonu state'i
const submitLoading = ref(false)    // Form gönderilirken buton kilitleme state'i
const isFormValid = ref(false)      // Vuetify formunun validasyon (doğruluk) kontrolü
const formRef = ref(null)          // Form elementine erişmek için kullanılan referans

const isEditMode = ref(false)      // Modal penceresinin "Ekleme" mi "Düzenleme" modunda mı olduğunu belirler
const selectedEmployee = ref(null) // İşlem yapılan (silinen, düzenlenen, hak eklenen) seçili personel nesnesi
// İşten çıkış tarihi girdisi için varsayılan olarak bugünün tarihini ISO formatında (YYYY-MM-DD) alıyoruz.
const terminationDateInput = ref(new Date().toISOString().substring(0, 10))

// 🎁 Yan Haklar (Allowance) State Yönetimi
const allowanceDialog = ref(false)           // Tekli yan hak yönetim penceresinin açık/kapalı durumu
const selectedEmployeeForAllowance = ref(null) // Yan hakları düzenlenen aktif personel
const allowanceList = ref([])                // Seçili personelin veritabanında kayıtlı mevcut yan hakları
const allowanceLoading = ref(false)          // Yan haklar listelenirken dönen yükleniyor animasyonu

// 📈 Operasyonel Üst Özet Kartları State'i
const stats = ref({ activeStaffCount: 0, totalMonthlyBudget: 0, missingAllowanceCount: 0 })
const selectedMissingAllowanceTrack = ref('Yemek Kartı / Ödeneği') // Eksik hak takibinde varsayılan seçili kategori

// 🛠️ YENİ EKLENEN ADIM: Bütçe filtresi için reactive state (Varsayılan olarak 'ALL' yani tüm yan haklar gelir)
const selectedBudgetAllowance = ref('ALL')

// 🛠️ YENİ EKLENEN ADIM: Üst özet bütçe kartının dropdown menüsünde görünecek filtre seçenekleri
const budgetAllowanceOptions = ref([
  { title: 'Tüm Yan Haklar', value: 'ALL' },
  { title: 'Yemek Kartı / Ödeneği', value: 'Yemek Kartı / Ödeneği' },
  { title: 'Yol / Ulaşım Yardımı', value: 'Yol / Ulaşım Yardımı' },
  { title: 'Özel Sağlık Sigortası', value: 'Özel Sağlık Sigortası' }
])

// 🎛️ Gelişmiş Çoklu Format Sürükle-Bırak (Excel / CSV) State'leri
const bulkImportDialog = ref(false)    // Toplu personel yükleme modalı
const selectedImportFile = ref(null)   // Sürüklenen veya seçilen dosya nesnesi
const fileInputRef = ref(null)         // Gizli input[type="file"] elementine tıklama tetikleyicisi
const isDragging = ref(false)          // Kullanıcı dosyayı drop-zone üzerinde tutarken tetiklenen görsel efekt durumu
const importLoading = ref(false)       // Dosya işlenirken ve backend'e yüklenirken çalışan yükleniyor durumu
const importSummary = ref(null)        // Başarılı yükleme sonrası ekrana basılan özet rapor (Kaç kişi eklendi vb.)
const importErrors = ref([])           // Yükleme sırasında hata alan satırların listesi

// 🏷️ Yan Hak Seçenekleri Sabit Listesi (Açılır Menüde Görünecek İsimler)
const singleAllowanceOptions = [
  { id: 'YEMEK', label: 'Yemek Kartı / Ödeneği' },
  { id: 'YOL', label: 'Yol / Ulaşım Yardımı' },
  { id: 'YAKACAK', label: 'Yakacak Desteği' },
  { id: 'SAGLIK', label: 'Özel Sağlık Sigortası' },
  { id: 'ILETISIM', label: 'İletişim / İnternet Desteği' },
  { id: 'CUSTOM', label: 'Diğer (Özel)' }
]

// 🛠️ MÜTABAKAT SAĞLANAN YENİ İK YAPISI (TEKLİ FORM):
// Kullanıcı karmaşasını çözmek için form ilk açıldığında periodType varsayılan olarak 'RECURRING' gelir.
const allowanceForm = ref({ 
  selectedTypeId: 'YEMEK', 
  amount: '', 
  periodType: 'RECURRING' // 'RECURRING' (Yinelenen), 'ONEOFF' (Tek Seferlik), 'ANNUAL' (Yıllık)
})

// 👥 Toplu Sosyal Yardım Dağıtım Sihirbazı State'leri
const bulkAllowanceDialog = ref(false)     // Toplu yan hak dağıtım sihirbazı kontrolü
const bulkSubmitLoading = ref(false)        // Toplu dağıtım onaylandığında çalışan yükleme durumu
const currentStep = ref(1)                  // Sihirbazın aktif adımı (1: Kapsam ve Hak Seçimi, 2: Personel Listesi)
const bulkTargetType = ref('ALL')           // Dağıtım kapsamı ('ALL': Tüm Şirket, 'DEPARTMENT': Sadece Seçili Departman)
const bulkDepartmentId = ref(null)          // Eğer departman seçildiyse ilgili departmanın ID'si
const bulkConflictPolicy = ref('SKIP')       // Çakışma politikası ('SKIP': Zaten bu hakkı olanı atla, 'OVERWRITE': Üzerine yaz)
const wizardSearchQuery = ref('')           // Sihirbaz içi personel arama filtresi

// 🛠️ MÜTABAKAT SAĞLANAN YENİ İK YAPISI (SİHİRBAZ):
// Toplu dağıtım sihirbazındaki ödeme sıklığı yapısını da yeni kurumsal standart modelimiz ile eşitledik.
const wizardAllowance = ref({ selectedTypeId: 'YEMEK', customName: '', amount: '', periodType: 'RECURRING' })
const wizardEmployees = ref([])             // Sihirbazın 2. adımında listelenen filtrelenmiş aktif çalışanlar
const wizardEmployeesLoading = ref(false)   // Sihirbaz çalışanı listesi yüklenirken dönen animasyon durumu

// 📝 Standart Personel Form Veri Yapısı (İlk Değerler)
const form = ref({ firstName: '', lastName: '', email: '', phone: '', departmentId: null, title: 'Uzman', employmentType: 'FULL_TIME', iban: '', hireDate: new Date().toISOString().substring(0, 10), status: 'ACTIVE' })
const snackbar = ref({ show: false, text: '', color: '' }) // Kullanıcıya gösterilen anlık bildirim (toast) yapısı
const searchQuery = ref('')                     // Ana ekrandaki arama çubuğu girdisi
const selectedDeptFilter = ref('ALL')           // Ana ekrandaki departman filtresi

// 📋 Ana Personel Veri Tablosu Başlık Tanımları
const headers = [
  { title: 'Ad Soyad / Unvan', key: 'fullName', align: 'start' },
  { title: 'E-posta', key: 'email', align: 'start' },
  { title: 'Departman', key: 'departmentName', align: 'center' },
  { title: 'İstihdam Türü', key: 'employmentType', align: 'center' },
  { title: 'Giriş Tarihi', key: 'hireDate', align: 'center' },
  { title: 'Durum', key: 'status', align: 'center' },
  { title: 'İşlemler', key: 'actions', align: 'end', sortable: false }
]

// 🔐 Form Doğrulama (Validation) Kuralları
const requiredRule = [v => !!v || 'Zorunlu!']
const emailRules = [v => !!v || 'Gerekli!', v => /.+@.+\..+/.test(v) || 'Geçersiz e-posta!']
const phoneRules = [v => !v || v.length === 11 || '11 hane!']
const ibanRules = [v => !v || v.length === 26 || '26 karakter!']

// 👔 İstihdam Türü Eşleştirme Listesi
const employmentTypes = [
  { id: 'FULL_TIME', name: 'Tam Zamanlı' },
  { id: 'CONTRACT', name: 'Sözleşmeli' },
  { id: 'PART_TIME', name: 'Yarı Zamanlı' },
  { id: 'INTERN', name: 'Stajyer' }
]

// 🔄 Yardımcı Metot: İstihdam tipinin ID'sini (Örn: FULL_TIME) İK'cının okuyabileceği Türkçe metne dönüştürür.
const getEmpTypeName = (type) => employmentTypes.find(t => t.id === type)?.name || type

// 🔍 Arama ve Departman Filtresine Göre Personel Listesini Süzme (Computed)
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase()
    const search = searchQuery.value.toLowerCase()
    // Hem isim/unvan eşleşmesini hem de seçili departman filtresini aynı anda kontrol eder
    return (fullName.includes(search) || (emp.title || '').toLowerCase().includes(search)) && (selectedDeptFilter.value === 'ALL' || emp.departmentId === selectedDeptFilter.value)
  })
})

// 🧙‍♂️ Sihirbaz İçi Personel Arama Filtresi (Computed)
const filteredWizardEmployees = computed(() => {
  return wizardEmployees.value.filter(emp => `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(wizardSearchQuery.value.toLowerCase()))
})

// 📈 Üst Özet Kartları Verilerini Backend'den Çeken Fonksiyon
// 🛠️ YENİ GÜNCELLEME: Backend'e iki farklı dropdown filtresini birden gönderecek şekilde params alanı güncellendi.
const loadStats = async () => {
  try {
    const res = await $fetch('/api/allowances/stats', { 
      params: { 
        targetAllowanceName: selectedMissingAllowanceTrack.value,       // Eksik hak takibi kategorisi
        targetBudgetAllowanceName: selectedBudgetAllowance.value     // 🛠️ YENİ EKLENEN ADIM: Bütçe filtresi parametresi
      } 
    })
    if (res && res.success) stats.value = res.stats
  } catch (err) { console.error(err) }
}

// 🔄 Eksik hak takip dropdown seçeneği değiştiğinde istatistikleri otomatik olarak yeniden hesaplatır.
const onMissingTrackChange = () => { loadStats() }

// 🛠️ YENİ EKLENEN ADIM: Bütçe filtresi dropdown seçeneği her değiştiğinde üst kart verilerini anlık günceller.
watch(selectedBudgetAllowance, () => {
  loadStats()
})

// 🚀 Sayfa İlk Açıldığında veya Yenilendiğinde Tüm Verileri Başlatan Ana Fonksiyon
const loadPageData = async () => {
  tableLoading.value = true
  try {
    // Personel listesini, departmanları ve üst bütçe istatistiklerini eşzamanlı (Parallel Promise) çeker.
    const [empData, deptData] = await Promise.all([getEmployees(), getDepartments()])
    employees.value = empData
    departments.value = deptData
    await loadStats() // Matematik modeline göre bütçe yükünü tazeleyen tetikleyici
  } catch { 
    showNotify('Hata oluştu.', 'error') 
  } finally { 
    tableLoading.value = false 
  }
}

// 🎛️ SÜRÜKLE BIRAK EXCEL/CSV PARSER PANEL TETİKLEYİCİLERİ
const openBulkImportDialog = () => {
  bulkImportDialog.value = true; selectedImportFile.value = null; importSummary.value = null; importErrors.value = []
}
const closeBulkImportDialog = () => { bulkImportDialog.value = false }
const triggerFileSelect = () => { if (fileInputRef.value) fileInputRef.value.click() }
const clearSelectedFile = () => { selectedImportFile.value = null; importSummary.value = null; importErrors.value = [] }

// Dosya seçme penceresinden dosya seçildiğinde tetiklenir
const handleFileSelectChange = (e) => {
  const files = e.target.files
  if (files && files[0]) selectedImportFile.value = files[0]
}

// Sürüklenen dosya drop-zone alanına bırakıldığında tetiklenen akıllı format doğrulayıcı
const handleFileDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files && files[0]) {
    const file = files[0]
    const ext = file.name.split('.').pop().toLowerCase()
    // Sadece geçerli kurumsal veri formatlarını kabul et, aksi halde uyar
    if (['csv', 'xlsx', 'xls'].includes(ext)) {
      selectedImportFile.value = file
    } else {
      showNotify('Desteklenmeyen dosya formatı! Lütfen Excel veya CSV yükleyin.', 'error')
    }
  }
}

// 🚀 EVRENSEL EXCEL VE CSV ÇÖZÜMLEYİCİ MOTORU
const handleBulkImportSubmit = async () => {
  if (!selectedImportFile.value) return
  importLoading.value = true
  importSummary.value = null
  importErrors.value = []

  try {
    const file = selectedImportFile.value
    let textContent = ""

    // Eğer yüklenen dosya ham Excel binary formatındaysa metin bloklarını güvenli oku
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const buffer = await file.arrayBuffer()
      const arr = new Uint8Array(buffer)
      // Excel şablonundaki string (karakter) havuzunu çözümleyen hafif decode işlemi
      let rawString = ""
      for (let i = 0; i < arr.length; i++) {
        // Okunabilir ASCII ve genişletilmiş karakter alanlarını süzüyoruz
        if ((arr[i] >= 32 && arr[i] <= 126) || arr[i] === 10 || arr[i] === 13 || arr[i] >= 128) {
          rawString += String.fromCharCode(arr[i])
        }
      }
      textContent = rawString
    } else {
      // Standart CSV ise doğrudan oku
      textContent = await file.text()
    }
    
    // Satır ayrıştırma (Excel alt satır karakter varyasyonlarını eşitle)
    const lines = textContent.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0)
    
    // Anlamlı veri satırlarını süz (içinde e-posta işareti geçen kurumsal datayı yakala)
    const validDataLines = lines.filter((line, idx) => idx === 0 || line.includes('@') || line.split(',').length >= 3)

    if (validDataLines.length <= 1) {
      showNotify('Dosya içeriği okunamadı veya yapısal olarak geçersiz.', 'error')
      importLoading.value = false
      return
    }

    const jsonParsedEmployees = []

    for (let i = 1; i < validDataLines.length; i++) {
      // Excel/CSV hücre ayırıcı varyasyonlarını (virgül veya noktalı virgül) normalize et
      const currentline = validDataLines[i].split(/[,;]/)
      if (currentline.length < 3) continue 

      jsonParsedEmployees.push({
        firstName: currentline[0]?.replace(/["']/g, '').trim() || '',
        lastName: currentline[1]?.replace(/["']/g, '').trim() || '',
        email: currentline[2]?.replace(/["']/g, '').trim() || '',
        phone: currentline[3]?.replace(/["']/g, '').trim() || '',
        title: currentline[4]?.replace(/["']/g, '').trim() || 'Uzman',
        employmentType: currentline[5]?.replace(/["']/g, '').trim() || 'FULL_TIME',
        hireDate: currentline[6]?.replace(/["']/g, '').trim() || new Date().toISOString().substring(0, 10),
        iban: currentline[7]?.replace(/["']/g, '').trim() || ''
      })
    }

    // Backend endpoint'e güvenli transfer
    const response = await $fetch('/api/employees/bulk-import', {
      method: 'POST',
      body: { employees: jsonParsedEmployees }
    })

    if (response && response.success) {
      importSummary.value = response.summary
      importErrors.value = response.failedRows || []
      showNotify(`Yükleme tamamlandı. ${response.summary.successCount} personel eklendi.`, 'success')
      await loadPageData()
    }
  } catch (error) {
    showNotify('Dosya formatı analiz edilirken teknik hata oluştu.', 'error')
  } finally {
    importLoading.value = false
  }
}

// 🎁 BAĞIMSIZ TEKLİ YAN HAK METOTLARI
// Personel satırındaki hediye paketine tıklandığında personelin geçmiş haklarını çeken metot
const openAllowanceDialog = async (employee) => {
  selectedEmployeeForAllowance.value = employee
  allowanceDialog.value = true
  allowanceList.value = []
  allowanceLoading.value = true
  try { 
    allowanceList.value = await $fetch('/api/allowances', { params: { employeeId: employee.id } }) 
  } catch { 
    showNotify('Mevcut yan haklar çekilemedi.', 'error')
  } finally { 
    allowanceLoading.value = false 
  }
}

// 🛠️ MÜTABAKAT SAĞLANAN YENİ HAK EKLEME MOTORU:
// "Listeye Ekle" butonuna basıldığında girilen tutarı ve seçilen 3 net İK kuralından birini backend'e gönderir.
const handleAddAllowance = async () => {
  // Seçilen yardım tipinin Türkçe adını buluyoruz (Örn: Yemek Kartı)
  const label = singleAllowanceOptions.find(o => o.id === allowanceForm.value.selectedTypeId)?.label
  let name = allowanceForm.value.selectedTypeId === 'CUSTOM' ? allowanceForm.value.customName : label
  
  // Güvenlik Duvarı: İsim veya tutar girilmediyse işlemi durdurur
  if (!name || !allowanceForm.value.amount) return
  
  try {
    // MÜKERRER KAYIT KONTROLÜ: Aynı isme ve aynı ödeme sıklığına sahip eski bir kayıt var mı?
    const has = allowanceList.value.find(i => i.name.toLowerCase() === name.toLowerCase() && i.periodType === allowanceForm.value.periodType)
    
    if (has) {
      // Eğer varsa sıfırdan eklemek yerine mevcut olan kaydın tutarını günceller (PUT)
      const res = await $fetch(`/api/allowances/update/${has.id}`, { 
        method: 'PUT', 
        body: { amount: Number(allowanceForm.value.amount), periodType: allowanceForm.value.periodType } 
      })
      const idx = allowanceList.value.findIndex(i => i.id === has.id)
      if (idx !== -1) allowanceList.value[idx] = res
    } else {
      // Eğer bu isimde ve bu sıklıkta ilk defa hak tanımlanıyorsa yeni kayıt açar (POST)
      const res = await $fetch('/api/allowances/create', { 
        method: 'POST', 
        body: { 
          employeeId: selectedEmployeeForAllowance.value.id, 
          name, 
          amount: Number(allowanceForm.value.amount), 
          periodType: allowanceForm.value.periodType // Arka plana kurumsal 'RECURRING', 'ONEOFF' veya 'ANNUAL' kelimesi gider
        } 
      })
      allowanceList.value.unshift(res) // Yeni eklenen hakkı anlık olarak tablonun en üstüne yerleştirir
    }
    
    // 🛠️ Formu temizlerken sıklık değerini yine varsayılan mutabık kaldığımız kurumsal modelimiz olan 'RECURRING'e sıfırlarız.
    allowanceForm.value = { selectedTypeId: 'YEMEK', customName: '', amount: '', periodType: 'RECURRING' }
    
    // Üst bütçe özet kartlarının matematiğini anlık olarak yeniden hesaplatır
    await loadStats()
    showNotify('Ödeme tanımı başarıyla bütçeye işlendi.', 'success')
  } catch { 
    showNotify('İşlem sırasında teknik bir hata oluştu.', 'error')
  }
}

// Seçili yan hakkı sistemden kalıcı olarak kaldıran ve bütçeyi tazeleyen fonksiyon
const handleDeleteAllowance = async (id) => {
  try { 
    await $fetch('/api/allowances/delete', { method: 'DELETE', params: { id } })
    allowanceList.value = allowanceList.value.filter(i => i.id !== id) // Arayüzden anlık olarak satırı kaldırır
    await loadStats() // Bütçeden hakkı düşürür ve üst kartı günceller
    showNotify('Yan hak iptal edildi.', 'success')
  } catch {}
}

// Yan hak penceresi kapatıldığında bütçeyi son bir kez güvenli check etmek için tetikleyici
const closeDialogAfterSingleAllowance = async () => { allowanceDialog.value = false; await loadStats() }

// 👥 TOPLU SOSYAL YARDIM DAĞITIM SİHİRBAZI METOTLARI
const openBulkAllowanceDialog = () => { bulkAllowanceDialog.value = true; currentStep.value = 1; bulkTargetType.value = 'ALL'; wizardEmployees.value = [] }

// Sihirbazda 2. adıma (Personel Seçim Ekranı) geçilirken çalışan akıllı filtreleme motoru
const goToStepTwo = async () => {
  currentStep.value = 2
  wizardEmployeesLoading.value = true
  try {
    // Sadece durumu aktif olan ve seçilen departmanda (eğer tümü seçilmediyse) çalışan personelleri listeler
    const flt = employees.value.filter(e => e.status === 'ACTIVE' && (bulkTargetType.value === 'DEPARTMENT' ? e.departmentId === bulkDepartmentId.value : true))
    
    // Listelenen her çalışanın mevcut haklarını arka planda çekerek onay listesini hazır hale getirir
    wizardEmployees.value = await Promise.all(flt.map(async e => ({ 
      ...e, 
      checked: false, 
      currentAllowances: await $fetch('/api/allowances', { params: { employeeId: e.id } }) || [] 
    })))
  } catch { } finally { wizardEmployeesLoading.value = false }
}

// Tüm personelleri tek tıkla seçme veya seçimi kaldırma fonksiyonu
const selectAllWizardEmployees = (st) => wizardEmployees.value.forEach(e => e.checked = st)

// Akıllı Filtre Butonu: "Şu ana kadar bu yardımı almayan kişileri otomatik seç" mekanizması
const selectWhoDoesNotHaveThisAllowance = () => {
  const lbl = singleAllowanceOptions.find(o => o.id === wizardAllowance.value.selectedTypeId)?.label
  const name = wizardAllowance.value.selectedTypeId === 'CUSTOM' ? wizardAllowance.value.customName.trim().toLowerCase() : lbl?.trim().toLowerCase()
  let c = 0
  
  wizardEmployees.value.forEach(e => { 
    // Aynı isimde ve aynı ödeme sıklığında hakkı olmayanları tespit eder
    const h = e.currentAllowances.some(a => a.name.toLowerCase() === name && a.periodType === wizardAllowance.value.periodType)
    e.checked = !h // Hakkı yoksa tik atar, varsa tiki kaldırır
    if(!h) c++ 
  })
  showNotify(`${c} yeni personel otomatik olarak seçildi.`, 'success')
}

// Sihirbazı onaylayıp toplu paketi backend'e tek seferde (Bulk) gönderen fonksiyon
const handleBulkAllowanceSubmit = async () => {
  bulkSubmitLoading.value = true
  try {
    const name = wizardAllowance.value.selectedTypeId === 'CUSTOM' ? wizardAllowance.value.customName : singleAllowanceOptions.find(o => o.id === wizardAllowance.value.selectedTypeId)?.label
    
    await $fetch('/api/allowances/bulk', { 
      method: 'POST', 
      body: { 
        targetType: 'CUSTOM_LIST', 
        conflictPolicy: bulkConflictPolicy.value, 
        // Seçtiğimiz yeni kurumsal kuralları toplu paketin içerisine gömüyoruz
        allowances: [{ name, amount: Number(wizardAllowance.value.amount), periodType: wizardAllowance.value.periodType }], 
        customEmployeeIds: wizardEmployees.value.filter(e => e.checked).map(s => s.id) // Sadece tik atılan personellerin ID'leri gider
      } 
    })
    bulkAllowanceDialog.value = false
    await loadPageData() // Tüm sayfayı ve bütçeleri baştan aşağı tazelemek için ana tetikleyici
  } catch {} finally { bulkSubmitLoading.value = false }
}

// 📝 STANDART ÖZLÜK VE PERSONEL KART YÖNETİM METOTLARI
const openCreateDialog = () => { isEditMode.value = false; form.value = { firstName: '', lastName: '', email: '', phone: '', departmentId: null, title: 'Uzman', employmentType: 'FULL_TIME', iban: '', hireDate: new Date().toISOString().substring(0, 10), status: 'ACTIVE' }; dialog.value = true }
const openEditDialog = (item) => { isEditMode.value = true; selectedEmployee.value = item; form.value = { ...item, hireDate: item.hireDate?.substring(0, 10) }; dialog.value = true }
const openDeleteDialog = (item) => { selectedEmployee.value = item; deleteDialog.value = true }
const openTerminateDialog = (item) => { selectedEmployee.value = item; terminationDateInput.value = new Date().toISOString().substring(0, 10); terminateDialog.value = true }

// Personeli işten çıkarma simülasyonu (Durumunu TERMINATED yapar ve çıkış tarihini kaydeder)
const handleTerminate = async () => { try { await updateEmployee(selectedEmployee.value.id, { ...selectedEmployee.value, status: 'TERMINATED', terminationDate: new Date(terminationDateInput.value) }); terminateDialog.value = false; await loadPageData() } catch {} }
// Yeni personel kaydetme veya mevcut personel kartını güncelleme kararı veren ana form fonksiyonu
const handleSubmit = async () => { try { if (isEditMode.value) await updateEmployee(selectedEmployee.value.id, form.value); else await createEmployee(form.value); await loadPageData(); closeDialog() } catch {} }
// Personeli sistemden tamamen silen fonksiyon
const handleDelete = async () => { try { await deleteEmployee(selectedEmployee.value.id); deleteDialog.value = false; await loadPageData() } catch {} }

// Form kapatıldığında içerideki girdileri temizleyen fonksiyon
const closeDialog = () => { dialog.value = false; if (formRef.value) formRef.value.reset() }

// 🔧 TARİH VE PARA BİÇİMLENDİRİCİLER (FORMATTERS)
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('tr-TR') : '-'
const formatMoney = (v) => v ? Number(v).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '0'

// Ortak snackbar/toast bildirim penceresini ayağa kaldıran fonksiyon
const showNotify = (text, color) => { snackbar.value = { show: true, text, color: color === 'success' ? 'success' : 'error' } }

// DOM Yüklendiğinde İlk Tetiklenen Kanca (Hook)
onMounted(() => { loadPageData() })
</script>