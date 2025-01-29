<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Giriş Yap
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="E-posta"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Şifre"
            >
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <router-link to="/reset-password" class="font-medium text-primary-600 hover:text-primary-500">
              Şifremi Unuttum
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          Hesabınız yok mu?
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
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

    onMounted(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    })

    const handleLogin = async () => {
      try {
        loading.value = true

        // Önce mevcut oturumu temizle
        await supabase.auth.signOut()

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('E-posta veya şifre hatalı')
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('E-posta adresiniz henüz onaylanmamış')
          } else {
            toast.error('Giriş yapılırken bir hata oluştu: ' + error.message)
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
      handleLogin
    }
  }
}
</script> 