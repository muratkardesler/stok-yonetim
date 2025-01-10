<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="logo-text">STOK</h1>
        <h2>Stok Uygulaması'na hoş geldiniz</h2>
        <p class="subtitle">e-posta ve parolanız ile güvenli giriş yapabilirsiniz.</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input 
            type="email" 
            v-model="email" 
            required
            placeholder="E-posta Adresi"
            :class="{ 'error': hasError }"
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            v-model="password" 
            required
            placeholder="Parola"
            :class="{ 'error': hasError }"
          />
          <span v-if="hasError" class="error-message">
            E-posta adresi veya parola hatalı.
          </span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>Oturum açık kalsın</span>
          </label>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="login-button"
        >
          <span v-if="!loading">OTURUM AÇ</span>
          <div v-else class="loader"></div>
        </button>

        <div class="links">
          <a href="#" class="forgot-password">PAROLANIZI MI UNUTTUNUZ?</a>
          <div class="divider"></div>
          <a href="#" class="new-account">Yeni bir hesap mı açmak istiyorsunuz?</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      loading: false,
      hasError: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.hasError = false;

      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await response.json();
        
        if (data.Status === 'Success') {
          // Başarılı giriş
          if (this.rememberMe) {
            localStorage.setItem('userEmail', this.email);
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('lastLoginTime', new Date().getTime());
          } else {
            // Oturum açık kalmasın seçiliyse session storage kullan
            sessionStorage.setItem('userEmail', this.email);
            sessionStorage.setItem('isLoggedIn', 'true');
          }
          
          // Dashboard'a yönlendir
          this.$router.push('/dashboard');
        } else {
          // Başarısız giriş
          this.hasError = true;
        }

      } catch (error) {
        console.error('Login error:', error);
        this.hasError = true;
      } finally {
        this.loading = false;
      }
    },

    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const lastLoginTime = parseInt(localStorage.getItem('lastLoginTime'));
      const currentTime = new Date().getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 saat

      if (isLoggedIn && (currentTime - lastLoginTime) < oneDayInMs) {
        // Oturum hala geçerli, doğrudan dashboard'a yönlendir
        this.$router.push('/dashboard');
      } else if (isLoggedIn) {
        // Oturum süresi dolmuş, localStorage'ı temizle
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('lastLoginTime');
      }
    }
  },
  mounted() {
    // Sayfa yüklendiğinde oturum durumunu kontrol et
    this.checkLoginStatus();

    // Remember me kontrolü
    if (localStorage.getItem('rememberMe') === 'true') {
      this.rememberMe = true;
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        this.email = savedEmail;
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
  background: #f5f5f5;
  padding: 1rem;
}

.login-box {
  background: white;
  padding: 2.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: #E53935;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
}

h2 {
  font-size: 1.5rem;
  color: #484848;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 0.95rem;
  background: #F8F8F8;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #999;
}

input:focus {
  background: white;
  border-color: #666;
  outline: none;
}

input.error {
  border-color: #E53935;
  background: #FFF8F8;
}

.error-message {
  color: #E53935;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.form-options {
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.remember-me input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.login-button {
  width: 100%;
  padding: 0.9rem;
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background: #555;
}

.login-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.links {
  margin-top: 1.5rem;
  text-align: center;
}

.forgot-password, .new-account {
  display: block;
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.forgot-password {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.forgot-password:hover {
  color: #E53935;
}

.divider {
  height: 1px;
  background: #E0E0E0;
  margin: 1rem 0;
}

.new-account:hover {
  color: #E53935;
}

/* Loading Animation */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }
}
</style> 