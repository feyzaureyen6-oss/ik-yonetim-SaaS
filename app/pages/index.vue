<template>
  <div>
    <v-row class="mb-6" align="center" justify="space-between">
      <v-col cols="auto">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3 d-flex align-center">
          <v-icon icon="mdi-domain" class="mr-3" color="primary"></v-icon>
          Departman Yönetimi
        </h1>
        <p class="text-subtitle-1 text-grey-600 mt-1">Şirket organizasyon yapısını düzenleyebilir, silebilir ve yönetebilirsiniz.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" size="large" class="text-none font-weight-bold" @click="openCreateDialog">
          Yeni Departman Ekle
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="1" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="departments"
        :loading="tableLoading"
        loading-text="Merkez istasyondan departmanlar çekiliyor..."
        no-data-text="Sistemde henüz kayıtlı departman bulunmuyor."
        class="elevation-0"
      >
        <!-- DÜZELTİLEN YER: Fonksiyonu burada sade bir şekilde çağırıyoruz -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.employeeCount="{ item }">
          <v-chip :color="item._count?.employees > 0 ? 'success' : 'amber-darken-2'" size="small" class="font-weight-bold" variant="flat">
            {{ item._count?.employees || 0 }} Personel
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="me-3" color="blue-darken-1" @click="openEditDialog(item)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" color="red-darken-1" @click="openDeleteDialog(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white d-flex align-center pa-4">
          <v-icon :icon="isEditMode ? 'mdi-pencil' : 'mdi-domain'" class="mr-2"></v-icon>
          <span>{{ isEditMode ? 'Departman Adını Güncelle' : 'Yeni Departman Tanımla' }}</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
            <v-text-field
              v-model="deptName"
              label="Departman Adı"
              variant="outlined"
              density="comfortable"
              :rules="nameRules"
              prepend-inner-icon="mdi-rename-box"
              required
            />
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end">
          <v-btn variant="text" color="grey-darken-1" @click="closeDialog" class="text-none">İptal</v-btn>
          <v-btn color="primary" variant="flat" :loading="submitLoading" :disabled="!isFormValid" @click="handleSubmit" class="text-none px-4">
            {{ isEditMode ? 'Güncelle' : 'Kaydet' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="450px">
      <v-card rounded="lg">
        <v-card-title class="bg-red-darken-1 text-white d-flex align-center pa-4">
          <v-icon icon="mdi-alert" class="mr-2"></v-icon>
          <span>Departmanı Sil?</span>
        </v-card-title>
        <v-card-text class="pa-4 text-body-1 text-grey-darken-3">
          <strong>"{{ selectedDept?.name }}"</strong> departmanını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </v-card-text>
        <v-card-actions class="pa-4 justify-end">
          <v-btn variant="text" color="grey-darken-1" @click="deleteDialog = false" class="text-none">İptal</v-btn>
          <v-btn color="error" variant="flat" :loading="submitLoading" @click="handleDelete" class="text-none px-4">
            Evet, Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right" rounded="pill">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Merkez ağ bağlantısı
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = useApi()

// Reaktif Durumlar
const departments = ref([])
const dialog = ref(false)
const deleteDialog = ref(false)
const tableLoading = ref(false)
const submitLoading = ref(false)
const isFormValid = ref(false)
const formRef = ref(null)

// Form Mod Kontrolleri
const isEditMode = ref(false)
const selectedDept = ref(null)
const deptName = ref('')

const snackbar = ref({ show: false, text: '', color: '' })

// Tablo Başlıkları
const headers = [
  { title: 'Departman Adı', key: 'name', align: 'start', sortable: true },
  { title: 'Kayıt Tarihi', key: 'createdAt', align: 'center' },
  { title: 'Aktif Personel Sayısı', key: 'employeeCount', align: 'center', sortable: true },
  { title: 'İşlemler', key: 'actions', align: 'end', sortable: false }
]

// Validasyon Kuralı
const nameRules = [v => !!v || 'Departman adı zorunludur!']

// EKLEDİĞİMİZ FONKSİYON: Tarih formatlama işini güvenli alana çektik
const formatDate = (dateValue) => {
  if (!dateValue) return '-'
  return new Date(dateValue).toLocaleDateString('tr-TR')
}

// Tüm Departmanları Çeken Fonksiyon
const fetchAllDepartments = async () => {
  tableLoading.value = true
  try {
    departments.value = await getDepartments()
  } catch (err) {
    showNotify('Veriler yüklenirken merkez ağda bir sorun oluştu.', 'error')
  } finally {
    tableLoading.value = false
  }
}

// Ekleme Modunu Açan Fonksiyon
const openCreateDialog = () => {
  isEditMode.value = false
  deptName.value = ''
  dialog.value = true
}

// Düzenleme Modunu Açan Fonksiyon
const openEditDialog = (item) => {
  isEditMode.value = true
  selectedDept.value = item
  deptName.value = item.name
  dialog.value = true
}

// Silme Onay Penceresini Açan Fonksiyon
const openDeleteDialog = (item) => {
  selectedDept.value = item
  deleteDialog.value = true
}

// KAYDET / GÜNCELLEME ORTAK YÖNETİCİSİ
const handleSubmit = async () => {
  if (!deptName.value.trim()) return

  submitLoading.value = true
  try {
    if (isEditMode.value) {
      await updateDepartment(selectedDept.value.id, deptName.value)
      showNotify('Departman adı başarıyla güncellendi.', 'success')
    } else {
      await createDepartment(deptName.value)
      showNotify('Yeni departman başarıyla kaydedildi.', 'success')
    }
    closeDialog()
    await fetchAllDepartments()
  } catch (error) {
    showNotify(error.message, 'error')
  } finally {
    submitLoading.value = false
  }
}

// SİLME TETİKLEYİCİSİ
const handleDelete = async () => {
  if (!selectedDept.value) return

  submitLoading.value = true
  try {
    await deleteDepartment(selectedDept.value.id)
    showNotify('Departman başarıyla silindi.', 'success')
    deleteDialog.value = false
    await fetchAllDepartments()
  } catch (error) {
    showNotify(error.message, 'error')
  } finally {
    submitLoading.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  deptName.value = ''
  selectedDept.value = null
  if (formRef.value) formRef.value.reset()
}

const showNotify = (text, color) => {
  snackbar.value = { show: true, text, color: color === 'success' ? 'green-darken-1' : 'red-darken-1' }
}

onMounted(() => {
  fetchAllDepartments()
})
</script>