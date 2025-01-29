<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Kayıt Ol</h1>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-section">
          <h2>Kişisel Bilgiler</h2>
          <div class="form-group">
            <label for="firstName">Ad</label>
            <input 
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              placeholder="Adınız"
            >
          </div>
          <div class="form-group">
            <label for="lastName">Soyad</label>
            <input 
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              placeholder="Soyadınız"
            >
          </div>
          <div class="form-group">
            <label for="email">E-posta</label>
            <input 
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="E-posta adresiniz"
            >
          </div>
          <div class="form-group">
            <label for="password">Şifre</label>
            <input 
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="Şifreniz"
            >
          </div>
        </div>

        <div class="form-section">
          <h2>Şirket Bilgileri</h2>
          <div class="form-group">
            <label for="companyName">Şirket Adı</label>
            <input 
              id="companyName"
              v-model="form.companyName"
              type="text"
              required
              placeholder="Şirket adı"
            >
          </div>
          <div class="form-group">
            <label for="companyEmail">Şirket E-posta</label>
            <input 
              id="companyEmail"
              v-model="form.companyEmail"
              type="email"
              required
              placeholder="Şirket e-posta adresi"
            >
          </div>
          <div class="form-group">
            <label for="phone">Telefon</label>
            <input 
              id="phone"
              v-model="form.phone"
              type="tel"
              required
              placeholder="Telefon numarası"
            >
          </div>
          <div class="form-group">
            <label for="address">Adres</label>
            <textarea 
              id="address"
              v-model="form.address"
              required
              placeholder="Şirket adresi"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Kaydediliyor...' : 'Kayıt Ol' }}
          </button>
          <router-link to="/login" class="btn-link">
            Zaten hesabınız var mı? Giriş yapın
          </router-link>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()

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

    const loading = computed(() => store.state.auth.loading)
    const error = computed(() => store.state.auth.error)

    const handleRegister = async () => {
      try {
        await store.dispatch('auth/register', {
          email: form.value.email,
          password: form.value.password,
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          companyName: form.value.companyName,
          companyEmail: form.value.companyEmail,
          phone: form.value.phone,
          address: form.value.address
        })

        router.push('/dashboard')
      } catch (error) {
        console.error('Registration error:', error)
      }
    }

    return {
      form,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

h1 {
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  color: #4F46E5;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4B5563;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

textarea {
  min-height: 100px;
  resize: vertical;
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
}
</style> 