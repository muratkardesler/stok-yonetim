<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <h1>Şifremi Unuttum</h1>
      <p class="description">
        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
      </p>
      
      <form @submit.prevent="handleResetPassword" class="forgot-password-form">
        <div class="form-group">
          <label for="email">E-posta</label>
          <input 
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="E-posta adresiniz"
          >
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder' }}
          </button>
          <router-link to="/login" class="btn-link">
            Giriş sayfasına dön
          </router-link>
        </div>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ success }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'ForgotPassword',
  setup() {
    const email = ref('')
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)

    const handleResetPassword = async () => {
      try {
        loading.value = true
        error.value = null
        success.value = null

        if (!email.value) {
          error.value = 'Lütfen e-posta adresinizi giriniz.'
          return
        }

        // Şifre sıfırlama isteği gönder
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.value,
          {
            redirectTo: window.location.origin + '/reset-password',
            captchaToken: undefined
          }
        )

        if (resetError) {
          console.error('Reset error:', resetError)
          throw new Error(resetError.message)
        }

        success.value = 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.'
        email.value = ''
      } catch (err) {
        console.error('Password reset error:', err)
        if (err.message.includes('Email rate limit exceeded')) {
          error.value = 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyip tekrar deneyin.'
        } else if (err.message.includes('User not found')) {
          error.value = 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.'
        } else {
          error.value = 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      loading,
      error,
      success,
      handleResetPassword
    }
  }
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
}

.forgot-password-container {
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

.btn-link {
  color: #4F46E5;
  text-decoration: none;
}

.btn-link:hover {
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

.error-message i,
.success-message i {
  font-size: 1.1rem;
}
</style> 