<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
    <!-- Arka plan deseni -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),rgba(37,99,235,0.05)_50%,transparent_100%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.1),transparent_50%)]"></div>
    </div>
    
    <!-- Login kartı -->
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 transition-shadow duration-300 ease-out relative z-10">
      <div>
        <h2 class="text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
          Giriş Yap
        </h2>
        <p class="text-center text-gray-500 text-sm">Hesabınıza erişmek için giriş yapın</p>
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- E-posta input -->
          <div class="relative group">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-blue-600">
              <i class="fas fa-envelope mr-2 text-blue-500"></i>E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="email"
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all duration-300 ease-out
                     group-hover:border-blue-300"
              placeholder="ornek@email.com"
              oninvalid="this.setCustomValidity('Lütfen geçerli bir e-posta adresi giriniz')"
              oninput="this.setCustomValidity('')"
            >
          </div>

          <!-- Şifre input -->
          <div class="relative group">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-blue-600">
              <i class="fas fa-lock mr-2 text-blue-500"></i>Şifre
            </label>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                required
                v-model="password"
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       transition-all duration-300 ease-out
                       group-hover:border-blue-300"
                placeholder="••••••••"
                oninvalid="this.setCustomValidity('Lütfen şifrenizi giriniz')"
                oninput="this.setCustomValidity('')"
              >
              <button 
                type="button"
                @click="togglePassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Şifremi Unuttum linki -->
        <div class="flex items-center justify-end">
          <router-link 
            to="/reset-password" 
            class="text-sm font-medium text-blue-600 hover:text-blue-500 
                   hover:underline transition-all duration-200 ease-in-out"
          >
            Şifremi Unuttum
          </router-link>
        </div>

        <!-- Giriş butonu -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold 
                   rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 
                   hover:from-blue-500 hover:to-blue-600 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                   transform transition-all duration-300 ease-out hover:scale-[1.02] 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg hover:shadow-blue-500/50
                   overflow-hidden"
          >
            <span 
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                     translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
            ></span>
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </div>
      </form>

      <!-- Kayıt ol linki -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Hesabınız yok mu?
          <router-link 
            to="/register" 
            class="font-medium text-blue-600 hover:text-blue-500 
                   hover:underline transition-all duration-200 ease-in-out"
          >
            Kayıt olun
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const loading = ref(false)
    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)

    onMounted(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    })

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const handleLogin = async () => {
      try {
        loading.value = true
        await supabase.auth.signOut()

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Geçersiz e-posta veya şifre')
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('E-posta adresiniz henüz doğrulanmamış')
          } else if (error.message.includes('Please include an @ in the email address')) {
            toast.error('Lütfen geçerli bir e-posta adresi giriniz')
          } else {
            toast.error('Giriş yapılırken bir hata oluştu')
          }
          return
        }

        if (data?.session) {
          await supabase.auth.setSession(data.session)
          router.push('/')
          toast.success('Başarıyla giriş yapıldı')
        }
      } catch (error) {
        console.error('Error logging in:', error.message)
        toast.error('Giriş yapılırken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      email,
      password,
      showPassword,
      togglePassword,
      handleLogin
    }
  }
}
</script>

<style scoped>
@keyframes shine {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.hover\:shadow-blue-500\/50:hover {
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5), 0 2px 4px -1px rgba(59, 130, 246, 0.25);
}
</style> 