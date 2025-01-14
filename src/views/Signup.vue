<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="signup-header">
        <h1>14 Gün Ücretsiz Deneyin</h1>
        <p class="subtitle">Hemen kayıt olun, stok yönetimini kolaylaştırın!</p>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>
            <i class="fas fa-user"></i>
            Kullanıcı Adı
          </label>
          <input 
            v-model="form.username" 
            type="text" 
            required
            placeholder="Kullanıcı adınız"
          >
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-building"></i>
            Şirket Adı
          </label>
          <input 
            v-model="form.company" 
            type="text" 
            required
            placeholder="Şirketinizin adı"
          >
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-envelope"></i>
            Email
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            placeholder="ornek@sirket.com"
          >
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-phone"></i>
            Telefon
          </label>
          <input 
            v-model="form.phone"
            type="tel"
            required
            placeholder="(5XX) XXX XX XX"
            maxlength="15"
            @input="formatPhoneNumber"
          >
          <small v-if="phoneError" class="error-text">Geçerli bir telefon numarası giriniz</small>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-lock"></i>
            Şifre
          </label>
          <div class="password-input">
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Güçlü bir şifre oluşturun"
              @input="checkPassword"
            >
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="toggle-password"
              :class="{ 'valid-password': isPasswordValid }"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <small v-if="!isPasswordValid && form.password" class="error-text">
            Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir
          </small>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <i class="fas fa-user-plus"></i>
          {{ isLoading ? 'Kaydediliyor...' : 'Ücretsiz Başla' }}
        </button>
      </form>

      <div v-if="notification.show" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// CORS proxy URL'i
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export default {
  name: 'Signup',
  data() {
    return {
      form: {
        username: '',
        company: '',
        email: '',
        phone: '',
        password: '',
        role: 'User',
        address: 'Turkey'
      },
      showPassword: false,
      isPasswordValid: false,
      phoneError: false,
      isLoading: false,
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  methods: {
    formatPhoneNumber(event) {
      let phone = event.target.value.replace(/\D/g, '');
      
      // Sadece 10 haneli numara
      if (phone.length > 10) {
        phone = phone.slice(0, 10);
      }
      
      // Format: (5XX) XXX XX XX
      let formatted = '';
      if (phone.length > 0) {
        formatted = '(' + phone.slice(0, 3);
        if (phone.length > 3) {
          formatted += ') ' + phone.slice(3, 6);
          if (phone.length > 6) {
            formatted += ' ' + phone.slice(6, 8);
            if (phone.length > 8) {
              formatted += ' ' + phone.slice(8, 10);
            }
          }
        }
      }
      
      this.form.phone = formatted;
      this.phoneError = phone.length > 0 && phone.length < 10;
    },
    checkPassword() {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      this.isPasswordValid = regex.test(this.form.password);
    },
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message,
        type
      };
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },
    async handleSubmit() {
      this.checkPassword();
      const phoneDigits = this.form.phone.replace(/\D/g, '');
      this.phoneError = phoneDigits.length !== 10;

      if (!this.isPasswordValid || this.phoneError) {
        return;
      }

      this.isLoading = true;

      try {
        console.log('Sending registration data:', {
          username: this.form.username,
          password: this.form.password,
          company: this.form.company,
          phone: this.form.phone.replace(/\D/g, ''),
          email: this.form.email,
          role: this.form.role,
          address: this.form.address
        });

        const response = await axios({
          method: 'POST',
          url: '/api/signup',
          params: {
            client_id: '6f0b2e5229c7455091966ef898fd6f68',
            client_secret: '8041a365CDfb448c88a7780b7699A6aC'
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: {
            email: this.form.email,
            password: this.form.password,
            username: this.form.username,
            companyName: this.form.company,
            contactInfo: this.form.phone.replace(/\D/g, ''),
            role: this.form.role,
            address: this.form.address
          }
        });

        console.log('API Response:', response.data);

        if (response.data && response.data.Status === 'Failed') {
          console.error('Registration failed:', response.data);
          this.showNotification(response.data.Message || 'Kayıt işlemi başarısız oldu', 'error');
        } else if (response.data && response.data.Status === 'Success') {
          // Token ve kullanıcı bilgilerini sakla
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userEmail', this.form.email);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(response.data.user));
          
          // Başarılı mesajını göster
          this.showNotification('Kayıt başarılı bir şekilde oluşturuldu');
          
          // Doğrudan dashboard'a yönlendir
          this.$router.push({ name: 'Dashboard' });
        } else {
          console.error('Unexpected response:', response.data);
          throw new Error('Beklenmeyen bir yanıt alındı');
        }
      } catch (error) {
        console.error('Registration error:', error);
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.Message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Kayıt işlemi sırasında bir hata oluştu';
        this.showNotification(errorMessage, 'error');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  padding: 2rem;
}

.signup-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #eee;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.toggle-password.valid-password {
  color: var(--success-color);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.signup-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.signup-header h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
  line-height: 1.5;
}

.error-text {
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.form-group input.error {
  border-color: var(--error-color);
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

.notification.success {
  background: var(--success-color);
}

.notification.error {
  background: var(--error-color);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>