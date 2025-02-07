<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transition-all duration-300 transform">
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-6 bg-gray-800">
        <router-link to="/admin/dashboard" class="flex items-center space-x-2">
          <span class="text-xl font-bold text-white">FlowBridge</span>
          <span class="px-2 py-1 text-xs bg-blue-600 rounded-lg text-white">Admin</span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="px-4 py-6 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
            $route.path === item.path
              ? 'bg-gray-800 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          ]"
        >
          <i :class="['fas fa-fw text-lg mr-3', item.icon]"></i>
          {{ item.name }}
          <span
            v-if="item.badge"
            :class="[
              'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
              item.badge.variant === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            ]"
          >
            {{ item.badge.text }}
          </span>
        </router-link>
      </nav>

      <!-- Admin Profile -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <span class="text-sm font-medium text-white">{{ userInitials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ userFullName }}</p>
            <p class="text-xs text-gray-400 truncate">Yönetici</p>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-gray-400 hover:text-white transition-colors"
            title="Çıkış Yap"
          >
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Bar -->
      <header class="h-16 bg-white shadow-sm">
        <div class="h-full px-6 flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-800">
            {{ currentPageTitle }}
          </h1>
          <div class="flex items-center space-x-4">
            <button
              class="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Bildirimleri Görüntüle"
            >
              <i class="fas fa-bell"></i>
            </button>
            <button
              class="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Ayarlar"
            >
              <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'

export default {
  name: 'AdminLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()

    const userFullName = ref('')
    const userInitials = ref('')

    const menuItems = [
      {
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'fa-chart-line'
      },
      {
        name: 'Kullanıcı Yönetimi',
        path: '/admin/users',
        icon: 'fa-users'
      },
      {
        name: 'Lisans Yönetimi',
        path: '/admin/licenses',
        icon: 'fa-key'
      },
      {
        name: 'Aktivite Logları',
        path: '/admin/logs',
        icon: 'fa-history'
      },
      {
        name: 'Sistem Ayarları',
        path: '/admin/settings',
        icon: 'fa-cog'
      }
    ]

    const currentPageTitle = computed(() => {
      const currentItem = menuItems.find(item => item.path === route.path)
      return currentItem ? currentItem.name : ''
    })

    const loadAdminInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        if (profile.role !== 'admin') {
          toast.error('Bu sayfaya erişim yetkiniz yok')
          router.push('/dashboard')
          return
        }

        userFullName.value = `${profile.first_name} ${profile.last_name}`
        userInitials.value = `${profile.first_name[0]}${profile.last_name[0]}`
      } catch (error) {
        console.error('Error loading admin info:', error)
        toast.error('Profil bilgileri yüklenirken bir hata oluştu')
      }
    }

    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        toast.success('Başarıyla çıkış yapıldı')
        router.push('/admin/login')
      } catch (error) {
        console.error('Logout error:', error)
        toast.error('Çıkış yapılırken bir hata oluştu')
      }
    }

    onMounted(() => {
      loadAdminInfo()
    })

    return {
      menuItems,
      currentPageTitle,
      userFullName,
      userInitials,
      handleLogout
    }
  }
}
</script> 