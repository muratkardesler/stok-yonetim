<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Breadcrumb -->
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm">
        <router-link to="/" class="text-gray-600 hover:text-primary-500">Ana Sayfa</router-link>
        <span class="text-gray-400">/</span>
        <span class="text-primary-500">Satışlar</span>
      </div>
    </nav>

    <!-- Satış Listesi -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Satışlar</h2>
        <router-link to="/sales" class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
          <i class="fas fa-plus mr-2"></i>
          Yeni Satış
        </router-link>
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-primary-500"></i>
      </div>

      <!-- Veri Yok -->
      <div v-else-if="sales.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-shopping-cart text-gray-400 text-xl"></i>
        </div>
        <p class="text-gray-500">Henüz satış kaydı bulunmuyor</p>
      </div>

      <!-- Satış Tablosu -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(sale.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ sale.extra?.customer_name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  sale.sale_type === 'package' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                ]">
                  {{ sale.sale_type === 'package' ? 'Paket' : 'Ürün' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₺{{ formatPrice(sale.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  sale.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                ]">
                  {{ sale.status === 'completed' ? 'Tamamlandı' : 'Beklemede' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button @click="showSaleDetails(sale)" class="text-indigo-600 hover:text-indigo-900">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Satış Detay Modal -->
    <Modal v-if="selectedSale" @close="selectedSale = null">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-receipt text-indigo-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Satış Detayları</h3>
            <p class="text-sm text-gray-500 mt-1">{{ formatDate(selectedSale.created_at) }}</p>
          </div>
        </div>
      </template>
      <template #body>
        <div class="space-y-6">
          <!-- Müşteri Bilgileri -->
          <div class="bg-gray-50 p-4 rounded-xl">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Müşteri Bilgileri</h4>
            <p class="text-sm text-gray-900">{{ selectedSale.extra?.customer_name || '-' }}</p>
            <p v-if="selectedSale.extra?.notes" class="text-sm text-gray-500 mt-1">
              {{ selectedSale.extra.notes }}
            </p>
          </div>

          <!-- Ürün Listesi -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Satın Alınan Ürünler</h4>
            <div class="space-y-2">
              <div v-for="detail in selectedSale.details" :key="detail.id" 
                   class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ detail.product?.name || detail.package?.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ detail.quantity }} adet × ₺{{ formatPrice(detail.unit_price) }}
                  </p>
                </div>
                <p class="text-sm font-bold text-gray-900">
                  ₺{{ formatPrice(detail.total_price) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Fiyat Detayları -->
          <div class="border-t pt-4">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Ara Toplam</span>
                <span class="font-medium text-gray-900">
                  ₺{{ formatPrice(calculateSubtotal(selectedSale.details)) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">KDV (%{{ selectedSale.extra?.tax_rate || 0 }})</span>
                <span class="font-medium text-gray-900">
                  ₺{{ formatPrice(calculateTax(selectedSale.details, selectedSale.extra?.tax_rate)) }}
                </span>
              </div>
              <div v-if="selectedSale.extra?.discount_rate" class="flex justify-between text-sm">
                <span class="text-red-600">İndirim (%{{ selectedSale.extra.discount_rate }})</span>
                <span class="font-medium text-red-600">
                  -₺{{ formatPrice(calculateDiscount(selectedSale.details, selectedSale.extra.discount_rate)) }}
                </span>
              </div>
              <div class="flex justify-between text-base font-bold pt-2">
                <span class="text-gray-900">Toplam</span>
                <span class="text-indigo-600">₺{{ formatPrice(selectedSale.total_amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'SalesList',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const loading = ref(true)
    const sales = ref([])
    const selectedSale = ref(null)

    // Satışları getir
    const fetchSales = async () => {
      try {
        loading.value = true

        // Önce mevcut kullanıcıyı al
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError

        // Sadece giriş yapan kullanıcının satışlarını getir
        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .eq('user_id', user.id) // Kullanıcı bazlı filtreleme
          .order('created_at', { ascending: false })

        if (error) throw error

        sales.value = data || []
      } catch (error) {
        console.error('Satışlar getirilirken hata:', error)
        toast.error('Satışlar yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    // Satış detaylarını göster
    const showSaleDetails = (sale) => {
      selectedSale.value = sale
    }

    // Yardımcı fonksiyonlar
    const formatDate = (date) => {
      return new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const calculateSubtotal = (details) => {
      return details.reduce((total, detail) => total + Number(detail.total_price), 0)
    }

    const calculateTax = (details, taxRate) => {
      const subtotal = calculateSubtotal(details)
      return subtotal * (Number(taxRate || 0) / 100)
    }

    const calculateDiscount = (details, discountRate) => {
      const subtotal = calculateSubtotal(details)
      return subtotal * (Number(discountRate || 0) / 100)
    }

    onMounted(() => {
      fetchSales()
    })

    return {
      loading,
      sales,
      selectedSale,
      showSaleDetails,
      formatDate,
      formatPrice,
      calculateSubtotal,
      calculateTax,
      calculateDiscount
    }
  }
}
</script> 