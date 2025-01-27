<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Notification -->
      <div v-if="notification.show" 
           :class="['notification', notification.type]">
        {{ notification.message }}
      </div>
      
      <div class="login-header">
        <h2>Hoş Geldiniz</h2>
        <p>Stok yönetim sisteminize giriş yapın</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
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
            <i class="fas fa-lock"></i>
            Şifre
          </label>
          <div class="password-input">
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            >
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="toggle-password"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.remember">
            <span>Beni Hatırla</span>
          </label>
          <a href="#" class="forgot-password">Şifremi Unuttum</a>
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <i class="fas fa-spinner fa-spin" v-if="loading"></i>
          <span v-else>Giriş Yap</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Henüz hesabınız yok mu? <router-link to="/signup">Ücretsiz Deneyin</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { authService } from '@/services/api';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      showPassword: false,
      loading: false,
      error: null,
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  methods: {
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
    async handleLogin() {
      try {
        this.loading = true;
        this.error = null;

        console.log('Login isteği gönderiliyor:', {
          email: this.form.email,
          hasPassword: !!this.form.password
        });

        const response = await authService.login({
          email: this.form.email,
          password: this.form.password
        });

        console.log('Login başarılı:', response);

        if (response.Status === 'Success') {
          // Kullanıcı bilgilerini sakla
          const userData = {
            username: response.Username?.[0],
            email: response.Email?.[0],
            created: response.Created?.[0]
          };

          // Remember me seçeneğine göre oturum bilgisini sakla
          if (this.form.remember) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(userData));
          } else {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userData', JSON.stringify(userData));
          }

          // Başarılı mesajını göster
          this.showNotification(response.Message || 'Başarıyla giriş yaptınız! Yönlendiriliyorsunuz...', 'success');

          // 1 saniye bekleyip yönlendir
          setTimeout(async () => {
            await this.router.push({ name: 'Dashboard' });
          }, 1000);
        } else {
          throw new Error(response.Message || 'Giriş başarısız');
        }
      } catch (error) {
        console.error('Login hatası:', error);
        const errorMessage = error.response?.data?.Message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Kullanıcı adı veya şifre hatalı';
        this.showNotification(errorMessage, 'error');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #666;
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
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s;
}

.login-btn:not(:disabled):hover {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

.notification.success {
  background-color: #10B981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.notification.error {
  background-color: #EF4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
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