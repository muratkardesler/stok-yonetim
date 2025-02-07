<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Aktivite Logları</h1>
        <p class="mt-1 text-sm text-gray-500">Sistem ve kullanıcı aktivitelerini görüntüleyin</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="exportLogs"
          class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <i class="fas fa-download mr-2"></i>
          Dışa Aktar
        </button>
        <button
          @click="clearLogs"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <i class="fas fa-trash-alt mr-2"></i>
          Logları Temizle
        </button>
      </div>
    </div>

    <!-- Filtreler -->
    <div class="mb-6 bg-white rounded-xl shadow-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Kullanıcı
          </label>
          <select
            v-model="filters.userId"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tüm Kullanıcılar</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.first_name }} {{ user.last_name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            İşlem Tipi
          </label>
          <select
            v-model="filters.action"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tüm İşlemler</option>
            <option value="login">Giriş</option>
            <option value="logout">Çıkış</option>
            <option value="register">Kayıt</option>
            <option value="update">Güncelleme</option>
            <option value="delete">Silme</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            v-model="filters.startDate"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            v-model="filters.endDate"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Log Listesi -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih/Saat
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlem
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detay
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Adresi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ getUserInitials(log.user) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ log.user ? log.user.first_name + ' ' + log.user.last_name : 'Sistem' }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ log.user ? log.user.email : '' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getActionClass(log.action)
                ]">
                  {{ getActionText(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.details }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.ip_address }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Önceki
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Toplam <span class="font-medium">{{ totalLogs }}</span> kayıttan
                <span class="font-medium">{{ startIndex + 1 }}</span> -
                <span class="font-medium">{{ endIndex }}</span> arası gösteriliyor
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium',
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default {
  name: 'AdminLogs',
  setup() {
    const toast = useToast()
    const users = ref([])
    const logs = ref([])
    const currentPage = ref(1)
    const itemsPerPage = 10

    const filters = ref({
      userId: '',
      action: '',
      startDate: '',
      endDate: ''
    })

    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name')

        if (error) throw error
        users.value = data
      } catch (error) {
        console.error('Error loading users:', error)
        toast.error('Kullanıcılar yüklenirken bir hata oluştu')
      }
    }

    const loadLogs = async () => {
      try {
        let query = supabase
          .from('user_activities')
          .select('*, profiles(id, first_name, last_name, email)')
          .order('created_at', { ascending: false })

        if (filters.value.userId) {
          query = query.eq('user_id', filters.value.userId)
        }
        if (filters.value.action) {
          query = query.eq('action', filters.value.action)
        }
        if (filters.value.startDate) {
          query = query.gte('created_at', filters.value.startDate)
        }
        if (filters.value.endDate) {
          query = query.lte('created_at', filters.value.endDate)
        }

        const { data, error } = await query

        if (error) throw error
        logs.value = data
      } catch (error) {
        console.error('Error loading logs:', error)
        toast.error('Loglar yüklenirken bir hata oluştu')
      }
    }

    const filteredLogs = computed(() => {
      return logs.value
    })

    const totalLogs = computed(() => filteredLogs.value.length)
    const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage))
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalLogs.value))

    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages.value; i++) {
        if (
          i === 1 ||
          i === totalPages.value ||
          (i >= currentPage.value - delta && i <= currentPage.value + delta)
        ) {
          range.push(i)
        }
      }

      range.forEach(i => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    })

    const getUserInitials = (user) => {
      if (!user) return 'S'
      return (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    }

    const getActionClass = (action) => {
      switch (action) {
        case 'login':
          return 'bg-green-100 text-green-800'
        case 'logout':
          return 'bg-yellow-100 text-yellow-800'
        case 'register':
          return 'bg-blue-100 text-blue-800'
        case 'update':
          return 'bg-purple-100 text-purple-800'
        case 'delete':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const getActionText = (action) => {
      switch (action) {
        case 'login':
          return 'Giris'
        case 'logout':
          return 'Cikis'
        case 'register':
          return 'Kayit'
        case 'update':
          return 'Guncelleme'
        case 'delete':
          return 'Silme'
        default:
          return action
      }
    }

    const formatDate = (date) => {
      return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr })
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const goToPage = (page) => {
      currentPage.value = page
    }

    const exportLogs = () => {
      const csvContent = [
        ['Tarih/Saat', 'Kullanici', 'Islem', 'Detay', 'IP Adresi'].join(','),
        ...filteredLogs.value.map(log => [
          formatDate(log.created_at),
          log.user ? (log.user.first_name + ' ' + log.user.last_name) : 'Sistem',
          getActionText(log.action),
          log.details,
          log.ip_address
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'aktivite_loglari_' + format(new Date(), 'yyyy-MM-dd') + '.csv'
      link.click()
    }

    const clearLogs = async () => {
      if (!confirm('Tüm logları silmek istediğinizden emin misiniz?')) {
        return
      }

      try {
        const { error } = await supabase
          .from('user_activities')
          .delete()
          .lt('created_at', new Date().toISOString())

        if (error) throw error

        toast.success('Loglar başarıyla temizlendi')
        await loadLogs()
      } catch (error) {
        console.error('Error clearing logs:', error)
        toast.error('Loglar temizlenirken bir hata oluştu')
      }
    }

    watch(filters, () => {
      currentPage.value = 1
      loadLogs()
    })

    onMounted(() => {
      loadUsers()
      loadLogs()
    })

    return {
      users,
      filters,
      filteredLogs,
      currentPage,
      totalLogs,
      totalPages,
      startIndex,
      endIndex,
      displayedPages,
      getUserInitials,
      getActionClass,
      getActionText,
      formatDate,
      prevPage,
      nextPage,
      goToPage,
      exportLogs,
      clearLogs
    }
  }
}
</script> 