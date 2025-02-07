<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Kullanıcı Yönetimi</h1>
    
    <!-- Kullanıcı Listesi -->
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
              <option value="inactive">İnaktif</option>
              <option value="expired">Süresi Dolmuş</option>
              <option value="new">Bugün Kayıt Olan</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Kullanıcı Tablosu -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-posta
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deneme Süresi
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Giriş
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ getUserInitials(user) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.company_email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusClass(user)
                ]">
                  {{ getStatusText(user) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.trial_end_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.last_sign_in_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="toggleUserStatus(user)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  {{ user.is_active ? 'Deaktif Et' : 'Aktif Et' }}
                </button>
                <button 
                  @click="extendTrial(user)"
                  class="text-green-600 hover:text-green-900"
                >
                  Süre Uzat
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
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import { format, isAfter } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useRoute } from 'vue-router'

export default {
  name: 'Users',
  setup() {
    const toast = useToast()
    const route = useRoute()
    const users = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const loading = ref(false)

    // URL'den gelen status parametresini kontrol et
    watch(() => route.query.status, (newStatus) => {
      if (newStatus) {
        statusFilter.value = newStatus
      }
    }, { immediate: true })

    const loadUsers = async () => {
      try {
        loading.value = true
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            company_name,
            company_email,
            phone,
            is_active,
            role,
            trial_end_date,
            created_at
          `)
          .eq('role', 'user')
          .order('created_at', { ascending: false })

        if (error) throw error

        users.value = data
        console.log('Loaded users:', users.value)
      } catch (error) {
        console.error('Error loading users:', error)
        toast.error('Kullanıcılar yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesSearch = 
          user.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.company_email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.company_name?.toLowerCase().includes(searchQuery.value.toLowerCase())

        if (!statusFilter.value) return matchesSearch

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const isExpired = user.trial_end_date && isAfter(new Date(), new Date(user.trial_end_date))
        const isNewUser = user.created_at && isAfter(new Date(user.created_at), today)

        switch (statusFilter.value) {
          case 'active':
            return matchesSearch && user.is_active
          case 'inactive':
            return matchesSearch && !user.is_active
          case 'expired':
            return matchesSearch && isExpired && !user.is_active
          case 'new':
            return matchesSearch && isNewUser
          default:
            return matchesSearch
        }
      })
    })

    const getUserInitials = (user) => {
      return (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    }

    const getStatusClass = (user) => {
      if (!user.is_active) return 'bg-gray-100 text-gray-800'
      if (user.trial_end_date && isAfter(new Date(), new Date(user.trial_end_date))) {
        return 'bg-red-100 text-red-800'
      }
      return 'bg-green-100 text-green-800'
    }

    const getStatusText = (user) => {
      if (!user.is_active) return 'İnaktif'
      if (user.trial_end_date && isAfter(new Date(), new Date(user.trial_end_date))) {
        return 'Süresi Dolmuş'
      }
      return 'Aktif'
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr })
    }

    const toggleUserStatus = async (user) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: !user.is_active })
          .eq('id', user.id)

        if (error) throw error

        await loadUsers()
        toast.success(user.is_active ? 'Kullanıcı deaktif edildi' : 'Kullanıcı aktif edildi')
      } catch (error) {
        console.error('Error toggling user status:', error)
        toast.error('İşlem sırasında bir hata oluştu')
      }
    }

    const extendTrial = async (user) => {
      try {
        const newTrialEnd = new Date()
        newTrialEnd.setDate(newTrialEnd.getDate() + 30)

        const { error } = await supabase
          .from('profiles')
          .update({ 
            trial_end_date: newTrialEnd.toISOString(),
            is_active: true
          })
          .eq('id', user.id)

        if (error) throw error

        await loadUsers()
        toast.success('Deneme süresi 30 gün uzatıldı')
      } catch (error) {
        console.error('Error extending trial:', error)
        toast.error('Süre uzatılırken bir hata oluştu')
      }
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      searchQuery,
      statusFilter,
      filteredUsers,
      getUserInitials,
      getStatusClass,
      getStatusText,
      formatDate,
      toggleUserStatus,
      extendTrial
    }
  }
}
</script> 