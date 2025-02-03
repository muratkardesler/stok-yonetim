<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <h1>Yeni Şifre Belirleme</h1>
      <p class="description">
        Lütfen yeni şifrenizi belirleyin.
      </p>
      
      <form v-if="!error" @submit.prevent="handleResetPassword" class="reset-password-form">
        <div class="form-group">
          <label for="password">Yeni Şifre</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Yeni şifreniz"
            minlength="6"
          >
        </div>

        <div class="form-group">
          <label for="confirmPassword">Şifre Tekrar</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Şifrenizi tekrar girin"
            minlength="6"
          >
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="loading || !isPasswordValid"
          >
            {{ loading ? 'İşleniyor...' : 'Şifreyi Güncelle' }}
          </button>
        </div>

        <div v-if="success" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ success }}
        </div>
      </form>

      <div v-if="error" class="error-container">
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>
        <div class="error-actions">
          <button @click="handleRetry" class="btn-primary">
            Şifre Sıfırlama İşlemini Yeniden Başlat
          </button>
          <router-link to="/login" class="btn-link">
            Giriş Sayfasına Dön
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)

    const isPasswordValid = computed(() => {
      return password.value.length >= 6 && password.value === confirmPassword.value
    })

    const handleResetPassword = async () => {
      try {
        loading.value = true
        error.value = null
        success.value = null

        if (!password.value) {
          error.value = 'Lütfen yeni şifrenizi girin.'
          return
        }

        if (password.value.length < 8) {
          error.value = 'Şifre en az 8 karakter olmalıdır.'
          return
        }

        // Şifreyi güncelle
        const { data, error: updateError } = await supabase.auth.updateUser(
          { password: password.value }
        )

        if (updateError) {
          if (updateError.message.includes('New password should be different')) {
            throw new Error('Yeni şifreniz eski şifrenizle aynı olamaz. Lütfen farklı bir şifre belirleyin.')
          }
          throw updateError
        }

        success.value = 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...'
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push('/login')
        }, 3000)

      } catch (err) {
        console.error('Şifre güncelleme hatası:', err)
        error.value = err.message || 'Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      } finally {
        loading.value = false
      }
    }

    const handleRetry = () => {
      router.push('/forgot-password')
    }

    return {
      password,
      confirmPassword,
      loading,
      error,
      success,
      isPasswordValid,
      handleResetPassword,
      handleRetry
    }
  }
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
}

.reset-password-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.description {
  text-align: center;
  color: #6B7280;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4B5563;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #4338CA;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #F0FDF4;
  border: 1px solid #22C55E;
  border-radius: 6px;
  color: #15803D;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-container {
  text-align: center;
}

.error-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-actions .btn-primary {
  display: inline-block;
  text-decoration: none;
  text-align: center;
}

.error-actions .btn-link {
  color: #4F46E5;
  text-decoration: none;
}

.error-actions .btn-link:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #FEF2F2;
  border: 1px solid #EF4444;
  border-radius: 6px;
  color: #B91C1C;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-message i,
.success-message i {
  font-size: 1.1rem;
}
</style> 