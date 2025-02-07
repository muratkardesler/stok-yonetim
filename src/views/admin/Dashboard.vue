<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
    
    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Toplam Kullanıcı -->
      <router-link 
        :to="{ name: 'AdminUsers' }"
        class="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-users text-blue-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
            Toplam
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.totalUsers }}</h3>
        <p class="text-sm text-gray-500">Toplam Kullanıcı</p>
      </router-link>

      <!-- Aktif Kullanıcı -->
      <router-link 
        :to="{ name: 'AdminUsers', query: { status: 'active' } }"
        class="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-user-check text-green-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">
            Aktif
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.activeUsers }}</h3>
        <p class="text-sm text-gray-500">Aktif Kullanıcı</p>
      </router-link>

      <!-- Süresi Dolan -->
      <router-link 
        :to="{ name: 'AdminUsers', query: { status: 'expired' } }"
        class="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-user-clock text-red-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">
            Süresi Dolan
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.expiredUsers }}</h3>
        <p class="text-sm text-gray-500">Süresi Biten Kullanıcı</p>
      </router-link>

      <!-- Bugünkü Yeni Kayıt -->
      <router-link 
        :to="{ name: 'AdminUsers', query: { status: 'new' } }"
        class="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-user-plus text-purple-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600">
            Yeni
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stats.newUsers }}</h3>
        <p class="text-sm text-gray-500">Bugünkü Yeni Kayıt</p>
      </router-link>
    </div>

    <!-- Son Aktiviteler -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Son Aktiviteler</h2>
      
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
        Henüz aktivite bulunmuyor
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="activity in recentActivities" 
             :key="activity.id" 
             class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="fas" :class="activity.icon"></i>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">{{ activity.user }}</h4>
              <p class="text-xs text-gray-500">{{ activity.action }}</p>
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ formatDate(activity.timestamp) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default {
  name: 'AdminDashboard',
  setup() {
    const toast = useToast()
    const loading = ref(true)
    const stats = reactive({
      totalUsers: 0,
      activeUsers: 0,
      expiredUsers: 0,
      newUsers: 0
    })
    const recentActivities = ref([])

    const loadStats = async () => {
      try {
        // Önce auth.users tablosundan email bilgisini de alarak profilleri çekelim
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            is_active,
            trial_end_date,
            created_at,
            role
          `)
          .eq('role', 'user')

        if (error) {
          console.error('Profile error:', error)
          throw error
        }

        // İstatistikleri hesapla
        if (profiles) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          stats.totalUsers = profiles.length
          stats.activeUsers = profiles.filter(p => p.is_active === true).length
          stats.expiredUsers = profiles.filter(p => p.is_active === false).length
          stats.newUsers = profiles.filter(p => {
            const createdAt = new Date(p.created_at)
            createdAt.setHours(0, 0, 0, 0)
            return createdAt.getTime() === today.getTime()
          }).length
        }
      } catch (error) {
        console.error('Error:', error)
        stats.totalUsers = 0
        stats.activeUsers = 0
        stats.expiredUsers = 0
        stats.newUsers = 0
      }
    }

    const loadActivities = async () => {
      try {
        const { data: activities, error } = await supabase
          .from('user_activities')
          .select(`
            id,
            action,
            created_at,
            profiles (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        recentActivities.value = activities?.map(activity => ({
          id: activity.id,
          user: activity.profiles ? 
            `${activity.profiles.first_name} ${activity.profiles.last_name}` : 
            'Sistem',
          action: activity.action,
          timestamp: activity.created_at,
          icon: getActionIcon(activity.action)
        })) || []

      } catch (error) {
        console.error('Error:', error)
        recentActivities.value = []
      }
    }

    const getActionIcon = (action) => {
      switch (action) {
        case 'login':
          return 'fa-sign-in-alt text-green-600'
        case 'logout':
          return 'fa-sign-out-alt text-yellow-600'
        case 'register':
          return 'fa-user-plus text-blue-600'
        case 'update':
          return 'fa-edit text-purple-600'
        case 'delete':
          return 'fa-trash-alt text-red-600'
        default:
          return 'fa-info-circle text-gray-600'
      }
    }

    const formatDate = (date) => {
      return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr })
    }

    const loadData = async () => {
      try {
        loading.value = true
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Oturum bulunamadı')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error || profile.role !== 'admin') {
          toast.error('Admin yetkisi gerekli')
          return
        }

        await loadStats()
        await loadActivities()
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Veriler yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadData() // Doğrudan loadData'yı çağır
    })

    return {
      stats,
      loading,
      recentActivities,
      formatDate
    }
  }
}
</script> 