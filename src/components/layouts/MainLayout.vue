<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Menu Button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" 
              class="p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-primary-600 focus:outline-none">
        <i :class="['fas', isMobileMenuOpen ? 'fa-times' : 'fa-bars']"></i>
      </button>
    </div>

    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform',
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]">
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            FlowBridge
          </span>
        </router-link>
        <button @click="isMobileMenuOpen = false" 
                class="lg:hidden p-2 text-gray-600 hover:text-primary-600">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <template v-for="item in menuItems" :key="item.path || item.name">
          <!-- Normal Menu Item -->
          <router-link 
            v-if="!item.isDropdown"
            :to="item.path"
            :class="[
              'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
              $route.path === item.path
                ? 'bg-primary-50 text-primary-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
            ]"
            @click="isMobileMenuOpen = false"
          >
            <i :class="['fas fa-fw text-lg mr-3', item.icon]"></i>
            {{ item.name }}
            <span v-if="item.badge" 
                  :class="[
                    'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
                    item.badge.variant === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'
                  ]">
              {{ item.badge.text }}
            </span>
          </router-link>

          <!-- Dropdown Menu Item -->
          <div v-else class="space-y-1">
            <button 
              @click="stockMenuOpen = !stockMenuOpen"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                $route.path.includes('/stok')
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              ]"
            >
              <div class="flex items-center">
                <i :class="['fas fa-fw text-lg mr-3', item.icon]"></i>
                {{ item.name }}
              </div>
              <i :class="['fas fa-chevron-down transition-transform duration-200', stockMenuOpen ? 'rotate-180' : '']"></i>
            </button>

            <!-- Dropdown Items -->
            <div v-show="stockMenuOpen" class="pl-4 space-y-1">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                :class="[
                  'flex items-center px-4 py-2 text-sm rounded-xl transition-all duration-200',
                  $route.path === child.path
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                ]"
                @click="isMobileMenuOpen = false"
              >
                <i :class="['fas fa-fw text-lg mr-3', child.icon]"></i>
                {{ child.name }}
              </router-link>
            </div>
          </div>
        </template>
      </nav>

      <!-- User Profile -->
      <div class="border-t border-gray-100 p-4 bg-white">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
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

    <!-- Overlay for mobile -->
    <div v-if="isMobileMenuOpen" 
         @click="isMobileMenuOpen = false"
         class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30">
    </div>

    <!-- Main Content -->
    <main class="lg:pl-64 min-h-screen">
      <!-- Breadcrumb -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-4">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2">
                <li>
                  <router-link to="/" class="text-gray-500 hover:text-primary-600">
                    Ana Sayfa
                  </router-link>
                </li>
                <li v-for="(item, index) in breadcrumbs" :key="index">
                  <div class="flex items-center">
                    <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                    <router-link 
                      :to="item.path" 
                      :class="[
                        'text-sm font-medium',
                        index === breadcrumbs.length - 1 
                          ? 'text-primary-600' 
                          : 'text-gray-500 hover:text-primary-600'
                      ]"
                    >
                      {{ item.name }}
                    </router-link>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'MainLayout',
  setup() {
    const toast = useToast()
    const router = useRouter()
    const route = useRoute()
    const isMobileMenuOpen = ref(false)
    
    const userFullName = ref('')
    const userInitials = ref('')
    const userEmail = ref('')

    // Stok menüsünün açık/kapalı durumunu tutacak ref
    const stockMenuOpen = ref(false)

    const menuItems = [
      { 
        name: 'Güncel Durum', 
        path: '/dashboard', 
        icon: 'fa-chart-line'
      },
      { 
        name: 'Satışlar', 
        path: '/sales', 
        icon: 'fa-shopping-cart'       
      },
      { 
        name: 'Stok', 
        icon: 'fa-box',
        isDropdown: true,
        isOpen: stockMenuOpen, // ref'i burada kullanıyoruz
        children: [
          {
            name: 'Ürünler',
            path: '/stok/urunler',
            icon: 'fa-boxes'
          },
          {
            name: 'Kategoriler',
            path: '/stok/kategoriler',
            icon: 'fa-folder-tree'
          },
          {
            name: 'Paketler',
            path: '/stok/paketler',
            icon: 'fa-box-open'
          },
          {
            name: 'Ürün Medya',
            path: '/stok/urun-medya',
            icon: 'fa-images'
          }
        ]
      },
      { 
        name: 'Müşteriler', 
        path: '/customers', 
        icon: 'fa-users' 
      },
      {
        name: 'Ayarlar',
        path: '/settings',
        icon: 'fa-cog'
      }
    ]

    // Breadcrumb navigation
    const breadcrumbs = computed(() => {
      const path = route.path
      const items = []

      menuItems.forEach(item => {
        if (path.includes(item.path)) {
          items.push(item)
        }
      })

      return items
    })

    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        toast.error('Çıkış yapılırken bir hata oluştu')
      }
    }

    const fetchUserInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()

        if (profile?.first_name && profile?.last_name) {
          userFullName.value = `${profile.first_name} ${profile.last_name}`
          userInitials.value = `${profile.first_name[0]}${profile.last_name[0]}`
        }

        userEmail.value = user.email
      } catch (error) {
        console.error('Error:', error)
        toast.error('Kullanıcı bilgileri yüklenirken bir hata oluştu')
      }
    }

    // Route değişikliklerini izle
    watch(
      () => route.path,
      (newPath) => {
        // Eğer stok sayfalarından birindeysek menüyü aç
        if (newPath.includes('/stok')) {
          stockMenuOpen.value = true
        }
      },
      { immediate: true } // Sayfa yüklendiğinde de çalıştır
    )

    // Close mobile menu when route changes
    watch(route, () => {
      isMobileMenuOpen.value = false
    })

    onMounted(() => {
      fetchUserInfo()
    })

    return {
      userFullName,
      userInitials,
      userEmail,
      menuItems,
      breadcrumbs,
      handleLogout,
      isMobileMenuOpen,
      stockMenuOpen // stockMenuOpen'ı template'de kullanabilmek için return ediyoruz
    }
  }
}
</script>

<style scoped>
.router-link-active {
  font-weight: 600;
}

@media (max-width: 1024px) {
  .translate-x-0 {
    transform: translateX(0);
  }
  
  .-translate-x-full {
    transform: translateX(-100%);
  }
}
</style> 