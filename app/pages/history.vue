<template>
  <div class="pa-4 bg-grey-lighten-4">
    <!-- 📄 Başlık Bölümü -->
    <v-row class="mb-2" align="center" justify="space-between">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold text-indigo-darken-3">Bordro Geçmişi</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Geçmişe dönük tüm maaş ödeme kayıtları.</p>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-md-end">
        <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel">
          Excel Olarak İndir
        </v-btn>
      </v-col>
    </v-row>

    <!-- 📊 YÖNETİM ÖZETİ KARTLARI -->
    <v-row dense class="mb-6">
      <v-col cols="12" sm="3">
        <v-card color="indigo-lighten-5" class="pa-4 border-start border-xl border-grey-darken-2" elevation="1">
          <div class="text-caption text-uppercase text-indigo-darken-3 font-weight-bold">Toplam Bordro</div>
          <div class="text-h5 font-weight-bold text-indigo-darken-4  mt-1">{{ payrolls ? payrolls.length : 0 }} <span class="text-subtitle-2 text-grey-darken-1">Kayıt</span></div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card color="purple-lighten-5" class="pa-4 border-start border-xl border-indigo-darken-3" elevation="1">
          <div class="text-caption text-uppercase text-indigo-darken-3 font-weight-bold">Toplam Net Ödeme</div>
          <div class="text-h5 font-weight-bold mt-1 text-indigo-darken-4">{{ formatMoney(totalNetPayment) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card color="bg-orange-lighten-5" class="pa-4 border-start border-xl border-orange-darken-2" elevation="1">
          <div class="text-caption text-uppercase text-orange-darken-2 font-weight-bold">Toplam Maliyet</div>
          <div class="text-h5 font-weight-bold mt-1 text-orange-darken-3">{{ formatMoney(totalEmployerCostSum) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
     <v-card color="green-lighten-5" class="pa-4 border-start border-xl border-teal-darken-2" elevation="1">
    <div class="text-caption text-uppercase text-teal-darken-2 font-weight-bold">Ortalama Ödenen Maaş</div>
    <div class="text-h5 font-weight-bold mt-1 text-teal-darken-3">{{ formatMoney(averageSalary) }}</div>
  </v-card>
</v-col>
    </v-row>

    <!-- 🔍 FİLTRE PANELİ -->
    <v-card class="pa-4 mb-4" elevation="1">
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Personel Adı ile Ara..." variant="outlined" density="compact" hide-details></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="selectedYear" :items="['Tümü', ...availableYears]" label="Yıl Seçin" variant="outlined" density="compact" hide-details></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="selectedMonth" :items="['Tümü', ...availableMonths]" label="Ay Seçin" variant="outlined" density="compact" hide-details></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- 📊 TABLO ALANI -->
    <v-card elevation="1">
      <v-table hover>
        <thead>
          <tr class="bg-grey-lighten-3">
            <th class="text-uppercase font-weight-bold text-indigo-darken-4">Personel</th>
            <th class="text-uppercase font-weight-bold text-indigo-darken-4">Dönem</th>
            <th class="text-uppercase font-weight-bold text-indigo-darken-4">Ödeme Tarihi</th>
            <th class="text-uppercase font-weight-bold text-indigo-darken-4 text-right">Net Maaş</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredPayrolls" :key="item.id">
            <td class="py-3">
              <div class="text-body-1 font-weight-bold">{{ item.employee.firstName }} {{ item.employee.lastName }}</div>
              <div class="text-caption text-indigo-darken-2">Sicil: {{ item.employee.id }}</div>
            </td>
            <td>{{ getMonthName(item.month) }} {{ item.year }}</td>
            <td>{{ new Date(item.paymentDate).toLocaleDateString('tr-TR') }}</td>
            <td class="text-right font-weight-black text-indigo-darken-4">{{ formatMoney(item.netSalary) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>
<script setup>
import * as XLSX from 'xlsx';

const { data: payrolls, refresh } = await useFetch('/api/payrolls/history');

// Sayfa her açıldığında veriyi taze tut
onMounted(async () => {
  await refresh();
});

const search = ref('');
const selectedYear = ref('Tümü');
const selectedMonth = ref('Tümü');

const availableMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const getMonthName = (m) => availableMonths[m - 1];
const availableYears = computed(() => payrolls.value ? [...new Set(payrolls.value.map(p => p.year))].sort((a, b) => b - a) : []);

// FİLTRELEME MANTIĞI
const filteredPayrolls = computed(() => {
  if (!payrolls.value) return [];
  return payrolls.value.filter(p => {
    const matchesSearch = `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(search.value.toLowerCase());
    const matchesYear = selectedYear.value === 'Tümü' || p.year === selectedYear.value;
    const matchesMonth = selectedMonth.value === 'Tümü' || getMonthName(p.month) === selectedMonth.value;
    return matchesSearch && matchesYear && matchesMonth;
  });
});

// 📊 PAYROLLS.VUE İLE AYNI HESAPLAMA MANTIĞI
// Toplam Net Ödeme
const totalNetPayment = computed(() => {
  return payrolls.value.reduce((sum, item) => {
    const val = Number(item.netSalary) || 0;
    return sum + val;
  }, 0);
});

// Toplam Şirket Maliyeti
const totalEmployerCostSum = computed(() => {
  return payrolls.value.reduce((sum, item) => {
    const val = Number(item.totalEmployerCost) || 0;
    return sum + val;
  }, 0);
});
// Artık History'de bekleyen bordro göstermediğimiz için bu kart yerine 
// "Ortalama Maaş" verisini dinamik hesaplıyoruz.
const averageSalary = computed(() => {
  const count = payrolls.value.length;
  return count > 0 ? totalNetPayment.value / count : 0;
});

const payrollCount = computed(() => payrolls.value ? payrolls.value.length : 0);

const formatMoney = (val) => new Intl.NumberFormat('tr-TR', { 
  style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 
}).format(val);


const exportToExcel = () => {
  if (!filteredPayrolls.value || filteredPayrolls.value.length === 0) {
    alert("İndirilecek veri bulunamadı.");
    return;
  }

  // Veriyi Excel'e uygun formata dönüştür
  const data = filteredPayrolls.value.map(p => ({
    "Personel Adı": `${p.employee.firstName || ''} ${p.employee.lastName || ''}`,
    "Dönem": `${getMonthName(p.month) || ''} ${p.year || ''}`,
    "Net Maaş": Number(p.netSalary) || 0,
    "İşveren Maliyeti": Number(p.totalEmployerCost) || 0,
    "Ödeme Tarihi": p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('tr-TR') : ''
  }));

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BordroGecmisi");
    
    // Dosyayı oluştur ve indir
    XLSX.writeFile(workbook, "Bordro_Gecmisi.xlsx");
  } catch (error) {
    console.error("Excel indirme hatası:", error);
    alert("Excel dosyası oluşturulurken bir hata oluştu.");
  }
};
</script>