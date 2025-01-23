<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Sales -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="bg-primary-50 p-3 rounded-lg">
              <i class="fas fa-shopping-cart text-primary-500"></i>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Toplam Satış</h3>
            <p class="text-lg font-semibold text-gray-900">{{ formatPrice(totalSales) }}</p>
            <p class="text-sm text-gray-600">{{ totalOrders }} sipariş</p>
          </div>
        </div>
      </div>

      <!-- Today's Sales -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="bg-green-50 p-3 rounded-lg">
              <i class="fas fa-calendar-day text-green-500"></i>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Bugünkü Satış</h3>
            <p class="text-lg font-semibold text-gray-900">{{ formatPrice(todaySales) }}</p>
            <p class="text-sm text-gray-600">{{ todayOrders }} sipariş</p>
          </div>
        </div>
      </div>

      <!-- Average Order Value -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="bg-blue-50 p-3 rounded-lg">
              <i class="fas fa-chart-line text-blue-500"></i>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Ortalama Sipariş</h3>
            <p class="text-lg font-semibold text-gray-900">{{ formatPrice(averageOrderValue) }}</p>
            <p class="text-sm text-gray-600">son 30 gün</p>
          </div>
        </div>
      </div>

      <!-- Top Product -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="bg-purple-50 p-3 rounded-lg">
              <i class="fas fa-crown text-purple-500"></i>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">En Çok Satan</h3>
            <p class="text-lg font-semibold text-gray-900">{{ topProduct?.Name || '-' }}</p>
            <p class="text-sm text-gray-600">{{ topProduct?.TotalQuantity || 0 }} adet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Chart -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">Satış Grafiği</h3>
        <select
          v-model="chartPeriod"
          class="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="daily">Günlük</option>
          <option value="weekly">Haftalık</option>
          <option value="monthly">Aylık</option>
        </select>
      </div>
      <div class="h-80">
        <canvas ref="salesChart"></canvas>
      </div>
    </div>

    <!-- Top Products Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">En Çok Satan Ürünler</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Satış Adedi</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in topProducts" :key="product.ProductId" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.Name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                {{ product.TotalQuantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                {{ formatPrice(product.TotalAmount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';

export default {
  name: 'SalesStats',
  setup() {
    const store = useStore();
    const salesChart = ref(null);
    const chartInstance = ref(null);
    const chartPeriod = ref('daily');
    const isChartMounted = ref(false);

    // Computed Properties
    const orders = computed(() => store.getters['sales/getOrders']);
    
    const totalSales = computed(() => {
      return orders.value.reduce((total, order) => total + order.TotalAmount, 0);
    });

    const totalOrders = computed(() => orders.value.length);

    const todaySales = computed(() => {
      const today = new Date().toDateString();
      return orders.value
        .filter(order => new Date(order.OrderDate).toDateString() === today)
        .reduce((total, order) => total + order.TotalAmount, 0);
    });

    const todayOrders = computed(() => {
      const today = new Date().toDateString();
      return orders.value.filter(order => new Date(order.OrderDate).toDateString() === today).length;
    });

    const averageOrderValue = computed(() => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = orders.value.filter(order => new Date(order.OrderDate) >= thirtyDaysAgo);
      if (recentOrders.length === 0) return 0;
      
      const total = recentOrders.reduce((sum, order) => sum + order.TotalAmount, 0);
      return total / recentOrders.length;
    });

    const topProducts = computed(() => {
      const productMap = new Map();
      
      // Collect all order details
      orders.value.forEach(order => {
        if (!order.OrderDetails) return;
        
        // Use Set to track unique products in this order
        const uniqueProducts = new Set();
        
        order.OrderDetails.forEach(detail => {
          const key = `${detail.ProductId}-${detail.UnitPrice}`;
          
          // Skip if we've already processed this product in this order
          if (uniqueProducts.has(key)) return;
          uniqueProducts.add(key);
          
          if (!productMap.has(key)) {
            productMap.set(key, {
              ProductId: detail.ProductId,
              Name: detail.ProductName || 'Bilinmeyen Ürün',
              TotalQuantity: 0,
              TotalAmount: 0
            });
          }
          
          const product = productMap.get(key);
          product.TotalQuantity += detail.Quantity;
          product.TotalAmount += detail.Quantity * detail.UnitPrice;
        });
      });

      // Convert to array and sort
      return Array.from(productMap.values())
        .sort((a, b) => b.TotalQuantity - a.TotalQuantity)
        .slice(0, 10);
    });

    const topProduct = computed(() => topProducts.value[0]);

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    };

    const getChartData = () => {
      const data = new Map();
      const now = new Date();

      switch (chartPeriod.value) {
        case 'daily':
          // Last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.set(date.toLocaleDateString('tr-TR'), 0);
          }
          break;

        case 'weekly':
          // Last 4 weeks
          for (let i = 3; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            const weekLabel = `${date.toLocaleDateString('tr-TR')} Haftası`;
            data.set(weekLabel, 0);
          }
          break;

        case 'monthly':
          // Last 6 months
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            const monthLabel = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
            data.set(monthLabel, 0);
          }
          break;
      }

      // Add sales data
      orders.value.forEach(order => {
        const orderDate = new Date(order.OrderDate);
        let key;

        switch (chartPeriod.value) {
          case 'daily':
            key = orderDate.toLocaleDateString('tr-TR');
            if (data.has(key)) {
              data.set(key, data.get(key) + order.TotalAmount);
            }
            break;

          case 'weekly':
            const weekStart = new Date(orderDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekLabel = `${weekStart.toLocaleDateString('tr-TR')} Haftası`;
            if (data.has(weekLabel)) {
              data.set(weekLabel, data.get(weekLabel) + order.TotalAmount);
            }
            break;

          case 'monthly':
            const monthLabel = orderDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
            if (data.has(monthLabel)) {
              data.set(monthLabel, data.get(monthLabel) + order.TotalAmount);
            }
            break;
        }
      });

      return {
        labels: Array.from(data.keys()),
        values: Array.from(data.values())
      };
    };

    const safeDestroyChart = () => {
      try {
        if (chartInstance.value) {
          chartInstance.value.destroy();
          chartInstance.value = null;
        }
      } catch (error) {
        console.error('Error destroying chart:', error);
      }
    };

    const updateChart = async () => {
      try {
        // Safely destroy existing chart
        safeDestroyChart();

        // Wait for next tick to ensure DOM is updated
        await nextTick();

        // Get canvas context
        const canvas = salesChart.value;
        if (!canvas) {
          console.warn('Canvas element not found');
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Canvas context not found');
          return;
        }

        const { labels, values } = getChartData();

        // Create new chart instance
        chartInstance.value = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Satış Tutarı',
              data: values,
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: value => formatPrice(value)
                }
              }
            }
          }
        });

        isChartMounted.value = true;
      } catch (error) {
        console.error('Error updating chart:', error);
        isChartMounted.value = false;
      }
    };

    // Lifecycle Hooks
    onMounted(async () => {
      try {
        await nextTick();
        if (salesChart.value) {
          await updateChart();
        }
      } catch (error) {
        console.error('Error in onMounted:', error);
      }
    });

    watch(chartPeriod, async () => {
      try {
        if (salesChart.value && isChartMounted.value) {
          await updateChart();
        }
      } catch (error) {
        console.error('Error in chartPeriod watch:', error);
      }
    });

    watch(orders, async () => {
      try {
        if (salesChart.value && isChartMounted.value) {
          await updateChart();
        }
      } catch (error) {
        console.error('Error in orders watch:', error);
      }
    }, { deep: true });

    onUnmounted(() => {
      safeDestroyChart();
    });

    return {
      salesChart,
      chartPeriod,
      totalSales,
      totalOrders,
      todaySales,
      todayOrders,
      averageOrderValue,
      topProducts,
      topProduct,
      formatPrice
    };
  }
};
</script> 