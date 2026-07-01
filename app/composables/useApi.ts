// ============================================================================
// 🗺️ MERKEZİ VERİ DAĞITIM AĞI (COMPOSABLES MİMARİSİ)
// ============================================================================
// Not: Bu dosya bizim projedeki merkezi veri çekme istasyonumuzdur.
// Veriler burada tek bir kanaldan çekilir ve ihtiyacı olan sayfalara (Pages) dağıtılır.
// Sayfaların içine uzun uzun veri çekme kodları yazıp kalabalık yapmayız;
// Sayfa sadece bu ağa bağlanır ve "bana departmanları ver" diyerek veriyi çeker.
// ============================================================================

import { PrismaClient } from '@prisma/client'

// 🏢 Veri Merkezinden Dağıtılacak Departman Verisinin Şablonu (TypeScript Tipi)
export interface Department {
  id: string
  name: string
  _count?: {
    employees: number // İlişkisel veri: Bu departmandaki toplam personel sayısı
  }
  createdAt: string
}

export const useApi = () => {
  // --------------------------------------------------------------------------
  // ⚡ YENİ EK: Toplu Ödeme İstasyonu
  // --------------------------------------------------------------------------
  const bulkPay = async (ids: number[]) => {
    return await $fetch('/api/payroll/bulk-pay', {
      method: 'POST',
      body: { ids }
    });
  };
  // --------------------------------------------------------------------------
  // 🛒 DAĞITIM KANALI 1: Tüm Departmanları Getiren İstasyon (GET)
  // --------------------------------------------------------------------------
  const getDepartments = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: Department[] }>('/api/departments')
      return response.success ? response.data : []
    } catch (error) {
      console.error('Merkez İstasyon Hatası - Departmanlar yüklenemedi:', error)
      return []
    }
  }

  // --------------------------------------------------------------------------
  // 📥 DAĞITIM KANALI 2: Yeni Departman Kaydeden İstasyon (POST)
  // --------------------------------------------------------------------------
  const createDepartment = async (name: string) => {
    return await $fetch<{ success: boolean; message: string; data: Department }>('/api/departments', {
      method: 'POST',
      body: { name }
    })
  }

  // ✏️ DAĞITIM KANALI 2.1: Departman Güncelleyen İstasyon (PUT)
  const updateDepartment = async (id: string, name: string) => {
    return await $fetch<{ success: boolean; data: Department }>(`/api/departments/${id}`, {
      method: 'PUT',
      body: { name }
    })
  }

  // ❌ DAĞITIM KANALI 2.2: Departman Silen İstasyon (DELETE)
  const deleteDepartment = async (id: string) => {
    // Feyza'nın Notu: Eğer departmana bağlı personel varsa backend "Bu departmanda personel var, silemezsin!" diyecek.
    return await $fetch<{ success: boolean; message: string }>(`/api/departments/${id}`, {
      method: 'DELETE'
    })
  }

  // --------------------------------------------------------------------------
  // 👥 DAĞITIM KANALI 3: Tüm Personelleri Getiren İstasyon (GET)
  // --------------------------------------------------------------------------
  const getEmployees = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: any[] }>('/api/employees')
      return response.success ? response.data : []
    } catch (error) {
      console.error('Personeller yüklenirken merkez ağda hata:', error)
      return []
    }
  }

  // --------------------------------------------------------------------------
  // 📥 DAĞITIM KANALI 4: Yeni Personel İşe Alan İstasyon (POST)
  // --------------------------------------------------------------------------
  const createEmployee = async (employeeData: any) => {
    return await $fetch<{ success: boolean; message: string; data: any }>('/api/employees', {
      method: 'POST',
      body: employeeData
    })
  }

  // ✏️ DAĞITIM KANALI 4.1: Personel Bilgilerini Güncelleyen İstasyon (PUT)
  const updateEmployee = async (id: string, employeeData: any) => {
    return await $fetch<{ success: boolean; data: any }>(`/api/employees/${id}`, {
      method: 'PUT',
      body: employeeData
    })
  }

  // ❌ DAĞITIM KANALI 4.2: Personeli Sistemden Silen İstasyon (DELETE)
  const deleteEmployee = async (id: string) => {
    // Feyza Notu: Eğer bu personele ait geçmiş bir maaş bordrosu varsa veritabanı patlamasın diye backend bizi uyaracak.
    return await $fetch<{ success: boolean; message: string }>(`/api/employees/${id}`, {
      method: 'DELETE'
    })
  }

  // --------------------------------------------------------------------------
  // 💵 DAĞITIM KANALI 5: Tüm Bordroları Getiren İstasyon (GET)
  // --------------------------------------------------------------------------
  const getPayrolls = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: any[] }>('/api/payrolls')
      return response.success ? response.data : []
    } catch (error) {
      console.error('Bordrolar yüklenirken merkez ağda hata:', error)
      return []
    }
  }

  // --------------------------------------------------------------------------
  // 📥 DAĞITIM KANALI 6: Yeni Bordro/Maaş Hesaplayan İstasyon (POST)
  // --------------------------------------------------------------------------
  const createPayroll = async (payrollData: any) => {
    return await $fetch<{ success: boolean; message: string; data: any }>('/api/payrolls', {
      method: 'POST',
      body: payrollData
    })
  }

  // ✏️ DAĞITIM KANALI 6.1: Bordro Kaydını Güncelleyen İstasyon (PUT)
  const updatePayroll = async (id: string, payrollData: any) => {
    return await $fetch<{ success: boolean; data: any }>(`/api/payrolls/${id}`, {
      method: 'PUT',
      body: payrollData
    })
  }

  // ❌ DAĞITIM KANALI 6.2: Bordroyu İptal Eden/Silen İstasyon (DELETE)
  const deletePayroll = async (id: string) => {
    return await $fetch<{ success: boolean; message: string }>(`/api/payrolls/${id}`, {
      method: 'DELETE'
    })
  }

  // ============================================================================
  // 🔑 SERVİS MASASI: Yukarıda yazdığımız uzman istasyonları sayfaların (Pages) 
  // kullanımına açıyoruz. Sayfa sadece çağırmak istediğini buradan seçecek.
  // ============================================================================
  return {
    bulkPay,
    getDepartments,
    createDepartment,
    updateDepartment, 
    deleteDepartment,
    getEmployees, 
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getPayrolls, 
    createPayroll,
    updatePayroll,
    deletePayroll
  }
}