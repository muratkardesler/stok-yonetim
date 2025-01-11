<template>
  <div class="home">
    <!-- Navigasyon -->
    <nav class="navbar">
      <div class="logo">
        <h3>LOGO</h3>
      </div>
      
      <!-- Desktop Menu -->
      <div class="nav-links" :class="{ active: isMenuOpen }">
        <a href="#features">Özellikler</a>
        <a href="#pricing">Fiyatlar</a>
        <a href="#support">Destek</a>
        <router-link to="/login" class="login-btn">Giriş Yap</router-link>
      </div>
      
      <!-- Mobile Menu Button -->
      <div class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Stok Yönetiminde<br/>Yeni Nesil Çözüm</h1>
        <p class="hero-subtitle">
          Tek platformda stok takibi, sipariş yönetimi ve raporlama. 
          İşletmenizi büyütmek hiç bu kadar kolay olmamıştı.
        </p>
        <div class="cta-buttons">
          <router-link to="/login" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Giriş Yap
          </router-link>
          
          <router-link to="/signup" class="btn btn-secondary">
            <i class="fas fa-user-plus"></i> 14 Gün Ücretsiz Dene
          </router-link>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">1000+</span>
            <span class="stat-label">Aktif Kullanıcı</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">5M+</span>
            <span class="stat-label">İşlem Hacmi</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">%99.9</span>
            <span class="stat-label">Müşteri Memnuniyeti</span>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <div class="dashboard-preview">
          <div class="placeholder-dashboard">
            <div class="chart-placeholder">
              <div class="chart-bar" v-for="n in 5" :key="n"></div>
            </div>
            <div class="data-grid">
              <div class="data-item" v-for="n in 6" :key="n"></div>
            </div>
          </div>
        </div>
        <div class="floating-card card-1">
          <i class="fas fa-chart-line"></i>
          <span>Satışlar %32 arttı</span>
        </div>
        <div class="floating-card card-2">
          <i class="fas fa-box"></i>
          <span>Stok takibi kolaylaştı</span>
        </div>
      </div>
    </section>

    <!-- Özellikler Bölümü -->
    <section class="features" id="features">
      <h2>Neden Bizi Seçmelisiniz?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <i class="fas fa-chart-line"></i>
          <h3>Gerçek Zamanlı Takip</h3>
          <p>Stok hareketlerinizi anlık izleyin, kritik seviyeleri kaçırmayın.</p>
          <a href="#" class="feature-link">Detaylı Bilgi <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="feature-card">
          <i class="fas fa-mobile-alt"></i>
          <h3>Mobil Erişim</h3>
          <p>Her yerden erişim ile işletmenizi cebinizde taşıyın.</p>
          <a href="#" class="feature-link">Detaylı Bilgi <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="feature-card">
          <i class="fas fa-chart-pie"></i>
          <h3>Detaylı Raporlar</h3>
          <p>Özelleştirilebilir raporlar ile veriye dayalı kararlar alın.</p>
          <a href="#" class="feature-link">Detaylı Bilgi <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </section>

    <!-- Müşteri Yorumları -->
    <section class="testimonials">
      <h2>Müşterilerimiz Ne Diyor?</h2>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="testimonial-content">
            <div class="quote-icon">
              <i class="fas fa-quote-left"></i>
            </div>
            <p>"Stok yönetimimiz artık çok daha kolay. Zaman tasarrufu sağlıyoruz."</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="author-info">
              <h4>Ahmet Yılmaz</h4>
              <span>ABC Market</span>
            </div>
          </div>
        </div>
        <!-- Diğer testimonial kartları eklenebilir -->
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Hemen Başlayın</h2>
        <p>14 gün ücretsiz deneme ile risksiz başlangıç yapın.</p>
        <router-link to="/signup" class="btn btn-primary">
          Ücretsiz Deneyin
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  }
}
</script>

<style scoped>
/* Modern CSS Variables - Yeni renk paleti */
:root {
  --primary-color: #4F46E5;      /* Ana renk - Indigo */
  --secondary-color: #06B6D4;    /* İkincil renk - Cyan */
  --accent-color: #F59E0B;       /* Vurgu rengi - Amber */
  --success-color: #10B981;      /* Başarı rengi - Emerald */
  --warning-color: #F59E0B;      /* Uyarı rengi - Amber */
  --error-color: #EF4444;        /* Hata rengi - Red */
  --text-color: #1F2937;         /* Ana metin rengi */
  --text-light: #6B7280;         /* Açık metin rengi */
  --background: #F3F4F6;         /* Arka plan rengi */
  --white: #ffffff;
}

/* Base Styles */
.home {
  font-family: 'Roboto', sans-serif;
  color: var(--text-color);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: var(--white);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.logo img {
  height: 40px;
}

.nav-links a {
  margin-left: 2rem;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
}

.login-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
}

/* Hero Section */
.hero {
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 5rem 5%;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  position: relative;
  overflow: hidden;
  margin-top: 60px;
}

.hero::before {
  display: none;
}

.hero-content {
  flex: 1;
  padding-right: 2rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.hero-image {
  flex: 1;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: white;
  color: var(--text-color);
  border: 2px solid var(--primary-color);
}

/* Features Section */
.features {
  padding: 5rem 5%;
  text-align: center;
}

.features h2 {
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.15);
}

.feature-card i {
  font-size: 3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hamburger {
    display: block;
    cursor: pointer;
  }

  .nav-links {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: var(--white);
    padding: 1rem;
    flex-direction: column;
    align-items: center;
    transform: translateY(-150%);
    transition: transform 0.3s;
  }

  .nav-links.active {
    transform: translateY(0);
  }

  .nav-links a {
    margin: 1rem 0;
  }

  .hero {
    flex-direction: column;
    text-align: center;
    padding-top: 100px;
  }

  .hero-content {
    padding-right: 0;
    margin-bottom: 2rem;
  }

  .cta-buttons {
    justify-content: center;
  }
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-1 {
  top: 20%;
  right: 0;
  background: var(--primary-color);
  color: white;
}

.card-2 {
  bottom: 20%;
  left: 0;
  background: var(--secondary-color);
  color: white;
}

.testimonials {
  padding: 5rem 5%;
  background: #f8f9fa;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
}

.quote-icon {
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.quote-icon i {
  color: white;
  font-size: 1.5rem;
}

.author-info h4 {
  color: var(--text-color);
  margin: 0;
}

.author-info span {
  color: #666;
  font-size: 0.9rem;
}

.cta-section {
  padding: 5rem 5%;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97 9.9 46.386l-9.9-9.9v-2.828zm0 5.657L8.485 47.8 7.07 49.212 0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.344 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.415 1.415 9.9-9.9v-2.828zm0 5.657L51.515 47.8l1.414 1.413 7.07-7.07v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413 7.07-7.07 7.07 7.07zm-2.827 2.83l1.414-1.416L30 14.97l-5.657 5.657 1.414 1.415L30 17.8l4.243 4.242zm-2.83 2.827l1.415-1.414L30 20.626l-2.828 2.83 1.414 1.414L30 23.456l1.414 1.414zM56.87 59.414L58.284 58 30 29.716 1.716 58l1.414 1.414L30 32.544l26.87 26.87z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

/* Animasyonlar */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.floating-card {
  animation: float 4s ease-in-out infinite;
}

.card-1 {
  animation-delay: 0s;
}

.card-2 {
  animation-delay: 2s;
}

.testimonials {
  padding: 5rem 5%;
  background: #f8f9fa;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
}

.quote-icon {
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.quote-icon i {
  color: white;
  font-size: 1.5rem;
}

.author-info h4 {
  color: var(--text-color);
  margin: 0;
}

.author-info span {
  color: #666;
  font-size: 0.9rem;
}

.cta-section {
  padding: 5rem 5%;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97 9.9 46.386l-9.9-9.9v-2.828zm0 5.657L8.485 47.8 7.07 49.212 0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.344 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.415 1.415 9.9-9.9v-2.828zm0 5.657L51.515 47.8l1.414 1.413 7.07-7.07v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413 7.07-7.07 7.07 7.07zm-2.827 2.83l1.414-1.416L30 14.97l-5.657 5.657 1.414 1.415L30 17.8l4.243 4.242zm-2.83 2.827l1.415-1.414L30 20.626l-2.828 2.83 1.414 1.414L30 23.456l1.414 1.414zM56.87 59.414L58.284 58 30 29.716 1.716 58l1.414 1.414L30 32.544l26.87 26.87z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  margin-top: 1rem;
  font-weight: 500;
  transition: gap 0.3s;
}

.feature-link:hover {
  gap: 0.8rem;
}

.dashboard-preview {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 16px;
  background: white;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.dashboard-preview:hover {
  transform: none;
}

.dashboard-img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.dashboard-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  pointer-events: none;
}

.card-1 {
  top: 20%;
  right: 0;
  background: var(--primary-color);
  color: white;
}

.card-2 {
  bottom: 20%;
  left: 0;
  background: var(--secondary-color);
  color: white;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-avatar i {
  font-size: 1.5rem;
  color: #666;
}

/* Responsive düzenlemeler */
@media (max-width: 768px) {
  .dashboard-preview {
    transform: none;
    margin-top: 2rem;
  }

  .floating-card {
    position: static;
    margin: 1rem auto;
    width: fit-content;
  }
}

.placeholder-dashboard {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.placeholder-dashboard i {
  font-size: 4rem;
  color: var(--primary-color);
}

.placeholder-dashboard span {
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.2;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
  padding: 1rem;
}

.chart-bar {
  width: 40px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 4px;
  animation: grow 1s ease-out forwards;
}

.chart-bar:nth-child(1) { height: 60%; }
.chart-bar:nth-child(2) { height: 80%; animation-delay: 0.2s; }
.chart-bar:nth-child(3) { height: 40%; animation-delay: 0.4s; }
.chart-bar:nth-child(4) { height: 90%; animation-delay: 0.6s; }
.chart-bar:nth-child(5) { height: 70%; animation-delay: 0.8s; }

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.data-item {
  height: 40px;
  background: rgba(79, 70, 229, 0.05);
  border-radius: 8px;
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Her data-item için farklı animation-delay */
.data-item:nth-child(1) { animation-delay: 1s; }
.data-item:nth-child(2) { animation-delay: 1.1s; }
.data-item:nth-child(3) { animation-delay: 1.2s; }
.data-item:nth-child(4) { animation-delay: 1.3s; }
.data-item:nth-child(5) { animation-delay: 1.4s; }
.data-item:nth-child(6) { animation-delay: 1.5s; }
</style>