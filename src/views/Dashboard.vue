<template>
  <div class="dashboard-layout" :class="{ 'menu-collapsed': isMenuCollapsed }">
    <!-- Sol Menü -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="logo-text">FlowBridge</span>
        <button @click="toggleMenu" class="collapse-btn">
          <i :class="isMenuCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item active">
          <i class="fas fa-chart-line"></i>
          <span>Güncel Durum</span>
        </router-link>
        <router-link to="/sales" class="nav-item">
          <i class="fas fa-shopping-cart"></i>
          <span>Satışlar</span>
        </router-link>
        <router-link to="/expenses" class="nav-item">
          <i class="fas fa-file-invoice-dollar"></i>
          <span>Giderler</span>
        </router-link>
        <router-link to="/stock" class="nav-item">
          <i class="fas fa-box"></i>
          <span>Stok</span>
        </router-link>
        <router-link to="/e-commerce" class="nav-item">
          <i class="fas fa-store"></i>
          <span>E-Ticaret</span>
          <span class="new-badge">Yeni!</span>
        </router-link>
      </nav>
    </aside>

    <!-- Ana İçerik -->
    <main class="main-content">
      <!-- Üst Bar -->
      <header class="top-bar">
        <div class="page-title">
          <h1>Güncel Durum</h1>
          <span class="date">{{ currentDate }}</span>
        </div>
        
        <div class="user-menu">
          <div class="user-info">
            <span class="username">{{ username }}</span>
            <small>{{ userEmail }}</small>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            Çıkış Yap
          </button>
        </div>
      </header>

      <!-- Dashboard İçeriği -->
      <div class="dashboard-content">
        <!-- Tahsilatlar Bölümü -->
        <section class="dashboard-section">
          <h2>Tahsilatlar</h2>
          <div class="widgets-grid">
            <div class="widget">
              <div class="widget-header">
                <h3>Toplam Tahsil Edilecek</h3>
                <i class="fas fa-money-bill-wave widget-icon"></i>
              </div>
              <div class="widget-content">
                <div class="amount">{{ formatCurrency(totalReceivables) }}</div>
                <div class="chart-container">
                  <div class="progress-circle" :style="{ '--progress': receivablesProgress + '%' }">
                    <span>{{ receivablesProgress }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget">
              <div class="widget-header">
                <h3>Gecikmiş</h3>
                <i class="fas fa-clock widget-icon warning"></i>
              </div>
              <div class="widget-content">
                <div class="amount warning">{{ formatCurrency(overdueAmount) }}</div>
                <div class="status-text">{{ overdueCount }} Adet Gecikmiş Tahsilat</div>
              </div>
            </div>

            <div class="widget">
              <div class="widget-header">
                <h3>Planlanmamış</h3>
                <i class="fas fa-calendar widget-icon info"></i>
              </div>
              <div class="widget-content">
                <div class="amount">{{ formatCurrency(unplannedAmount) }}</div>
                <div class="status-text">{{ unplannedCount }} Adet İşlem</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Ödemeler Bölümü -->
        <section class="dashboard-section">
          <h2>Ödemeler</h2>
          <div class="widgets-grid">
            <div class="widget">
              <div class="widget-header">
                <h3>Toplam Ödenecek</h3>
                <i class="fas fa-credit-card widget-icon"></i>
              </div>
              <div class="widget-content">
                <div class="amount">{{ formatCurrency(totalPayables) }}</div>
                <div class="chart-container">
                  <div class="progress-circle" :style="{ '--progress': payablesProgress + '%' }">
                    <span>{{ payablesProgress }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget">
              <div class="widget-header">
                <h3>Bu Ay Oluşan KDV</h3>
                <i class="fas fa-percent widget-icon"></i>
              </div>
              <div class="widget-content">
                <div class="amount">{{ formatCurrency(monthlyVAT) }}</div>
                <div class="comparison">
                  <i class="fas fa-arrow-up"></i>
                  <span>Geçen Aya Göre %{{ vatIncrease }} Artış</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Ürün Kategorileri Bölümü -->
        <section class="dashboard-section product-categories">
          <div class="section-header">
            <h2>Ürün Kategorileri Dağılımı</h2>
          </div>
          
          <div class="chart-container">
            <canvas ref="categoryChart"></canvas>
          </div>

          <div class="category-legend">
            <div v-for="(category, index) in categoryData" :key="index" class="legend-item">
              <span class="color-dot" :style="{ backgroundColor: chartColors[index] }"></span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ category.count }} adet</span>
              <span class="category-percentage">({{ calculatePercentage(category.count) }}%)</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

export default {
  name: 'Dashboard',
  data() {
    return {
      currentDate: new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      username: '',
      userEmail: '',
      trialDaysLeft: 14
    }
  },
  created() {
    // Kullanıcı bilgilerini localStorage'dan al
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.username = userData.username || 'Kullanıcı';
    this.userEmail = localStorage.getItem('userEmail') || '';
  },
  methods: {
    handleLogout() {
      // Local storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('isLoggedIn');
      
      // Ana sayfaya yönlendir
      this.$router.push({ name: 'Home' });
    }
  },
  setup() {
    const router = useRouter();
    const isMenuCollapsed = ref(false);
    const trialDaysLeft = ref(14);
    const userName = ref('Berna');
    const userAvatar = ref('https://via.placeholder.com/32');
    const categoryChart = ref(null);
    const chartInstance = ref(null);

    // Örnek kategori verileri (gerçek verilerle değiştirilecek)
    const categoryData = ref([
      { name: 'Yüzük', count: 80 },
      { name: 'Kolye', count: 30 }
    ]);

    const chartColors = [
      '#4F46E5', // Primary color
      '#06B6D4', // Secondary color
      '#10B981', // Success color
      '#F59E0B', // Warning color
      '#EF4444', // Error color
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#14B8A6'  // Teal
    ];

    const calculatePercentage = (count) => {
      const total = categoryData.value.reduce((sum, category) => sum + category.count, 0);
      return ((count / total) * 100).toFixed(1);
    };

    const createChart = () => {
      const ctx = categoryChart.value.getContext('2d');
      
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      chartInstance.value = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: categoryData.value.map(category => category.name),
          datasets: [{
            data: categoryData.value.map(category => category.count),
            backgroundColor: chartColors.slice(0, categoryData.value.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} adet (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    onMounted(() => {
      // Chart oluştur
      createChart();

      // Örnek: Her 5 saniyede bir verileri güncelle
      const interval = setInterval(() => {
        // Burada gerçek veri güncelleme mantığı olacak
        createChart();
      }, 5000);

      onUnmounted(() => {
        clearInterval(interval);
        if (chartInstance.value) {
          chartInstance.value.destroy();
        }
      });
    });

    const toggleMenu = () => {
      isMenuCollapsed.value = !isMenuCollapsed.value;
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(value);
    };

    return {
      isMenuCollapsed,
      trialDaysLeft,
      userName,
      userAvatar,
      categoryChart,
      categoryData,
      chartColors,
      toggleMenu,
      formatCurrency,
      calculatePercentage
    };
  }
};
</script>

<style scoped>
:root {
  --primary-color: #4F46E5;
  --secondary-color: #06B6D4;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --error-color: #EF4444;
  --text-color: #1F2937;
  --text-light: #6B7280;
  --border-color: #E5E7EB;
  --background-light: #F9FAFB;
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--background-light);
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.menu-collapsed .sidebar {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  height: 32px;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 1rem;
}

.nav-item:hover, .nav-item.active {
  background: var(--background-light);
  color: var(--primary-color);
}

.nav-item i {
  font-size: 1.25rem;
  width: 24px;
}

.menu-collapsed .nav-item span {
  display: none;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #eee;
}

.page-title h1 {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.date {
  color: var(--text-light);
  font-size: 0.875rem;
}

.trial-notice {
  background: #FEF3C7;
  color: #92400E;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.username {
  color: var(--text-color);
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #EF4444;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #DC2626;
  transform: translateY(-1px);
}

.logout-btn i {
  font-size: 1.1rem;
}

/* Dashboard Content Styles */
.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-section h2 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.widget {
  background: var(--background-light);
  border-radius: 8px;
  padding: 1.5rem;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.widget-header h3 {
  font-size: 1rem;
  color: var(--text-light);
}

.widget-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.widget-icon.warning {
  color: var(--warning-color);
}

.widget-icon.info {
  color: var(--secondary-color);
}

.amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.amount.warning {
  color: var(--warning-color);
}

.status-text {
  color: var(--text-light);
  font-size: 0.875rem;
}

.progress-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary-color) calc(var(--progress) * 1%),
    #E5E7EB calc(var(--progress) * 1%)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
}

.progress-circle span {
  position: relative;
  color: var(--text-color);
  font-weight: 500;
}

/* Bank Accounts Section */
.bank-accounts {
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.link-button {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.bank-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-card {
  text-align: center;
  padding: 1.5rem;
}

.feature-card i {
  font-size: 2rem;
  color: var(--success-color);
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.125rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--text-light);
  font-size: 0.875rem;
  line-height: 1.5;
}

.connect-bank-btn {
  width: 100%;
  padding: 1rem;
  background: var(--success-color);
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

.connect-bank-btn:hover {
  transform: translateY(-2px);
}

.new-badge {
  background: var(--error-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  margin-left: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: fixed;
    bottom: 0;
    z-index: 100;
    border-top: 1px solid var(--border-color);
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-nav {
    display: flex;
    justify-content: space-around;
    padding: 0.5rem;
  }

  .nav-item {
    flex-direction: column;
    padding: 0.5rem;
    text-align: center;
    gap: 0.25rem;
  }

  .nav-item span {
    font-size: 0.75rem;
  }

  .main-content {
    padding: 1rem;
    margin-bottom: 60px;
  }

  .widgets-grid {
    grid-template-columns: 1fr;
  }

  .top-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .trial-notice {
    width: 100%;
    justify-content: center;
  }
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.menu-collapsed .logo-text {
  display: none;
}

/* Product Categories Section */
.product-categories {
  background: white;
}

.chart-container {
  height: 300px;
  margin: 2rem 0;
  position: relative;
}

.category-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--background-light);
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.category-name {
  font-weight: 500;
  color: var(--text-color);
}

.category-count {
  color: var(--text-light);
  margin-left: auto;
}

.category-percentage {
  color: var(--primary-color);
  font-weight: 500;
  min-width: 60px;
  text-align: right;
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }

  .category-legend {
    grid-template-columns: 1fr;
  }
}
</style>