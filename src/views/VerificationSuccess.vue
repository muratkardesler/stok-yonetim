<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
        <h2 class="text-center text-3xl font-bold text-gray-900">E-posta Doğrulandı!</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Hesabınız başarıyla doğrulandı. Artık FlowBridge'i kullanmaya başlayabilirsiniz.
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
        <div class="space-y-6">
          <div>
            <p class="text-sm text-gray-600 text-center">
              Aşağıdaki butona tıklayarak giriş yapabilir ve FlowBridge'i kullanmaya başlayabilirsiniz.
            </p>
          </div>

          <div>
            <router-link
              to="/login"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>
              Giriş Yap
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

onMounted(() => {
  toast.success('E-posta adresiniz başarıyla doğrulandı!')
})
</script> 