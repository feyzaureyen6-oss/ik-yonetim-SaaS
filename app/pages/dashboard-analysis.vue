<template>
  <v-container fluid class="pa-6">
    <h2 class="text-h4 mb-6 font-weight-bold text-indigo-darken-4">Finansal Analiz Paneli</h2>

    <v-row dense class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 border-start border-xl border-indigo-darken-3" elevation="1" height="100">
          <div class="text-caption text-indigo-darken-3 font-weight-bold">YILLIK TOPLAM NET ÖDEME</div>
          <div class="text-h4 font-weight-bold mt-1 text-indigo-darken-4">{{ formatMoney(totalAnnualNet) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 border-start border-xl border-orange-darken-2" elevation="1" height="100">
          <div class="text-caption text-orange-darken-2 font-weight-bold">YILLIK TOPLAM MALİYET</div>
          <div class="text-h4 font-weight-bold mt-1 text-orange-darken-3">{{ formatMoney(totalAnnualCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 border-start border-xl border-teal-darken-2" elevation="1" height="100">
          <div class="text-caption text-teal-darken-2 font-weight-bold">ORTALAMA PERSONEL MALİYETİ</div>
          <div class="text-h4 font-weight-bold mt-1 text-teal-darken-3">{{ formatMoney(avgPersonelCost) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="pa-5" elevation="1">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6 font-weight-medium">Dönemsel Ödeme Trendi</h3>
            <v-select
  v-model="selectedYear"
  :items="years"
  label="Yıl Seç"
  variant="outlined"
  density="compact"
  style="max-width: 120px;"
></v-select>
          </div>

          <client-only>
            <div v-if="payrolls && payrolls.length > 0">
              <VueApexCharts type="area" :options="chartOptions" :series="chartSeries" height="350" />
            </div>
            <div v-else class="d-flex flex-column justify-center align-center" style="height: 350px;">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-bar-off</v-icon>
              <p class="text-grey mt-2">Analiz edilecek bordro verisi bulunamadı.</p>
            </div>
          </client-only>
        </v-card>
      </v-col>
    </v-row>

    
  </v-container>


  <v-row class="mt-4">
  <v-col cols="12" md="6">
    <v-card class="pa-5" elevation="1">
      <h3 class="text-h6 mb-4">Departman Bazlı Maliyet Dağılımı</h3>
      <client-only>
        <VueApexCharts type="donut" :options="deptChartOptions" :series="departmentCosts.series" height="300" />
      </client-only>
    </v-card>
  </v-col>
  
  <v-col cols="12" md="6">
    <v-card class="pa-5" elevation="1" height="100%">
      <h3 class="text-h6 mb-4">Maliyet Özetleri</h3>
      <v-list density="compact">
        <v-list-item v-for="(val, index) in departmentCosts.labels" :key="index">
          <v-list-item-title>{{ val }}</v-list-item-title>
          <template v-slot:append>
            <span class="font-weight-bold">{{ formatMoney(departmentCosts.series[index]) }}</span>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-col>


  <v-col cols="12" md="12" class="mt-4">
  <v-card class="pa-5" elevation="1">
    <h3 class="text-h6 mb-4">Departman Maaş Analizi (Min / Max / Ort)</h3>
    <v-table density="compact">
      <thead>
        <tr>
          <th>Departman</th>
          <th class="text-right">Min Maaş</th>
          <th class="text-right">Ort Maaş</th>
          <th class="text-right">Max Maaş</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in departmentMetrics" :key="item.name">
          <td>{{ item.name }}</td>
          <td class="text-right">{{ formatMoney(item.min) }}</td>
          <td class="text-right font-weight-bold">{{ formatMoney(item.avg) }}</td>
          <td class="text-right">{{ formatMoney(item.max) }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</v-col>
</v-row>

<v-divider class="my-8"></v-divider>

<v-row>
  <v-col cols="12">
    <h3 class="text-h5 mb-4">Personel Detaylı Maaş Analizi</h3>
  </v-col>
  
  <v-col cols="12" md="6">
    <v-select v-model="selectedDept" :items="departments" label="Departman Seç" variant="outlined" clearable @update:model-value="selectedEmployee = null" />
  </v-col>
  
  <v-col cols="12" md="6">
    <v-select v-model="selectedEmployee" :items="employeesInDept" item-title="name" item-value="id" label="Personel Seç" variant="outlined" :disabled="!selectedDept" />
  </v-col>
</v-row>

<v-row v-if="selectedEmployee">
  <v-col cols="12">
    <v-card class="pa-5" elevation="2">
      <h4 class="text-h6 mb-4">Seçili Personel Maaş Trendi</h4>
      <client-only>
        <VueApexCharts type="line" :options="employeeChartOptions" :series="employeeChartSeries" height="300" />
      </client-only>
    </v-card>
  </v-col>
</v-row>
</template>
<script setup>
import VueApexCharts from "vue3-apexcharts";

// 1. Veri Çekme
const { data: payrolls } = await useFetch('/api/payrolls/history');

// 2. Yıl Filtresi State'i
const selectedYear = ref(new Date().getFullYear());

// 3. Yıl Seçenekleri
const years = computed(() => {
  const availableYears = [...new Set(payrolls.value?.map(p => p.year) || [])];
  return availableYears.sort((a, b) => b - a);
});

// 4. Filtrelenmiş Bordrolar (Tüm hesaplamaların merkezi)
const filteredPayrolls = computed(() => {
  return payrolls.value?.filter(p => p.year === selectedYear.value) || [];
});

// 5. Temel Hesaplamalar (Artık filteredPayrolls kullanıyor)
const totalAnnualNet = computed(() => filteredPayrolls.value.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0));
const totalAnnualCost = computed(() => filteredPayrolls.value.reduce((sum, p) => sum + (Number(p.totalEmployerCost) || 0), 0));
const avgPersonelCost = computed(() => (filteredPayrolls.value.length ? totalAnnualCost.value / filteredPayrolls.value.length : 0));

// 6. Grafik Verisini Aylara Göre Gruplama
const chartSeries = computed(() => {
  const monthlyNet = new Array(12).fill(0);
  const monthlyCost = new Array(12).fill(0);

  filteredPayrolls.value.forEach(p => {
    const monthIndex = Number(p.month) - 1; 
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyNet[monthIndex] += Number(p.netSalary) || 0;
      monthlyCost[monthIndex] += Number(p.totalEmployerCost) || 0;
    }
  });

  return [
    { name: 'Net Maaş', data: monthlyNet },
    { name: 'Toplam Maliyet', data: monthlyCost }
  ];
});

// 7. Departman Analizleri (Min/Max/Ort & Dağılım)
const departmentCosts = computed(() => {
  const deptMap = {};
  filteredPayrolls.value.forEach(p => {
    const deptName = p.employee?.department?.name || 'Belirtilmemiş'; 
    const cost = Number(p.totalEmployerCost) || 0;
    deptMap[deptName] = (deptMap[deptName] || 0) + cost;
  });
  return { labels: Object.keys(deptMap), series: Object.values(deptMap) };
});

const departmentMetrics = computed(() => {
  const deptMap = {};
  filteredPayrolls.value.forEach(p => {
    const dept = p.employee?.department?.name || 'Belirtilmemiş';
    const net = Number(p.netSalary) || 0;
    if (!deptMap[dept]) deptMap[dept] = { min: net, max: net, total: 0, count: 0 };
    deptMap[dept].min = Math.min(deptMap[dept].min, net);
    deptMap[dept].max = Math.max(deptMap[dept].max, net);
    deptMap[dept].total += net;
    deptMap[dept].count += 1;
  });
  return Object.keys(deptMap).map(name => ({
    name,
    min: deptMap[name].min,
    max: deptMap[name].max,
    avg: deptMap[name].total / deptMap[name].count
  }));
});

// 8. Grafik Ayarları
// Grafik Ayarları - Lütfen bu bloğu mevcut chartOptions değişkeninle tamamen değiştir
const chartOptions = {
  chart: { 
    type: 'area', 
    toolbar: { show: true, tools: { download: true } },
    zoom: { enabled: false }
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#3949AB', '#FB8C00'],
  xaxis: { categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'] },
  
  // EKSİK OLAN KISIM: Y Ekseni ölçeğini temizle
  yaxis: {
    labels: {
      formatter: (val) => {
        return val.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
      }
    }
  },
  // BURAYI EKLE: Grafiğin üzerindeki rakamları formatlar
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY', 
        maximumFractionDigits: 0 
      }).format(val);
    },
    style: {
      fontSize: '10px' // Rakamlar çok büyükse buradan küçültebilirsin
    }
  },
  // EKSİK OLAN KISIM: Üstündeki etiketleri temizle
  tooltip: { 
    y: { 
      formatter: (val) => new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        maximumFractionDigits: 0 
      }).format(val) 
    } 
  }

  
};
const deptChartOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: departmentCosts.value.labels,
  legend: { position: 'bottom' }
}));
const formatMoney = (val) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0, // Kuruş yoksa gösterme
    maximumFractionDigits: 0  // Virgülden sonra maksimum basamak sayısı
  }).format(val);
};
// ... Mevcut kodların altına ekle

// Personel Filtreleme için State
const selectedDept = ref(null);
const selectedEmployee = ref(null);

// Departman listesini sadece filtrelenmiş yıl verisinden al
const departments = computed(() => {
  const depts = new Set(filteredPayrolls.value?.map(p => p.employee?.department?.name).filter(Boolean));
  return Array.from(depts);
});

// Departmana göre personel filtrele
const employeesInDept = computed(() => {
  if (!selectedDept.value) return [];
  const empsMap = new Map();
  filteredPayrolls.value.forEach(p => {
    if (p.employee?.department?.name === selectedDept.value) {
      empsMap.set(p.employee.id, `${p.employee.firstName} ${p.employee.lastName}`);
    }
  });
  return Array.from(empsMap, ([id, name]) => ({ id, name }));
});

// Seçili personelin maaş trendi
const employeeChartSeries = computed(() => {
  if (!selectedEmployee.value) return [];
  const empPayrolls = filteredPayrolls.value
    .filter(p => p.employeeId === selectedEmployee.value)
    .sort((a, b) => a.month - b.month);
    
  return [{ 
    name: 'Net Maaş', 
    data: empPayrolls.map(p => Number(p.netSalary)) ,
     style: 'currency', 
        currency: 'TRY',
  }];
});

// Personel grafiği için eksenler (Aylar)
// Personel grafiği ayarları
const employeeChartOptions = computed(() => ({
  chart: { 
    type: 'line', 
    zoom: { enabled: false }, 
    toolbar: { show: true, tools: { download: true } } 
  },
  // Y EKSENİNİ FORMATLA (Para birimi gösterimi)
  yaxis: {
    labels: {
      formatter: (val) => new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY', 
        maximumFractionDigits: 0 
      }).format(val)
    }
  },
  // ÜZERİNE GELİNCE ÇIKAN KUTUCUĞU FORMATLA
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY', 
        maximumFractionDigits: 0 
      }).format(val)
    }
  },
  xaxis: { 
    categories: filteredPayrolls.value
      .filter(p => p.employeeId === selectedEmployee.value)
      .sort((a, b) => a.month - b.month)
      .map(p => p.month + ". Ay") 
  }
}));
// Bunu script'in herhangi bir yerine ekle
const moneyFormatter = (val) => new Intl.NumberFormat('tr-TR', { 
  style: 'currency', currency: 'TRY', maximumFractionDigits: 0 
}).format(val);
</script>