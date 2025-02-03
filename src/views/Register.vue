<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
      <!-- Form Header -->
      <div class="text-center">
        <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Kayıt Ol
        </h2>
        <p class="mt-2 text-gray-500">Hemen ücretsiz hesap oluşturun</p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="mt-8 space-y-8">
        <!-- Personal Information Section -->
        <div class="space-y-6">
          <div class="flex items-center space-x-2 text-lg font-semibold text-gray-700 mb-4">
            <i class="fas fa-user text-blue-500"></i>
            <h3>Kişisel Bilgiler</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-user-circle text-blue-500 mr-2"></i>Ad
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300 ease-out"
                :class="{ 'border-red-300': v$.form.firstName.$error }"
                placeholder="Adınız"
              />
              <div v-if="v$.form.firstName.$error" class="text-red-500 text-xs mt-1">
                {{ v$.form.firstName.$errors[0].$message }}
              </div>
            </div>

            <!-- Last Name -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-user-circle text-blue-500 mr-2"></i>Soyad
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300 ease-out"
                :class="{ 'border-red-300': v$.form.lastName.$error }"
                placeholder="Soyadınız"
              />
              <div v-if="v$.form.lastName.$error" class="text-red-500 text-xs mt-1">
                {{ v$.form.lastName.$errors[0].$message }}
              </div>
            </div>

            <!-- Email -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-envelope text-blue-500 mr-2"></i>E-posta
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300 ease-out"
                :class="{ 'border-red-300': v$.form.email.$error }"
                placeholder="ornek@email.com"
              />
              <div v-if="v$.form.email.$error" class="text-red-500 text-xs mt-1">
                {{ v$.form.email.$errors[0].$message }}
              </div>
            </div>

            <!-- Password -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-lock text-blue-500 mr-2"></i>Şifre
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-300 ease-out"
                  :class="{ 'border-red-300': v$.form.password.$error }"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  @click="togglePassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <!-- Password Strength Indicator -->
              <div class="mt-2">
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300"
                    :class="passwordStrengthClass"
                    :style="{ width: `${passwordStrength}%` }"
                  ></div>
                </div>
                <div class="flex justify-between text-xs mt-1">
                  <span :class="{ 'text-green-500': passwordStrength >= 25 }">Zayıf</span>
                  <span :class="{ 'text-green-500': passwordStrength >= 50 }">Orta</span>
                  <span :class="{ 'text-green-500': passwordStrength >= 75 }">İyi</span>
                  <span :class="{ 'text-green-500': passwordStrength === 100 }">Güçlü</span>
                </div>
              </div>
              <!-- Password Requirements -->
              <div class="mt-2 space-y-1 text-xs">
                <div :class="passwordCriteria.length ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordCriteria.length ? 'fas fa-check' : 'fas fa-times'" class="mr-1"></i>
                  En az 8 karakter
                </div>
                <div :class="passwordCriteria.uppercase ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordCriteria.uppercase ? 'fas fa-check' : 'fas fa-times'" class="mr-1"></i>
                  En az bir büyük harf
                </div>
                <div :class="passwordCriteria.lowercase ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordCriteria.lowercase ? 'fas fa-check' : 'fas fa-times'" class="mr-1"></i>
                  En az bir küçük harf
                </div>
                <div :class="passwordCriteria.number ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordCriteria.number ? 'fas fa-check' : 'fas fa-times'" class="mr-1"></i>
                  En az bir rakam
                </div>
                <div :class="passwordCriteria.special ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordCriteria.special ? 'fas fa-check' : 'fas fa-times'" class="mr-1"></i>
                  En az bir özel karakter
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Information Section -->
        <div class="space-y-6">
          <div class="flex items-center space-x-2 text-lg font-semibold text-gray-700 mb-4">
            <i class="fas fa-building text-blue-500"></i>
            <h3>Şirket Bilgileri</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Company Name -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-building text-blue-500 mr-2"></i>Şirket Adı
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.companyName"
                type="text"
                required
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300 ease-out"
                :class="{ 'border-red-300': v$.form.companyName.$error }"
                placeholder="Şirket adı"
              />
              <div v-if="v$.form.companyName.$error" class="text-red-500 text-xs mt-1">
                {{ v$.form.companyName.$errors[0].$message }}
              </div>
            </div>

            <!-- Company Email -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-envelope text-blue-500 mr-2"></i>Şirket E-posta
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.companyEmail"
                type="email"
                required
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300 ease-out"
                :class="{ 'border-red-300': v$.form.companyEmail.$error }"
                placeholder="sirket@sirket.com"
              />
              <div v-if="v$.form.companyEmail.$error" class="text-red-500 text-xs mt-1">
                {{ v$.form.companyEmail.$errors[0].$message }}
              </div>
            </div>

            <!-- Phone -->
            <div class="relative group">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-phone text-blue-500 mr-2"></i>Telefon
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+90</span>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  class="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-300 ease-out"
                  :class="{ 'border-red-300': v$.form.phone.$error }"
                  placeholder="555 555 55 55"
                  @input="formatPhoneNumber"
                />
              </div>
              <div v-if="v$.form.phone.$error" class="text-red-500 text-xs mt-1">
                {{ v$.form.phone.$errors[0].$message }}
              </div>
            </div>

            <!-- Address -->
            <div class="relative group md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>Adres
              </label>
              <textarea
                v-model="form.address"
                rows="3"
                class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300 ease-out resize-none"
                placeholder="Şirket adresi (opsiyonel)"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
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
                   shadow-lg hover:shadow-blue-500/50"
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
            {{ loading ? 'Kaydınız Oluşturuluyor...' : 'Kayıt Ol' }}
          </button>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Zaten hesabınız var mı?
            <router-link 
              to="/login" 
              class="font-medium text-blue-600 hover:text-blue-500 
                     hover:underline transition-all duration-200 ease-in-out"
            >
              Giriş yapın
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const loading = ref(false)
    const showPassword = ref(false)

    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyName: '',
      companyEmail: '',
      phone: '',
      address: ''
    })

    // Password criteria tracking
    const passwordCriteria = ref({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    })

    // Validation rules
    const rules = {
      form: {
        firstName: { required: helpers.withMessage('Ad alanı zorunludur', required) },
        lastName: { required: helpers.withMessage('Soyad alanı zorunludur', required) },
        email: { 
          required: helpers.withMessage('E-posta alanı zorunludur', required),
          email: helpers.withMessage('Geçerli bir e-posta adresi giriniz', email)
        },
        password: { 
          required: helpers.withMessage('Şifre alanı zorunludur', required),
          minLength: helpers.withMessage('Şifre en az 8 karakter olmalıdır', minLength(8))
        },
        companyName: { required: helpers.withMessage('Şirket adı zorunludur', required) },
        companyEmail: { 
          required: helpers.withMessage('Şirket e-postası zorunludur', required),
          email: helpers.withMessage('Geçerli bir e-posta adresi giriniz', email)
        },
        phone: { 
          required: helpers.withMessage('Telefon numarası zorunludur', required),
          validPhone: helpers.withMessage('Geçerli bir telefon numarası giriniz', (value) => {
            // Sadece rakamları al
            const numbers = value.replace(/\D/g, '')
            // 10 haneli numara kontrolü
            return numbers.length === 10
          })
        }
      }
    }

    const v$ = useVuelidate(rules, { form })

    // Password strength calculation
    const passwordStrength = computed(() => {
      let strength = 0
      const criteria = passwordCriteria.value

      if (criteria.length) strength += 20
      if (criteria.uppercase) strength += 20
      if (criteria.lowercase) strength += 20
      if (criteria.number) strength += 20
      if (criteria.special) strength += 20

      return strength
    })

    // Password strength color class
    const passwordStrengthClass = computed(() => {
      if (passwordStrength.value >= 80) return 'bg-green-500'
      if (passwordStrength.value >= 60) return 'bg-blue-500'
      if (passwordStrength.value >= 40) return 'bg-yellow-500'
      return 'bg-red-500'
    })

    // Watch password changes
    watch(() => form.value.password, (newPassword) => {
      passwordCriteria.value = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*]/.test(newPassword)
      }
    })

    // Toggle password visibility
    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    // Format phone number
    const formatPhoneNumber = () => {
      // Sadece rakamları al
      let phone = form.value.phone.replace(/\D/g, '')
      
      // Maksimum 10 rakam
      if (phone.length > 10) {
        phone = phone.slice(0, 10)
      }
      
      // Formatlama: XXX XXX XXXX
      if (phone.length >= 6) {
        phone = phone.slice(0, 3) + ' ' + phone.slice(3, 6) + ' ' + phone.slice(6)
      } else if (phone.length >= 3) {
        phone = phone.slice(0, 3) + ' ' + phone.slice(3)
      }
      
      form.value.phone = phone
    }

    // Handle form submission
    const handleRegister = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) return

      loading.value = true
      try {
        console.log('Kayıt işlemi başlatılıyor:', form.value.email)

        // E-posta kontrolü
        const { data: { exists }, error: checkError } = await supabase
          .rpc('is_email_exists', { p_email: form.value.email })

        if (checkError) {
          console.error('E-posta kontrolü hatası:', checkError)
          throw checkError
        }

        if (exists) {
          console.log('E-posta adresi zaten kayıtlı')
          throw new Error('Bu e-posta adresi ile daha önce kayıt yapılmış. Lütfen farklı bir e-posta adresi kullanın.')
        }

        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: form.value.email,
          password: form.value.password,
          options: {
            data: {
              first_name: form.value.firstName,
              last_name: form.value.lastName,
              company_name: form.value.companyName,
              company_email: form.value.companyEmail,
              phone: form.value.phone,
              address: form.value.address
            },
            emailRedirectTo: window.location.origin
          }
        })

        console.log('Kayıt cevabı:', { data, error })

        if (error) {
          console.error('Kayıt hatası:', error)
          throw error
        }

        if (!data?.user) {
          console.log('Kullanıcı verisi eksik:', data)
          throw new Error('Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.')
        }

        toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.', {
          timeout: 5000,
          position: "top-right",
          closeOnClick: true,
          pauseOnHover: true
        })

        router.push('/login')
      } catch (error) {
        console.error('Kayıt işlemi hatası:', error)
        toast.error(error.message || 'Kayıt sırasında bir hata oluştu', {
          timeout: 3000,
          position: "top-right"
        })
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      showPassword,
      passwordCriteria,
      passwordStrength,
      passwordStrengthClass,
      v$,
      togglePassword,
      formatPhoneNumber,
      handleRegister
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