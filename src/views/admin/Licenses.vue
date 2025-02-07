<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Lisans Yönetimi</h1>
        <p class="mt-1 text-sm text-gray-500">Kullanıcı lisanslarını ve deneme sürelerini yönetin</p>
      </div>
      <button
        @click="showNewLicenseModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <i class="fas fa-plus mr-2"></i>
        Yeni Lisans Oluştur
      </button>
    </div>

    <!-- Lisans Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <!-- Aktif Lisanslar -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">
            Aktif
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.activeLicenses }}</h3>
        <p class="text-sm text-gray-500">Aktif Lisans</p>
      </div>

      <!-- Deneme Süreleri -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-clock text-blue-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
            Deneme
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.trialLicenses }}</h3>
        <p class="text-sm text-gray-500">Deneme Süresi Devam Eden</p>
      </div>

      <!-- Süresi Bitenler -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-times-circle text-red-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">
            Süresi Biten
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.expiredLicenses }}</h3>
        <p class="text-sm text-gray-500">Süresi Biten Lisans</p>
      </div>
    </div>

    <!-- Lisans Listesi -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <!-- Arama ve Filtreler -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input 
              type="text"
              v-model="searchQuery"
              placeholder="Kullanıcı ara..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div class="flex gap-2">
            <select 
              v-model="statusFilter"
              class="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="trial">Deneme</option>
              <option value="expired">Süresi Bitmiş</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lisans Tablosu -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lisans Türü
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Başlangıç Tarihi
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bitiş Tarihi
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="license in filteredLicenses" :key="license.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ getUserInitials(license.user) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ license.user.first_name }} {{ license.user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ license.user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  license.type === 'trial' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ license.type === 'trial' ? 'Deneme' : 'Tam Sürüm' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(license.start_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(license.end_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getLicenseStatusClass(license)
                ]">
                  {{ getLicenseStatusText(license) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="extendLicense(license)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Süre Uzat
                </button>
                <button 
                  @click="revokeLicense(license)"
                  class="text-red-600 hover:text-red-900"
                >
                  İptal Et
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default {
  name: 'AdminLicenses',
  setup() {
    const toast = useToast()
    const searchQuery = ref('')
    const statusFilter = ref('')
    const showNewLicenseModal = ref(false)
    
    const stats = ref({
      activeLicenses: 0,
      trialLicenses: 0,
      expiredLicenses: 0
    })

    const licenses = ref([])

    const loadLicenses = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Profilleri lisans formatına dönüştür
        licenses.value = profiles.map(profile => ({
          id: profile.id,
          user: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email
          },
          type: profile.is_active ? 'full' : 'trial',
          start_date: profile.created_at,
          end_date: profile.trial_end_date,
          status: getLicenseStatus(profile)
        }))

        // İstatistikleri hesapla
        stats.value = {
          activeLicenses: profiles.filter(p => p.is_active).length,
          trialLicenses: profiles.filter(p => 
            !p.is_active && 
            p.trial_end_date && 
            new Date(p.trial_end_date) > new Date()
          ).length,
          expiredLicenses: profiles.filter(p => 
            !p.is_active && 
            (!p.trial_end_date || new Date(p.trial_end_date) <= new Date())
          ).length
        }

      } catch (error) {
        console.error('Error loading licenses:', error)
        toast.error('Lisanslar yüklenirken bir hata oluştu')
      }
    }

    const filteredLicenses = computed(() => {
      return licenses.value.filter(license => {
        const matchesSearch = 
          license.user.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          license.user.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          license.user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())

        if (!statusFilter.value) return matchesSearch

        return matchesSearch && license.status === statusFilter.value
      })
    })

    const getUserInitials = (user) => {
      return (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    }

    const getLicenseStatus = (profile) => {
      if (profile.is_active) return 'active'
      if (profile.trial_end_date && new Date(profile.trial_end_date) > new Date()) return 'trial'
      return 'expired'
    }

    const getLicenseStatusClass = (license) => {
      switch (license.status) {
        case 'active':
          return 'bg-green-100 text-green-800'
        case 'trial':
          return 'bg-blue-100 text-blue-800'
        case 'expired':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const getLicenseStatusText = (license) => {
      switch (license.status) {
        case 'active':
          return 'Aktif'
        case 'trial':
          return 'Deneme'
        case 'expired':
          return 'Süresi Dolmuş'
        default:
          return 'Bilinmiyor'
      }
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return format(new Date(date), 'dd MMM yyyy', { locale: tr })
    }

    const extendLicense = async (license) => {
      try {
        const newEndDate = new Date()
        newEndDate.setDate(newEndDate.getDate() + 30)

        const { error } = await supabase
          .from('profiles')
          .update({ 
            trial_end_date: newEndDate.toISOString(),
            is_active: true
          })
          .eq('id', license.id)

        if (error) throw error

        toast.success('Lisans süresi uzatıldı')
        await loadLicenses()
      } catch (error) {
        console.error('Error extending license:', error)
        toast.error('Lisans uzatılırken bir hata oluştu')
      }
    }

    const revokeLicense = async (license) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_active: false,
            trial_end_date: new Date().toISOString()
          })
          .eq('id', license.id)

        if (error) throw error

        toast.success('Lisans iptal edildi')
        await loadLicenses()
      } catch (error) {
        console.error('Error revoking license:', error)
        toast.error('Lisans iptal edilirken bir hata oluştu')
      }
    }

    onMounted(() => {
      loadLicenses()
    })

    return {
      searchQuery,
      statusFilter,
      showNewLicenseModal,
      stats,
      filteredLicenses,
      getUserInitials,
      getLicenseStatusClass,
      getLicenseStatusText,
      formatDate,
      extendLicense,
      revokeLicense
    }
  }
}
</script> 