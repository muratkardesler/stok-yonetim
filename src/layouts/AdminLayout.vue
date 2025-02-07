<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          FlowBridge Admin
        </span>
      </div>

      <!-- Navigation -->
      <nav class="mt-6">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
          :class="{ 'bg-blue-50 text-blue-600': isActive(item.path) }"
        >
          <i :class="['fas', item.icon, 'w-5 h-5']"></i>
          <span class="ml-3">{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- User Profile -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-blue-600">
              {{ userInitials }}
            </span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
            <p class="text-xs text-gray-500">Admin</p>
          </div>
          <button 
            @click="handleLogout" 
            class="ml-auto text-gray-400 hover:text-gray-600"
            title="Çıkış Yap"
          >
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Bar -->
      <header class="h-16 bg-white shadow-sm">
        <div class="h-full px-6 flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-900">
            {{ currentPageTitle }}
          </h1>
          <div class="flex items-center space-x-4">
            <button class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-bell"></i>
            </button>
            <button class="text-gray-400 hover:text-gray-600">
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'

export default {
  name: 'AdminLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()

    const menuItems = [
      {
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'fa-tachometer-alt'
      },
      {
        title: 'Kullanıcı Yönetimi',
        path: '/admin/users',
        icon: 'fa-users'
      },
      {
        title: 'Lisans Yönetimi',
        path: '/admin/licenses',
        icon: 'fa-key'
      },
      {
        title: 'Aktivite Logları',
        path: '/admin/logs',
        icon: 'fa-history'
      },
      {
        title: 'Sistem Ayarları',
        path: '/admin/settings',
        icon: 'fa-cog'
      }
    ]

    const currentPageTitle = computed(() => {
      const currentItem = menuItems.find(item => isActive(item.path))
      return currentItem ? currentItem.title : ''
    })

    const userInitials = ref('AD')
    const userName = ref('Admin')

    const isActive = (path) => {
      if (path === '/admin') {
        return route.path === '/admin'
      }
      return route.path.startsWith(path)
    }

    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        router.push('/login')
        toast.success('Başarıyla çıkış yapıldı')
      } catch (error) {
        console.error('Error logging out:', error)
        toast.error('Çıkış yapılırken bir hata oluştu')
      }
    }

    return {
      menuItems,
      currentPageTitle,
      userInitials,
      userName,
      isActive,
      handleLogout
    }
  }
}
</script> 