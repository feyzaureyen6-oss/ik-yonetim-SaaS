<template>
  <div class="pa-4 bg-grey-lighten-4">
    <v-row class="mb-2" align="center" justify="space-between">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold text-indigo-darken-3">Maaş & Bordrolama Yönetimi</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Geçmiş maaşları dönemlerine göre süzebilir, yasal kesintileri ve şirket maliyetlerini inceleyebilirsiniz.</p>
      </v-col>
      
      <v-col cols="12" md="6" class="d-flex justify-md-end align-center gap-2 flex-wrap">
        <v-btn color="grey-darken-3" variant="outlined" prepend-icon="mdi-content-copy" @click="copyPreviousMonth">
         Geçen Ayı Kopyala
        </v-btn>
        
        <v-btn color="indigo-darken-2" prepend-icon="mdi-calculator" @click="openCreateDialog">
          Yeni Maaş Hesapla
        </v-btn>
        <v-btn 
  color="success" 
  @click="openBulkPayDialog"
  :disabled="selectedItems.length === 0"
>
  Toplu Ödeme Yap ({{ selectedItems.length }} Seçili)
</v-btn>

<v-dialog v-model="bulkPayDialog" max-width="800">
  <v-card>
    <v-card-title>Toplu Ödeme Önizleme</v-card-title>
    <v-card-text>
      <p class="mb-4">Seçili <b>{{ selectedItems.length }}</b> personelin ödeme listesi:</p>
      
      <v-table density="compact" border>
        <thead>
          <tr>
            <th>Personel</th>
            <th>IBAN</th>
            <th>Net Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedItems" :key="item.id">
            <td>{{ item.employee?.firstName }} {{ item.employee?.lastName }}</td>
            <td>{{ item.employee?.iban }}</td>
            <td>{{ item.netSalary }} TL</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    
    <v-card-actions>
  <v-spacer />
  <v-btn color="secondary" variant="outlined" @click="downloadBankFile">Banka Ödeme Listesini İndir (Excel)</v-btn>
  <v-btn color="success" variant="flat" @click="processPayment">Ödemeyi Onayla</v-btn>
  <v-btn color="grey" @click="bulkPayDialog = false">Kapat</v-btn>
</v-card-actions>
  </v-card>
</v-dialog>
      </v-col>
    </v-row>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="3">
        <v-card color="indigo-lighten-5" class="py-2 px-3 border-start border-xl border-indigo-darken-3" elevation="1" height="105">
          <div class="d-flex align-center justify-space-between h-100">
            <div>
              <div class="text-caption text-indigo-darken-3 font-weight-medium">BORDROLU PERSONEL</div>
              <div class="text-h4 font-weight-bold text-indigo-darken-4 mt-1">
                {{ filteredPayrolls.length }} <span class="text-subtitle-2 font-weight-regular text-grey-darken-2">Kişi</span>
              </div>
            </div>
            <v-icon size="40" color="indigo-darken-2" class="opacity-60">mdi-account-card-details</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="3">
        <v-card color="purple-lighten-5" class="py-2 px-3 border-start border-xl border-purple-darken-3" elevation="1" height="105">
          <div class="d-flex align-center justify-space-between h-100">
            <div>
              <div class="text-caption text-purple-darken-3 font-weight-medium">TOPLAM NET ÖDEME</div>
              <div class="text-h5 font-weight-bold text-purple-darken-4 mt-1">
                {{ formatMoney(totalNetPayment) }}
              </div>
            </div>
            <v-icon size="36" color="purple-darken-2" class="opacity-60">mdi-cash-multiple</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="3">
        <v-card color="deep-orange-lighten-5" class="py-2 px-3 border-start border-xl border-deep-orange-darken-4" elevation="1" height="105">
          <div class="d-flex align-center justify-space-between h-100">
            <div>
              <div class="text-caption text-deep-orange-darken-4 font-weight-medium">TOPLAM ŞİRKET MALİYETİ</div>
              <div class="text-h5 font-weight-bold text-deep-orange-darken-4 mt-1">
                {{ formatMoney(totalEmployerCostSum) }}
              </div>
            </div>
            <v-icon size="36" color="deep-orange-darken-2" class="opacity-60">mdi-trending-up</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="3">
  <v-card 
    :color="statusFilter === 'Onay Bekleyenler' ? 'amber-lighten-5' : 'green-lighten-5'" 
    :class="['py-2', 'px-3', 'border-start', 'border-xl', statusFilter === 'Onay Bekleyenler' ? 'border-amber-darken-4' : 'border-green-darken-4']" 
    elevation="1" 
    height="105"
  >
    <div class="d-flex align-center justify-space-between h-100">
      <div style="flex-grow: 1; max-width: 85%;">
        <div class="d-flex align-center gap-1">
          <span :class="['text-caption', 'font-weight-medium', statusFilter === 'Onay Bekleyenler' ? 'text-amber-darken-4' : 'text-green-darken-4']">
            DURUM:
          </span>
          <select v-model="statusFilter" class="bg-white border rounded px-1 text-caption font-weight-bold" style="outline: none; max-width: 100px; cursor: pointer;">
            <option value="Tümü">Tümü</option>
            <option value="Ödenenler">Ödenenler</option>
            <option value="Onay Bekleyenler">Bekleyenler</option>
          </select>
        </div>
        
        <div :class="['text-h4', 'font-weight-bold', 'mt-1', statusFilter === 'Onay Bekleyenler' ? 'text-amber-darken-4' : 'text-green-darken-4']">
          {{ activeStatusCount }} 
          <span class="text-subtitle-2 font-weight-regular text-grey-darken-2">
            {{ statusFilter === 'Onay Bekleyenler' ? 'Bekleyen' : 'Kayıt' }}
          </span>
        </div>
      </div>
      
      <v-icon 
        size="40" 
        :color="statusFilter === 'Onay Bekleyenler' ? 'amber-darken-3' : 'green-darken-3'" 
        class="opacity-60"
      >
        {{ statusFilter === 'Onay Bekleyenler' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
      </v-icon>
    </div>
  </v-card>
</v-col>
    </v-row>

    <v-card class="mb-4" outlined>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Personel ismine göre ara..." variant="outlined" density="compact" hide-details clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select v-model="selectedMonthFilter" :items="[{ id: 'ALL', name: 'Tüm Aylar' }, ...months]" item-title="name" item-value="id" label="Dönem Ayı" variant="outlined" density="compact" hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select v-model="selectedYearFilter" :items="['ALL', 2025, 2026, 2027]" label="Dönem Yılı" variant="outlined" density="compact" hide-details></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table :headers="headers" :items="filteredPayrolls" :loading="tableLoading"show-select            v-model="selectedItems" item-value="id"  return-object >
        <template v-slot:item.data-table-select="{ item, props }">
    <v-checkbox 
      v-bind="props" 
      :disabled="item.isPaid" 
    />
  </template>
        
        <template v-slot:item.employeeName="{ item }">
          <span class="font-weight-bold">{{ item.employee?.firstName }} {{ item.employee?.lastName }}</span>
        </template>

        <template v-slot:item.period="{ item }">
          <v-chip variant="outlined" size="small" color="grey-darken-3" class="font-weight-bold">
            {{ getMonthName(item.month) }} / {{ item.year }}
          </v-chip>
        </template>

        <template v-slot:item.baseSalary="{ item }">
          {{ formatMoney(item.baseSalary) }}
        </template>
        
        <template v-slot:item.bonus="{ item }">
          <span :class="item.bonus > 0 ? 'text-green-darken-2 font-weight-bold' : 'text-grey'">+{{ formatMoney(item.bonus) }}</span>
        </template>
        
        <template v-slot:item.advances="{ item }">
          <span :class="item.advances > 0 ? 'text-amber-darken-3 font-weight-medium' : 'text-grey'">{{ item.advances > 0 ? '-' : '' }}{{ formatMoney(item.advances) }}</span>
        </template>
        
        <template v-slot:item.deductions="{ item }">
          <span :class="item.deductions > 0 ? 'text-red-darken-2' : 'text-grey'">{{ item.deductions > 0 ? '-' : '' }}{{ formatMoney(item.deductions) }}</span>
        </template>
        
        <template v-slot:item.netSalary="{ item }">
          <v-chip color="indigo-darken-2" size="small" class="font-weight-bold" variant="flat">{{ formatMoney(item.netSalary) }}</v-chip>
        </template>

        <template v-slot:item.totalEmployerCost="{ item }">
          <span class="font-weight-bold text-deep-orange-darken-3">{{ formatMoney(item.totalEmployerCost || 0) }}</span>
        </template>

        <template v-slot:item.isPaid="{ item }">
          <v-chip :color="item.isPaid ? 'green' : 'amber-darken-3'" size="small" class="font-weight-bold">
            {{ item.isPaid ? 'Ödendi' : 'Onay Bekliyor' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
  <v-menu location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
    </template>
    <v-list density="compact">
      <v-list-item prepend-icon="mdi-pencil" title="Düzenle" @click="openEditDialog(item)"></v-list-item>
      
      <v-list-item prepend-icon="mdi-file-pdf-box" title="Maaş Pusulası (PDF)" 
                   @click="generatePayslip(item)" color="deep-purple"></v-list-item>
      
      <v-list-item prepend-icon="mdi-history" title="Bordro Geçmişi" 
                   @click="openHistory(item.employeeId, item.employee.firstName + ' ' + item.employee.lastName)" color="indigo"></v-list-item>
      
      <v-divider></v-divider>
      <v-list-item prepend-icon="mdi-trash-can" title="İptal Et" @click="openDeleteDialog(item)" color="error"></v-list-item>
    </v-list>
  </v-menu>
</template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="1100px" persistent>
      <v-card rounded="lg" class="elevation-12">
        <v-card-title class="bg-indigo-darken-2 text-white d-flex align-center pa-4">
          <v-icon :icon="isEditMode ? 'mdi-pencil-box-outline' : 'mdi-calculator'" class="mr-2"></v-icon>
          <span class="font-weight-bold">{{ isEditMode ? 'Bordro Kaydını Düzelt / Güncelle' : 'Maaş & Akıllı Prim Hesaplayıcı' }}</span>
        </v-card-title>

        <v-card-text class="pa-0 bg-grey-lighten-5">
          <v-row no-gutters>
            <v-col cols="12" md="6" class="pa-5 border-end">
              <v-form ref="formRef" v-model="isFormValid">
                
                <div class="mb-4 pa-4 bg-white rounded-lg border">
                  <div class="d-flex align-center mb-3 text-indigo-darken-3 font-weight-bold text-subtitle-1">
                    <v-icon icon="mdi-account-clock" class="mr-2" color="indigo-darken-2"></v-icon>
                    Dönem & Personel Seçimi
                  </div>
                  <v-row dense>
                    <v-col cols="12">
                      <v-select 
                        v-model="form.employeeId" 
                        :items="employees" 
                        :item-title="item => `${item.firstName} ${item.lastName}`" 
                        item-value="id" 
                        label="Personel Seçiniz" 
                        variant="outlined" 
                        density="compact" 
                        :rules="requiredRule" 
                        :disabled="isEditMode"
                        prepend-inner-icon="mdi-account"
                        required 
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select v-model="form.month" :items="months" item-title="name" item-value="id" label="Bordro Dönem Ayı" variant="outlined" density="compact" :rules="requiredRule" prepend-inner-icon="mdi-calendar-month" :disabled="isEditMode" required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select v-model="form.year" :items="years" label="Bordro Dönem Yılı" variant="outlined" density="compact" :rules="requiredRule" prepend-inner-icon="mdi-calendar-blank" :disabled="isEditMode" required />
                    </v-col>
                  </v-row>
                </div>

                <div class="mb-4 pa-4 bg-white rounded-lg border">
                  <div class="d-flex align-center mb-3 text-success font-weight-bold text-subtitle-1">
                    <v-icon icon="mdi-briefcase-clock" class="mr-2" color="success"></v-icon>
                    Çalışma Gün Takibi & Taban Hakediş
                  </div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.workedDays" type="number" label="Çalışılan Gün Sayısı" variant="outlined" density="compact" :rules="workedDaysRules" suffix="Gün" prepend-inner-icon="mdi-calendar-check" required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.baseSalary" type="number" label="Anlaşılan Net Taban Maaş" variant="outlined" density="compact" prefix="₺" :rules="requiredRule" prepend-inner-icon="mdi-cash" required />
                    </v-col>
                  </v-row>
                </div>

                <div class="pa-4 bg-white rounded-lg border">
                  <div class="d-flex align-center mb-3 text-purple-darken-3 font-weight-bold text-subtitle-1">
                    <v-icon icon="mdi-calculator-variant" class="mr-2" color="purple-darken-2"></v-icon>
                    Değişken Girdiler (Mesai, Avans & Kesintiler)
                  </div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.overtimeHours" type="number" label="Fazla Mesai (Saat)" variant="outlined" density="compact" suffix="Saat" prepend-inner-icon="mdi-clock-fast" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.overtimeHourlyRate" type="number" label="Mesai Saatlik Ücreti" variant="outlined" density="compact" prefix="₺" prepend-inner-icon="mdi-currency-try" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.advances" type="number" label="Ay İçi Alınan Avans" variant="outlined" density="compact" prefix="₺" prepend-inner-icon="mdi-cash-hand" hint="Elden/Banka yoluyla önceden ödenen nakit" persistent-hint />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.deductions" type="number" label="İdari / Özel Kesinti" variant="outlined" density="compact" prefix="₺" prepend-inner-icon="mdi-cash-minus" hint="İcra, ceza veya şirket içi kesintiler" persistent-hint />
                    </v-col>
                    <v-col cols="12" class="d-flex align-center justify-start mt-2">
                      <v-checkbox v-model="form.isPaid" label="Maaş Ödendi (Banka Transferi Yapıldı)" color="success" hide-details class="font-weight-bold" />
                    </v-col>
                  </v-row>
                </div>
              </v-form>
            </v-col>

            <v-col cols="12" md="6" class="pa-5 bg-grey-lighten-4">
             <v-card v-if="!isEditMode" border variant="flat" class="bg-indigo-lighten-5 rounded-lg pa-4 mb-4">
    <div class="text-subtitle-1 font-weight-bold text-indigo-darken-3 mb-2 d-flex align-center">
      <v-icon icon="mdi-chart-line" class="mr-2"></v-icon> Anlık Yasal Öngörü
    </div>
    <div class="d-flex justify-space-between py-1 border-b">
      <span>Tahmini Yasal Brüt:</span>
      <span class="font-weight-bold">{{ formatMoney(previewCalculation.gross) }}</span>
    </div>
    <div class="d-flex justify-space-between py-1 border-b">
      <span>Net Hedef (Tahmini):</span>
      <span class="font-weight-bold text-indigo-darken-4">{{ formatMoney(previewCalculation.net) }}</span>
    </div>
  </v-card>
  <!-- EKLEME BİTTİ -->

              <v-card v-if="isEditMode && selectedPayroll" border variant="flat" class="bg-white rounded-lg pa-4">
  <div class="text-subtitle-1 font-weight-bold text-indigo-darken-3 mb-2">Kazançlar</div>
  <div class="d-flex justify-space-between py-1 border-b"><span>Taban Maaş</span> <span>{{ formatMoney(selectedPayroll.grossSalary || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b text-success"><span>Mesai Primi</span> <span>+ {{ formatMoney(selectedPayroll.bonus || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b text-success"><span>Sosyal Yardımlar</span> <span>+ {{ formatMoney(selectedPayroll.allowancesTotal || 0) }}</span></div>

  <div class="text-subtitle-1 font-weight-bold text-red-darken-1 mt-6 mb-2">Yasal Kesintiler</div>
  <div class="d-flex justify-space-between py-1 border-b"><span>SGK İşçi Payı (%14)</span> <span>- {{ formatMoney(selectedPayroll.sgkWorkerPay || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b"><span>İşsizlik Sig. (İşçi) (%1)</span> <span>- {{ formatMoney(selectedPayroll.unemploymentWorker || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b"><span>Gelir Vergisi</span> <span>- {{ formatMoney(selectedPayroll.incomeTax || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b"><span>Damga Vergisi</span> <span>- {{ formatMoney(selectedPayroll.stampTax || 0) }}</span></div>

  <div class="mt-6 pa-3 bg-indigo-lighten-5 rounded text-center">
    <div class="text-h6 font-weight-bold text-indigo-darken-4">BANKAYA YATACAK NET TUTAR</div>
    <div class="text-h4 font-weight-bold text-indigo-darken-4">{{ formatMoney(selectedPayroll.netSalary || 0) }}</div>
  </div>

  <div class="text-subtitle-1 font-weight-bold text-deep-orange-darken-4 mt-6 mb-2">Şirket Maliyet Kalemleri</div>
  <div class="d-flex justify-space-between py-1 border-b"><span>SGK İşveren Payı (%15.5)</span> <span>+ {{ formatMoney(selectedPayroll.sgkEmployerPay || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b"><span>İşsizlik İşv. Sig. (%2)</span> <span>+ {{ formatMoney(selectedPayroll.unemploymentEmployer || 0) }}</span></div>
  <div class="d-flex justify-space-between py-1 border-b text-grey"><span>İdari Kesintiler</span> <span>- {{ formatMoney(selectedPayroll.deductions || 0) }}</span></div>
  <v-divider class="my-4"></v-divider>


<div class="text-subtitle-1 font-weight-bold mb-2">Vergi Dilimi ve Kümülatif Matrah</div>

<v-card variant="outlined" class="pa-3" color="grey-lighten-4">
  <div class="d-flex justify-space-between text-caption mb-1">
    <span>Bu Ayki Matrah:</span>
    <span class="font-weight-medium">{{ formatMoney(selectedPayroll?.incomeTaxBase || 0) }}</span>
  </div>
  
  <div class="d-flex justify-space-between text-caption mb-1">
    <span>Kümülatif Matrah (Yılbaşından):</span>
    <span class="font-weight-medium">{{ formatMoney(selectedPayroll?.cumulativeTaxBase || 0) }}</span>
  </div>

  <v-divider class="my-2"></v-divider>

  <div class="d-flex justify-space-between text-subtitle-2">
    <span>Dilim Durumu:</span>
    <span class="text-primary">{{ getTaxBracketLabel(selectedPayroll?.cumulativeTaxBase || 0) }}</span>
  </div>
</v-card>

  <div class="mt-4 pa-3 bg-orange-lighten-5 rounded text-center">
    <div class="text-subtitle-1 font-weight-bold text-deep-orange-darken-4">ŞİRKETE TOPLAM MALİYET</div>
    <div class="text-h5 font-weight-bold text-deep-orange-darken-4">{{ formatMoney(selectedPayroll.totalEmployerCost || 0) }}</div>
  </div>
</v-card>
              
              <v-alert v-else type="info" variant="tonal" class="text-body-2 mt-4">
                Yeni maaş girişlerinde yasal kırılımlar, kesintiler ve şirkete olan toplam maliyet bilançosu, siz <strong>Hesapla</strong> butonuna bastıktan sonra ana veri tablosunda listelenecektir.
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-divider></v-divider>
        <v-card-actions class="pa-4 justify-end bg-grey-lighten-4">
          <v-btn variant="text" color="grey-darken-2" @click="closeDialog" class="text-none font-weight-bold">İptal</v-btn>
          <v-btn color="indigo-darken-2" variant="flat" :loading="submitLoading" :disabled="!isFormValid" @click="handleSubmit" class="text-none px-5 font-weight-bold">
            <v-icon icon="mdi-check" class="mr-1"></v-icon>
            {{ isEditMode ? 'Değişiklikleri Kaydet' : 'Hesapla ve Kaydet' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    
    
    <v-dialog v-model="deleteDialog" max-width="450px">
      <v-card rounded="lg">
        <v-card-title class="bg-red text-white pa-4 d-flex align-center">
          <v-icon icon="mdi-alert" class="mr-2"></v-icon>
          <span>Bordroyu İptal Et?</span>
        </v-card-title>
        <v-card-text class="pt-4">
          Bu maaş bordrosu kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem finansal geri dönüşü olmayan bir iptal işlemidir.
        </v-card-text>
        <v-card-actions class="pa-4 justify-end">
        
          <v-btn variant="text" color="grey-darken-1" @click="deleteDialog = false">Vazgeç</v-btn>
          <v-btn color="error" variant="flat" :loading="submitLoading" @click="handleDelete">Bordroyu Sil</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

<v-dialog v-model="historyDialog" max-width="700px">
  <v-card rounded="lg">
    <v-card-title class="bg-indigo-darken-2 text-white pa-4 d-flex align-center">
      <v-icon icon="mdi-history" class="mr-2"></v-icon>
      <span>{{ selectedEmployeeName }} - Bordro Karnesi</span>
    </v-card-title>

    <v-card-text class="pt-4">
      <v-row dense class="mb-4">
        <v-col cols="4">
          <v-card variant="tonal" color="indigo" class="pa-2 text-center">
            <div class="text-caption">Yıllık Brüt</div>
            <div class="font-weight-bold">{{ formatMoney(totalYearlyGross) }}</div>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card variant="tonal" color="red-darken-1" class="pa-2 text-center">
            <div class="text-caption">Kümülatif Matrah</div>
            <div class="font-weight-bold">{{ formatMoney(totalCumulativeTaxBase) }}</div>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card variant="tonal" color="green-darken-1" class="pa-2 text-center">
            <div class="text-caption">Ortalama Net</div>
            <div class="font-weight-bold">{{ formatMoney(averageNet) }}</div>
          </v-card>
        </v-col>
      </v-row>

      <v-table density="compact" hover class="border rounded">
        <thead>
          <tr class="bg-grey-lighten-4">
            <th>Dönem</th>
            <th class="text-right">Brüt Maaş</th>
            <th class="text-right">Net Ödeme</th>
            <th class="text-center">Durum</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filteredEmployeeHistory" :key="h.id">
            <td>{{ h.month }}/{{ h.year }}</td>
            <td class="text-right">{{ formatMoney(h.grossSalary) }}</td>
            <td class="text-right font-weight-bold">{{ formatMoney(h.netSalary) }}</td>
            <td class="text-center">
              <v-chip :color="h.isPaid ? 'success' : 'warning'" size="x-small">
                {{ h.isPaid ? 'Ödendi' : 'Bekliyor' }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <v-card-actions class="pa-4 justify-space-between">
      <v-btn variant="outlined" color="indigo" prepend-icon="mdi-printer" @click="printReport">PDF Raporu Al</v-btn>
      <v-btn color="grey-darken-1" variant="text" @click="historyDialog = false">Kapat</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


     
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">{{ snackbar.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
// API Yöntemleri Entegrasyonu
const { getPayrolls, createPayroll, updatePayroll, deletePayroll, getEmployees } = useApi()

// Reaktif Durum Yönetimleri
const payrolls = ref([])
const employees = ref([])
const dialog = ref(false)
const deleteDialog = ref(false)
const tableLoading = ref(false)
const submitLoading = ref(false)
const isFormValid = ref(false)
const formRef = ref(null)
const isEditMode = ref(false)
const selectedPayroll = ref(null)
const selectedItems = ref([]) // Seçilen personeller burada tutulacak

const historyDialog = ref(false)
const selectedEmployeeName = ref('')
const selectedEmployeeId = ref(null)

const filteredEmployeeHistory = computed(() => {
  return payrolls.value
    .filter(p => p.employeeId === selectedEmployeeId.value)
    .sort((a, b) => b.year - a.year || b.month - a.month)
})

const openHistory = (id, name) => {
  selectedEmployeeId.value = id
  selectedEmployeeName.value = name
  historyDialog.value = true
}
// Bordro Geçmişi Analizleri
const totalYearlyGross = computed(() => {
  return filteredEmployeeHistory.value.reduce((sum, h) => sum + (Number(h.grossSalary) || 0), 0)
})

const totalCumulativeTaxBase = computed(() => {
  return filteredEmployeeHistory.value.reduce((sum, h) => sum + (Number(h.incomeTaxBase) || 0), 0)
})

const averageNet = computed(() => {
  const count = filteredEmployeeHistory.value.length
  if (count === 0) return 0
  const total = filteredEmployeeHistory.value.reduce((sum, h) => sum + (Number(h.netSalary) || 0), 0)
  return total / count
})



const generatePayslip = (item) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // --- HESAPLAMALAR ---
  // Backend'de hesaplanıp kaydedilen resmi değerleri kullanıyoruz
  const gross = parseFloat(item.grossSalary || 0);
  
  // Sosyal yardımları Prisma'dan gelen ilişkili listeden topluyoruz
 // GÜVENLİ HESAPLAMA: 
  // Önce veritabanından gelen toplamı al, yoksa allowances dizisini topla
  const allowancesList = item.allowances || [];
  const allowancesTotal = parseFloat(item.allowancesTotal || 0) > 0 
    ? parseFloat(item.allowancesTotal) 
    : allowancesList.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0); 
  // Mesaiyi veritabanındaki verilerle backend ile aynı disiplinde hesaplıyoruz
  const overtimeHours = parseFloat(item.overtimeHours || 0);
  const overtimeHourlyRate = parseFloat(item.overtimeHourlyRate || 0);
  const overtimeAmount = overtimeHours * overtimeHourlyRate; 
  
  const totalEarnings = gross + allowancesTotal + overtimeAmount;
  
  // SGK ve Vergi kalemleri (Backend'in hesapladığı net tutarlar)
  const sgk = parseFloat(item.sgkWorkerPay || 0);
  const issizlik = parseFloat(item.unemploymentWorker || 0);
  const tax1 = parseFloat(item.incomeTax || 0);
  const tax2 = parseFloat(item.stampTax || 0);
  const totalDeductions = sgk + issizlik + tax1 + tax2;
  const net = parseFloat(item.netSalary || 0); // Backend'in netSalary'si

  const formatPara = (s) => s.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + " TL";

  // --- 1. BAŞLIK VE ŞİRKET ---
  doc.setFont("courier", "bold");
  doc.setFontSize(22);
  doc.text("MAAS BORDROSU", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text("IK YONETIM SaaS Hizmetleri A.S.", 105, 26, { align: "center" });
  doc.line(14, 30, 196, 30);

  // --- 2. KİMLİK VE VERGİ BİLGİLERİ ---
  doc.setFont("courier", "bold");
  doc.text("PERSONEL & DONEM", 14, 38);
  doc.setFont("courier", "normal");
  doc.text(`Ad Soyad : ${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`, 14, 44);
  doc.text(`Donem    : ${item.month || ''} / ${item.year || ''}`, 14, 49);

  doc.setFont("courier", "bold");
  doc.text("VERGI BILGILERI", 130, 38);
  doc.setFont("courier", "normal");
  doc.text(`Kum. Matrah : ${item.cumulativeTaxBase?.toLocaleString('tr-TR') || '0,00'} TL`, 130, 44);
  doc.text(`Vergi Dilimi: %${item.taxBracket || '15'}`, 130, 49);

  // --- 3. DETAYLI TABLO ---

  
  autoTable(doc, {
    startY: 58,
    head: [['ACIKLAMA', 'TUTAR (TL)']],
    body: [
      ['Brut Maas', formatPara(gross)],
      ['Sosyal Yardim Toplami', formatPara(allowancesTotal)],
      [`Fazla Mesai (${overtimeHours} Saat)`, formatPara(overtimeAmount)],
      [{ content: 'TOPLAM KAZANC', styles: { fontStyle: 'bold' } }, { content: formatPara(totalEarnings), styles: { fontStyle: 'bold' } }],
      ['SGK Isci Payi (%14)', formatPara(sgk)],
      ['Issizlik Sigortasi (%1)', formatPara(issizlik)],
      ['Gelir Vergisi', formatPara(tax1)],
      ['Damga Vergisi', formatPara(tax2)],
      [{ content: 'TOPLAM KESINTILER', styles: { fontStyle: 'bold' } }, { content: formatPara(totalDeductions), styles: { fontStyle: 'bold' } }],
      [{ content: 'NET ODENEN', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: formatPara(net), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
    ],
    theme: 'grid',
    styles: { font: 'courier', fontSize: 10 },
    columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'right' } }
  });

  // --- 4. ALT BİLGİ ---
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.text("Bu bordro resmi kayitlarla uyumludur.", 14, finalY);
  doc.text("Sirket Yetkilisi ____________________", 130, finalY + 15);

  doc.save(`Bordro_${item.employee?.firstName}_${item.month}.pdf`);
};

const printReport = () => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // 1. Yardımcı Temizleyici (En güvenli hali)
  const clean = (val) => String(val || "").replace(/[^\x00-\x7F]/g, "").replace(/&/g, "");

  // 2. Şirket Anteti ve Başlık
  doc.setFont("courier", "bold");
  doc.setFontSize(18);
  doc.text("PERSONEL MAAS VE KARIYER KARNESI", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  doc.text("IK YONETIM SaaS Hizmetleri A.S. - 2026", 105, 21, { align: "center" });
  doc.line(14, 25, 196, 25);

  // 3. Personel Bilgileri
  doc.setFont("courier", "bold");
  doc.text("PERSONEL BILGILERI", 14, 32);
  doc.setFont("courier", "normal");
  doc.text(`Ad Soyad : ${clean(selectedEmployeeName.value)}`, 14, 38);
  doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 43);

  // 4. İK Analiz (Özet Tablosu)
  autoTable(doc, {
    startY: 50,
    head: [['ANALIZ KALEMI', 'YIL ICI TOPLAM (TL)']],
    body: [
      ['Yillik Brut Maas Toplami', clean(formatMoney(totalYearlyGross.value))],
      ['Kumulatif Vergi Matrahi', clean(formatMoney(totalCumulativeTaxBase.value))],
      ['Ortalama Net Maas', clean(formatMoney(averageNet.value))]
    ],
    theme: 'grid',
    styles: { font: 'courier', fontSize: 10, cellPadding: 3 }
  });

  // 5. İK Detay (Aylık Bordro Gelişimi)
  doc.setFont("courier", "bold");
  doc.text("AYLIK BORDRO GECMISI", 14, doc.lastAutoTable.finalY + 10);
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 14,
    head: [['Donem', 'Brut Maas', 'Net Odeme', 'Durum']],
    body: filteredEmployeeHistory.value.map(h => [
      `${h.month}/${h.year}`,
      clean(formatMoney(h.grossSalary)),
      clean(formatMoney(h.netSalary)),
      clean(h.isPaid ? "Odendi" : "Bekliyor")
    ]),
    theme: 'striped',
    headStyles: { fillColor: [48, 63, 159] }, // İndigo renk
    styles: { font: 'courier', fontSize: 9 }
  });

  // 6. Alt Bilgi ve Onay Alanı
  const bottomY = doc.lastAutoTable.finalY + 20;
  doc.text("Bu rapor resmi IK bordro kayitlarindan alinmistir.", 14, bottomY);
  doc.text("Onaylayan: ____________________", 140, bottomY);

  doc.save(`Karne_${clean(selectedEmployeeName.value).replace(/\s/g, '_')}.pdf`);
};


// Form İlklendirme Verisi
const form = ref({ 
  employeeId: null, 
  month: new Date().getMonth() + 1, 
  year: new Date().getFullYear(), 
  workedDays: 30, 
  baseSalary: '', 
  advances: 0,
  deductions: 0, 
  overtimeHours: 0, 
  overtimeHourlyRate: 0, 
  isPaid: false 
})

const snackbar = ref({ show: false, text: '', color: '' })

// Arama Filtreleme Değişkenleri
const searchQuery = ref('')
const selectedMonthFilter = ref('ALL')
const selectedYearFilter = ref('ALL')
const statusFilter = ref('Tümü');

const months = [
  { id: 1, name: 'Ocak' }, { id: 2, name: 'Şubat' }, { id: 3, name: 'Mart' }, 
  { id: 4, name: 'Nisan' }, { id: 5, name: 'Mayıs' }, { id: 6, name: 'Haziran' }, 
  { id: 7, name: 'Temmuz' }, { id: 8, name: 'Ağustos' }, { id: 9, name: 'Eylül' }, 
  { id: 10, name: 'Ekim' }, { id: 11, name: 'Kasım' }, { id: 12, name: 'Aralık' }
]
const years = [2025, 2026, 2027]

// Tablo Başlıkları
const headers = [
  { title: 'Personel', key: 'employeeName', align: 'start', sortable: true },
  { title: 'Dönem', key: 'period', align: 'center' },
  { title: 'Taban Maaş', key: 'baseSalary', align: 'end' },
  { title: 'Hesaplanan Prim', key: 'bonus', align: 'end' },
  { title: 'Ödenen Avans', key: 'advances', align: 'end' },
  { title: 'Kesintiler', key: 'deductions', align: 'end' },
  { title: 'Net Ödenen Maaş', key: 'netSalary', align: 'end', sortable: true },
  { title: 'Şirket Maliyeti', key: 'totalEmployerCost', align: 'end', sortable: true },
  { title: 'Durum', key: 'isPaid', align: 'end' },
  { title: 'İşlemler', key: 'actions', align: 'end', sortable: false }
]

// Kurumsal Validasyon Kuralları
const requiredRule = [v => !!v || 'Bu alan doldurulmalıdır!']
const workedDaysRules = [
  v => !!v || 'Çalışılan gün sayısı girilmelidir!',
  v => (Number(v) >= 0 && Number(v) <= 30) || 'Gün sayısı 0 ile 30 arasında olmalıdır!'
]

// 📊 DİNAMİK İSTATİSTİK HESAPLAYICILARI
// Payrolls.vue içindeki hesaplayıcıları bununla değiştir
const totalNetPayment = computed(() => {
  return filteredPayrolls.value.reduce((sum, item) => {
    const val = Number(item.netSalary) || 0;
    return sum + val;
  }, 0);
});

const totalEmployerCostSum = computed(() => {
  return filteredPayrolls.value.reduce((sum, item) => {
    const val = Number(item.totalEmployerCost) || 0;
    return sum + val;
  }, 0);
});

const pendingPaymentCount = computed(() => {
  return filteredPayrolls.value.filter(item => !item.isPaid).length
});

const activeStatusCount = computed(() => {
  return filteredPayrolls.value.length;
});

// Akıllı Muhasebe Filtre Motoru (Güvenli Sürüm)
// --- AKILLI MUHASEBE FİLTRE MOTORU ---
const filteredPayrolls = computed(() => {
  if (!payrolls.value) return [];
  
  return payrolls.value.filter(pay => {
    // Arama Filtresi
    const firstName = (pay.employee?.firstName || '').toLowerCase();
    const lastName = (pay.employee?.lastName || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const search = searchQuery.value ? searchQuery.value.toLowerCase() : '';
    const matchesSearch = fullName.includes(search);

    // Zaman Filtreleri
    const matchesMonth = selectedMonthFilter.value === 'ALL' || pay.month === selectedMonthFilter.value;
    const matchesYear = selectedYearFilter.value === 'ALL' || pay.year === Number(selectedYearFilter.value);

    // DURUM FİLTRESİ (Yeni)
    
   // Burada hem boolean hem string hem de sayısal (1/0) karşılaştırması yapıyoruz
    const isPaidBool = pay.isPaid === true || pay.isPaid === 1 || pay.isPaid === 'true';
    
    const matchesStatus = 
      statusFilter.value === 'Tümü' ? true :
      statusFilter.value === 'Ödenenler' ? isPaidBool === true :
      statusFilter.value === 'Onay Bekleyenler' ? isPaidBool === false : true;

    return matchesSearch && matchesMonth && matchesYear && matchesStatus;
  });
});

// ... diğer computed'ların ...

// YENİ EKLENEN: Toplam benzersiz çalışan sayısı
const uniqueEmployeeCount = computed(() => {
  // filteredPayrolls içindeki tüm bordrolardan benzersiz employeeId'leri topla
  const ids = new Set(filteredPayrolls.value.map(p => p.employeeId));
  return ids.size;
});

// YENİ EKLENEN: Toplam bordro sayısı
const totalPayrollCount = computed(() => filteredPayrolls.value.length);

const getTaxBracketLabel = (cumulative) => {
  if (cumulative < 158000) return '%15 (İlk Dilim)';
  if (cumulative < 390000) return '%20 (İkinci Dilim)';
  if (cumulative < 910000) return '%27 (Üçüncü Dilim)';
  return '%35 ve üzeri (Üst Dilim)';
}

const loadPayrollPageData = async () => {
  tableLoading.value = true
  try {
    const [payData, empData] = await Promise.all([getPayrolls(), getEmployees()])
    payrolls.value = payData
    employees.value = empData
  } catch (err) {
    showNotify('Veriler yüklenirken hata oluştu.', 'error')
  } finally {
    tableLoading.value = false
  }
}

const copyPreviousMonth = async () => {
  // 1. Önceki ayı ve yılı hesapla
  let targetMonth = selectedMonthFilter.value === 'ALL' ? new Date().getMonth() : selectedMonthFilter.value - 1;
  let targetYear = selectedYearFilter.value === 'ALL' ? new Date().getFullYear() : selectedYearFilter.value;
  
  if (targetMonth === 0) { targetMonth = 12; targetYear -= 1; }

  // 2. Geçen ayın bordrolarını bul
  const previousMonthPayrolls = payrolls.value.filter(p => p.month === targetMonth && p.year === targetYear);

  if (previousMonthPayrolls.length === 0) {
    showNotify('Kopyalanacak önceki ay verisi bulunamadı.', 'error');
    return;
  }

  // 3. Onay al
  if (!confirm(`${targetMonth}/${targetYear} dönemindeki ${previousMonthPayrolls.length} bordroyu yeni döneme kopyalamak istediğinize emin misiniz?`)) return;

  submitLoading.value = true;
  try {
    // 4. Her bir kaydı yeni ay için oluştur (Kopya işleminde avans/kesinti 0 başlar, taban maaş korunur)
    const newMonth = new Date().getMonth() + 1;
    const newYear = new Date().getFullYear();

    for (const p of previousMonthPayrolls) {
      const copy = {
        employeeId: p.employeeId,
        month: newMonth,
        year: newYear,
        workedDays: p.workedDays || 30,
        baseSalary: p.baseSalary,
        advances: 0, // Avanslar kopyalanmaz
        deductions: 0, // Kesintiler kopyalanmaz
        overtimeHours: 0,
        overtimeHourlyRate: p.overtimeHourlyRate,
        isPaid: false
      };
      await createPayroll(copy);
    }
    
    showNotify('Geçen ayın verileri başarıyla yeni aya kopyalandı.', 'success');
    await loadPayrollPageData();
  } catch (error) {
    showNotify('Kopyalama sırasında hata: ' + error.message, 'error');
  } finally {
    submitLoading.value = false;
  }
};
const openCreateDialog = async () => {
  isEditMode.value = false
  form.value = { employeeId: null, month: new Date().getMonth() + 1, year: new Date().getFullYear(), workedDays: 30, baseSalary: '', advances: 0, deductions: 0, overtimeHours: 0, overtimeHourlyRate: 0, isPaid: false }
  dialog.value = true
}

const openEditDialog = async (item) => {
  isEditMode.value = true
  selectedPayroll.value = item
  form.value = { workedDays: 30, ...item }
  dialog.value = true
}

const openDeleteDialog = (item) => { selectedPayroll.value = item; deleteDialog.value = true }

// ⚡ CANLI YASAL HESAPLAMA MOTORU (Öngörü)
const previewCalculation = computed(() => {
  const base = Number(form.value.baseSalary) || 0
  const hours = Number(form.value.overtimeHours) || 0
  const rate = Number(form.value.overtimeHourlyRate) || 0
  const targetNet = base + (hours * rate)
  
  // 2026 Mevzuat Tahmini Katsayı
  const gross = Math.round((targetNet / 0.71491) * 100) / 100
  return { net: targetNet, gross: gross }
})

// 🚀 REAKTİF GÜNCELLEME MOTORUNA SAHİP SUBMIT METODU
const handleSubmit = async () => {
  if (!isFormValid.value) return
  submitLoading.value = true
  try {
    const cleanedForm = {
      employeeId: form.value.employeeId,
      month: Number(form.value.month),
      year: Number(form.value.year),
      workedDays: Number(form.value.workedDays) || 30,
      baseSalary: Number(form.value.baseSalary) || 0,
      advances: Number(form.value.advances) || 0, 
      deductions: Number(form.value.deductions) || 0,
      overtimeHours: Number(form.value.overtimeHours) || 0,
      overtimeHourlyRate: Number(form.value.overtimeHourlyRate) || 0,
      allowances: Number(selectedPayroll.value?.allowancesTotal || 0),
      isPaid: Boolean(form.value.isPaid)
    }

    if (isEditMode.value) {
      const response = await updatePayroll(selectedPayroll.value.id, cleanedForm)
      
      // Backend'den doğrudan nesne veya sarmalanmış nesne (.data) gelme ihtimaline karşı güvenli süzgeç
      const updatedData = response?.data || response || cleanedForm
      
      const index = payrolls.value.findIndex(p => p.id === selectedPayroll.value.id)
      if (index !== -1) {
        // Tablodaki ad-soyad (employee) nesnesinin kaybolmaması için eski veriyi yenisiyle harmanlıyoruz
        payrolls.value[index] = { 
          ...payrolls.value[index], 
          ...updatedData 
        }
      }
      showNotify('Bordro kaydı, yasal kalemler ve şirket maliyeti başarıyla güncellendi.', 'success')
    } else {
      const response = await createPayroll(cleanedForm)
      const newData = response?.data || response
      if (newData) {
        payrolls.value.unshift(newData)
      }
      showNotify('Bordro resmi oranlara göre başarıyla hesaplandı ve arşive eklendi.', 'success')
    }
    closeDialog()
    
    // Veritabanı ile senkronizasyonun arka planda sessizce (Arayüzü kilitlemeden) yapılması sağlanır
    loadPayrollPageData()
  } catch (error) { 
    showNotify('İşlem sırasında hata: ' + error.message, 'error') 
  } finally { 
    submitLoading.value = false 
  }
}

const handleDelete = async () => {
  if (!selectedPayroll.value) return
  submitLoading.value = true
  try {
    await deletePayroll(selectedPayroll.value.id)
    showNotify('Bordro başarıyla iptal edildi ve silindi.', 'success')
    deleteDialog.value = false
    await loadPayrollPageData()
  } catch (error) { showNotify(error.message, 'error') }
  finally { submitLoading.value = false }
}

/// --- YENİ İNDİRME VE ÖDEME FONKSİYONLARI ---
// --- YARDIMCI FONKSİYONLAR ---
const closeDialog = () => { dialog.value = false; if (formRef.value) formRef.value.reset() }
const getMonthName = (monthId) => months.find(m => m.id === monthId)?.name || monthId
const showNotify = (text, color) => { snackbar.value = { show: true, text, color: color === 'success' ? 'green' : 'red' } }
const bulkPayDialog = ref(false);

// FormatMoney hatasını önlemek için güvenli sürüm:
const formatMoney = (value) => {
  if (value === null || value === undefined) return '0,00 ₺';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
}

// --- TOPLU ÖDEME AKIŞI ---

const openBulkPayDialog = () => {
  if (selectedItems.value.length === 0) return showNotify("Lütfen personel seçin!", "error");
  bulkPayDialog.value = true;
};

// 1. Sadece Excel İndirir
const downloadBankFile = () => {
  // Sigorta: Seçim yapıldıysa onları, yapılmadıysa filtredeki tüm ödenmemişleri al
  const itemsToDownload = selectedItems.value.length > 0 
    ? selectedItems.value 
    : payrolls.value.filter(p => !p.isPaid);

  if (itemsToDownload.length === 0) {
    showNotify("İndirilecek veri yok!", "warning");
    return;
  }
  const bankData = selectedItems.value.map(p => ({
    'Ad': p.employee?.firstName ?? 'N/A',
    'Soyad': p.employee?.lastName ?? 'N/A',
    'IBAN': p.employee?.iban ?? 'N/A',
    'Tutar': p.netSalary ?? 0,
    'Dönem': `${p.month}/${p.year}`,
    // Tarih sütununu buraya ekliyoruz:
    'Ödeme Tarihi': new Date().toLocaleDateString('tr-TR')
  }));

  const worksheet = XLSX.utils.json_to_sheet(bankData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Talimat");
  XLSX.writeFile(workbook, "Banka_Talimati.xlsx");
  showNotify("Excel dosyası indirildi.", "success");
};

// 2. Sadece Ödemeyi Onaylar
const processPayment = async () => {
  // 1. GÜVENLİK: Sadece ödenmemişleri (isPaid === false) filtrele
  const validItems = selectedItems.value.filter(p => !p.isPaid);
  
  // Ödenecek geçerli kişi yoksa uyar ve çık
  if (validItems.length === 0) {
    showNotify("Seçilenlerin tamamı zaten ödenmiş!", "error");
    return;
  }

  // İşleme sadece bu temiz listeyi gönder
  const ids = validItems.map(p => p.id);
  
  // 2. Kontrol et
  if (!confirm(`${ids.length} adet personelin ödemesini onaylıyor musunuz?`)) return;

  try {
    // 3. API İsteği
    await $fetch('/api/payrolls/bulk-pay', { 
      method: 'POST', 
      body: { ids } 
    });
    
    // --- TEMİZLEME: İşlem başarılıysa seçimleri sıfırla ---
    selectedItems.value = [];
    
    showNotify("Ödemeler başarıyla sisteme işlendi!", "success");
    bulkPayDialog.value = false;
    
    // Tabloyu güncelle
    await loadPayrollPageData(); 
  } catch (e) {
    console.error("Ödeme Hatası:", e);
    showNotify("İşlem sırasında hata oluştu.", "error");
  }


  // Seçilenler listesini sürekli izler
watch(selectedItems, (newVal) => {
  // Eğer seçilenlerin içinde ödenmiş (isPaid: true) olan bir bordro varsa, onu otomatik olarak çıkar
  const cleanList = newVal.filter(p => !p.isPaid);
  
  // Eğer temizlenmesi gereken bir durum varsa (yani içinde ödenmiş olan varsa)
  if (cleanList.length !== newVal.length) {
    selectedItems.value = cleanList;
  }
});

};



onMounted(() => { loadPayrollPageData() })
</script>