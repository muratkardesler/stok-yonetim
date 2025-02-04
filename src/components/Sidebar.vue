<template>
  <div class="sidebar-wrapper">
    <!-- Sidebar Toggle Button (Mobile) -->
    <button 
      @click="isOpen = !isOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-primary-500"
    >
      <i :class="['fas', isOpen ? 'fa-times' : 'fa-bars']"></i>
    </button>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed top-0 left-0 z-40 h-screen transition-transform',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      class="w-64 bg-white border-r border-gray-200 pt-4"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center p-4 mb-6">
        <h1 class="text-xl font-bold text-primary-600">STOK YÖNETİM</h1>
      </div>

      <!-- Navigation -->
      <nav class="space-y-1 px-3">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center px-4 py-3 text-sm font-medium rounded-lg',
            'transition-colors duration-200',
            $route.path === item.path
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
          ]"
        >
          <i :class="['fas fa-fw mr-3', item.icon]"></i>
          {{ item.name }}
        </router-link>
      </nav>

      <!-- User Profile -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-primary-600">{{ userInitials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userFullName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
          <button 
            @click="handleLogout" 
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Çıkış Yap"
          >
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div 
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden"
    ></div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'

export default {
  name: 'Sidebar',
  props: {
    userFullName: {
      type: String,
      required: true
    },
    userInitials: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    }
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const isOpen = ref(false)

    const menuItems = [
      { name: 'Güncel Durum', path: '/', icon: 'fa-chart-line' },
      { name: 'Satışlar', path: '/sales', icon: 'fa-shopping-cart' },
      { name: 'Stok', path: '/stock', icon: 'fa-box' },
      { name: 'Müşteriler', path: '/customers', icon: 'fa-users' }
    ]

    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        toast.success('Başarıyla çıkış yapıldı')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        toast.error('Çıkış yapılırken bir hata oluştu')
      }
    }

    return {
      isOpen,
      menuItems,
      handleLogout
    }
  }
}
</script> 