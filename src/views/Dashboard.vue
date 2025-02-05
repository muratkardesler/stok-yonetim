<template>
  <div>
    <!-- Hoş Geldiniz Kartı -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Hoş Geldiniz, {{ userFullName || 'Kullanıcı' }}</h1>
          <p class="text-sm text-gray-500 mt-1">Son giriş: {{ lastLoginAt ? formatDate(lastLoginAt) : 'Bilgi yok' }}</p>
        </div>
        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <span class="text-indigo-600 font-medium">{{ userInitials || 'K' }}</span>
        </div>
      </div>
    </div>

    <!-- Özet Kartları -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <!-- Onay Bekleyen Siparişler -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-clock text-amber-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-600">Bekleyen</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ pendingOrdersCount }}</h3>
        <p class="text-sm text-gray-500">Onay Bekleyen</p>
        <div class="mt-4">
          <router-link 
            v-if="pendingOrdersCount > 0"
            to="/sales?status=pending" 
            class="text-amber-600 hover:text-amber-700 text-xs flex items-center">
            Siparişleri görüntüle
            <i class="fas fa-arrow-right ml-1"></i>
          </router-link>
        </div>
      </div>
      
      <!-- Günlük Satış -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-600">Günlük</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">₺{{ formatPrice(dailySales) }}</h3>
        <p class="text-sm text-gray-500">Günlük Satış</p>
        <div class="mt-4 flex items-center text-xs">
          <span :class="[
            'flex items-center',
            dailySalesChange >= 0 ? 'text-green-600' : 'text-red-600'
          ]">
            <i :class="['fas', dailySalesChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']" class="mr-1"></i>
            {{ Math.abs(dailySalesChange) }}%
          </span>
          <span class="text-gray-400 ml-2">Dünden bu yana</span>
        </div>
      </div>

      <!-- Aylık Satış -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-chart-line text-emerald-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-600">Aylık</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">₺{{ formatPrice(monthlySales) }}</h3>
        <p class="text-sm text-gray-500">Aylık Satış</p>
        <div class="mt-4 flex items-center text-xs">
          <span :class="[
            'flex items-center',
            monthlySalesChange >= 0 ? 'text-green-600' : 'text-red-600'
          ]">
            <i :class="['fas', monthlySalesChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']" class="mr-1"></i>
            {{ Math.abs(monthlySalesChange) }}%
          </span>
          <span class="text-gray-400 ml-2">Geçen aydan bu yana</span>
        </div>
      </div>

      <!-- Toplam Müşteri -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-users text-blue-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">Toplam</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ totalCustomers }}</h3>
        <p class="text-sm text-gray-500">Toplam Müşteri</p>
        <div class="mt-4 flex items-center text-xs">
          <span class="text-green-600 flex items-center">
            <i class="fas fa-arrow-up mr-1"></i>
            {{ newCustomersToday }}
          </span>
          <span class="text-gray-400 ml-2">Bugün eklenen</span>
        </div>
      </div>

      <!-- Düşük Stok -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">Uyarı</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ lowStockCount }}</h3>
        <p class="text-sm text-gray-500">Düşük Stok</p>
        <div class="mt-4 flex items-center text-xs">
          <router-link to="/stock" class="text-red-600 hover:text-red-700">
            Stok durumunu kontrol et
            <i class="fas fa-arrow-right ml-1"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Grafikler -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Aylık Satış Grafiği -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">Aylık Satış Grafiği</h3>
          <select v-model="selectedPeriod" 
                  class="text-sm rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            <option value="6">Son 6 Ay</option>
            <option value="12">Son 12 Ay</option>
          </select>
        </div>
        <div class="h-80">
          <LineChart :data="monthlySalesData" />
        </div>
      </div>

      <!-- En Çok Satan Ürünler -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-6">En Çok Satan Ürünler</h3>
        <div class="h-80">
          <PieChart :data="topProductsData" />
        </div>
      </div>
    </div>

    <!-- Alt Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Son Satışlar -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Son Satışlar</h3>
        <div class="space-y-4">
          <div v-for="sale in recentSales" 
               :key="sale.id" 
               class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-shopping-cart text-indigo-600"></i>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ sale.customer_name }}</h4>
                <p class="text-xs text-gray-500">{{ formatDate(sale.created_at) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900">₺{{ formatPrice(sale.total_amount) }}</p>
              <p class="text-xs text-gray-500">{{ sale.items_count }} ürün</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Kritik Stok -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Kritik Stok Seviyeleri</h3>
        <div class="space-y-4">
          <div v-for="product in lowStockProducts" 
               :key="product.id" 
               class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   :class="getCategoryBgColor(product.category_id)">
                <i class="fas fa-box" :class="getCategoryTextColor(product.category_id)"></i>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ product.name }}</h4>
                <p class="text-xs text-gray-500">{{ product.category.name }}</p>
              </div>
            </div>
            <div class="text-right">
              <p :class="[
                'text-sm font-bold',
                product.stock <= 0 ? 'text-red-600' : 'text-orange-600'
              ]">{{ product.stock }} adet</p>
              <p class="text-xs text-gray-500">Kritik seviye: {{ product.min_stock }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    PieChart
  },
  setup() {
    const toast = useToast()
    const router = useRouter()
    const selectedPeriod = ref(6)
    
    // Kullanıcı bilgileri
    const userFullName = ref('')
    const userInitials = ref('')
    const userEmail = ref('')
    const lastLoginAt = ref(null)
    const pendingOrdersCount = ref(0)
    
    // State variables
    const dailySales = ref(0)
    const dailySalesChange = ref(0)
    const monthlySales = ref(0)
    const monthlySalesChange = ref(0)
    const totalCustomers = ref(0)
    const newCustomersToday = ref(0)
    const lowStockCount = ref(0)
    const recentSales = ref([])
    const lowStockProducts = ref([])
    const monthlySalesData = ref([])
    const topProductsData = ref([])

    // Kullanıcı bilgilerini getir
    const fetchUserInfo = async () => {
      try {
        console.log('Kullanıcı bilgileri alınıyor...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Auth error:', userError)
          toast.error('Oturum bilgileri alınamadı')
          router.push('/login')
          return
        }

        if (!user) {
          console.error('No user found')
          router.push('/login')
          return
        }

        console.log('Kullanıcı bulundu:', user.id)
        console.log('Son giriş:', user.last_sign_in_at)

        // Profil bilgilerini al
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          toast.error('Profil bilgileri alınamadı')
          return
        }

        console.log('Profil bilgileri:', profile)

        if (profile?.first_name && profile?.last_name) {
          userFullName.value = `${profile.first_name} ${profile.last_name}`
          userInitials.value = `${profile.first_name[0]}${profile.last_name[0]}`
        } else {
          userFullName.value = 'Kullanıcı'
          userInitials.value = 'K'
        }

        userEmail.value = user.email
        lastLoginAt.value = user.last_sign_in_at

      } catch (error) {
        console.error('Error fetching user info:', error)
        toast.error('Kullanıcı bilgileri yüklenirken bir hata oluştu')
      }
    }

    // Onay bekleyen siparişleri getir
    const fetchPendingOrders = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data: orders, error } = await supabase
          .from('sales')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')

        if (error) throw error

        pendingOrdersCount.value = orders?.length || 0
      } catch (error) {
        console.error('Error fetching pending orders:', error)
        toast.error('Bekleyen siparişler yüklenirken bir hata oluştu')
      }
    }

    // Dashboard verilerini getir
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchPendingOrders()
        ])

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        // Fetch daily sales
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const { data: todaySales } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        dailySales.value = todaySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

        // Fetch yesterday's sales for comparison
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        const { data: yesterdaySales } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', yesterday.toISOString())
          .lt('created_at', today.toISOString())

        const yesterdayTotal = yesterdaySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
        dailySalesChange.value = yesterdayTotal === 0 ? 100 : 
          ((dailySales.value - yesterdayTotal) / yesterdayTotal) * 100

        // Fetch monthly sales
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        
        const { data: monthSales } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', firstDayOfMonth.toISOString())
          .lt('created_at', tomorrow.toISOString())

        monthlySales.value = monthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

        // Fetch last month's sales for comparison
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        
        const { data: lastMonthSales } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', firstDayOfLastMonth.toISOString())
          .lt('created_at', firstDayOfCurrentMonth.toISOString())

        const lastMonthTotal = lastMonthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
        monthlySalesChange.value = lastMonthTotal === 0 ? 100 :
          ((monthlySales.value - lastMonthTotal) / lastMonthTotal) * 100

        // Fetch customer stats
        const { data: customers } = await supabase
          .from('customers')
          .select('created_at')

        totalCustomers.value = customers?.length || 0
        newCustomersToday.value = customers?.filter(customer => 
          new Date(customer.created_at) >= today
        ).length || 0

        // Fetch low stock products
        const { data: lowStock } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .or('stock.lte.10,stock.eq.0')
          .order('stock')

        lowStockProducts.value = lowStock || []
        lowStockCount.value = lowStock?.length || 0

        // Fetch recent sales
        const { data: recent } = await supabase
          .from('sales')
          .select(`
            *,
            details:sale_details(id),
            extra:sale_details_extra(customer_name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5)

        recentSales.value = recent?.map(sale => ({
          ...sale,
          customer_name: sale.extra?.[0]?.customer_name || 'İsimsiz Müşteri',
          items_count: sale.details?.length || 0
        })) || []

        // Fetch monthly sales data for chart
        const monthsToShow = selectedPeriod.value
        const monthlyData = []
        
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
          
          const { data: monthData } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())

          const total = monthData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
          
          monthlyData.push({
            month: startDate.toLocaleString('tr-TR', { month: 'short' }),
            amount: total
          })
        }

        monthlySalesData.value = monthlyData

        // Fetch top selling products
        const { data: topProducts } = await supabase
          .from('sale_details')
          .select(`
            quantity,
            product:products(name)
          `)
          .not('product', 'is', null)
          .order('quantity', { ascending: false })
          .limit(5)

        topProductsData.value = topProducts?.map(item => ({
          name: item.product?.name || 'Bilinmeyen Ürün',
          value: item.quantity
        })) || []

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Veriler yüklenirken bir hata oluştu')
      }
    }

    // Utility functions
    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const formatDate = (date) => {
      if (!date) return 'Bilgi yok'
      const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return new Date(date).toLocaleDateString('tr-TR', options)
    }

    const getCategoryBgColor = (categoryId) => {
      const colors = {
        1: 'bg-red-100',
        2: 'bg-blue-100',
        3: 'bg-green-100',
        4: 'bg-yellow-100',
        5: 'bg-purple-100',
        6: 'bg-pink-100',
        7: 'bg-indigo-100',
        8: 'bg-orange-100'
      }
      return colors[categoryId] || 'bg-gray-100'
    }

    const getCategoryTextColor = (categoryId) => {
      const colors = {
        1: 'text-red-600',
        2: 'text-blue-600',
        3: 'text-green-600',
        4: 'text-yellow-600',
        5: 'text-purple-600',
        6: 'text-pink-600',
        7: 'text-indigo-600',
        8: 'text-orange-600'
      }
      return colors[categoryId] || 'text-gray-600'
    }

    // Watch for period changes
    watch(selectedPeriod, () => {
      fetchDashboardData()
    })

    // Load data on mount
    onMounted(() => {
      fetchDashboardData()
    })

    return {
      selectedPeriod,
      userFullName,
      userInitials,
      userEmail,
      lastLoginAt,
      pendingOrdersCount,
      dailySales,
      dailySalesChange,
      monthlySales,
      monthlySalesChange,
      totalCustomers,
      newCustomersToday,
      lowStockCount,
      recentSales,
      lowStockProducts,
      monthlySalesData,
      topProductsData,
      formatPrice,
      formatDate,
      getCategoryBgColor,
      getCategoryTextColor
    }
  }
}
</script>