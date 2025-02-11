<template>
  <div class="px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Sales Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Top Selling Products -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-chart-line text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">En Çok Satan Ürünler</h3>
              <p class="text-sm text-gray-500">Son 30 gün</p>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="(product, index) in topSellingProducts" 
               :key="product.id"
               class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 flex items-center justify-center rounded-lg"
                   :class="{
                     'bg-yellow-100 text-yellow-600': index === 0,
                     'bg-gray-100 text-gray-600': index !== 0
                   }">
                <span class="font-medium">{{ index + 1 }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-xs text-gray-500">{{ product.total_quantity }} adet</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ formatPrice(product.total_amount) }}</p>
              <p class="text-xs text-green-600">+{{ product.total_quantity }} satış</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Least Selling Products -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-chart-line fa-flip-vertical text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">En Az Satan Ürünler</h3>
              <p class="text-sm text-gray-500">Son 30 gün</p>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="product in leastSellingProducts" 
               :key="product.id"
               class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center rounded-lg">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-xs text-gray-500">{{ product.total_quantity }} adet</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ formatPrice(product.total_amount) }}</p>
              <p class="text-xs text-red-600">{{ product.total_quantity }} satış</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Satış Detayları</h2>
        <p class="mt-1 text-sm text-gray-500">Tüm satışlarınızı görüntüleyin ve yönetin</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Satış ara..."
            class="w-64 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <i class="fas fa-search text-gray-400"></i>
          </div>
        </div>
        <select
          v-model="statusFilter"
          class="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal Edildi</option>
        </select>
        <select
          v-model="perPage"
          class="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option :value="10">10 Satır</option>
          <option :value="25">25 Satır</option>
          <option :value="50">50 Satır</option>
          <option :value="100">100 Satır</option>
        </select>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="bg-white rounded-2xl shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Müşteri
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satış Tipi
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sale in paginatedSales" :key="sale.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(sale.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ sale.customer?.name }}</div>
                <div class="text-sm text-gray-500">{{ sale.customer?.phone || 'Telefon yok' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-purple-100 text-purple-800': sale.sale_type === 'package',
                        'bg-blue-100 text-blue-800': sale.sale_type === 'product'
                      }">
                  {{ sale.sale_type === 'package' ? 'Paket Satış' : 'Ürün Satış' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatPrice(sale.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-yellow-100 text-yellow-800': sale.status === 'pending',
                        'bg-green-100 text-green-800': sale.status === 'completed',
                        'bg-red-100 text-red-800': sale.status === 'cancelled'
                      }">
                  {{ getSaleStatus(sale.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button @click="showSaleDetails(sale)"
                        class="text-indigo-600 hover:text-indigo-900">
                  <i class="fas fa-eye"></i>
                </button>
                <button v-if="sale.status === 'pending'"
                        @click="approveSale(sale)"
                        class="text-green-600 hover:text-green-900">
                  <i class="fas fa-check"></i>
                </button>
                <button v-if="sale.status === 'pending'"
                        @click="cancelSale(sale)"
                        class="text-red-600 hover:text-red-900">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center text-sm text-gray-500">
          Toplam {{ totalItems }} satış,
          <span class="mx-1">Gösterilen:</span>
          {{ startIndex }}-{{ endIndex }}
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium',
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium',
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            <i class="fas fa-angle-left"></i>
          </button>
          
          <div class="flex items-center space-x-1">
            <template v-for="page in displayedPages" :key="page">
              <button
                v-if="page !== '...'"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium',
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-2 text-gray-400">...</span>
            </template>
          </div>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium',
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium',
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Sale Details Modal -->
    <TransitionRoot appear :show="isDetailsModalOpen" as="template">
      <Dialog as="div" @close="closeDetailsModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <i class="fas fa-receipt text-indigo-600 text-xl"></i>
                    </div>
                    <div>
                      <DialogTitle as="h3" class="text-xl font-bold text-gray-900">
                        Satış Detayları
                      </DialogTitle>
                      <p class="text-sm text-gray-500">{{ formatDate(selectedSale?.created_at) }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        :class="{
                          'bg-yellow-100 text-yellow-800': selectedSale?.status === 'pending',
                          'bg-green-100 text-green-800': selectedSale?.status === 'completed',
                          'bg-red-100 text-red-800': selectedSale?.status === 'cancelled'
                        }">
                    {{ getSaleStatus(selectedSale?.status) }}
                  </span>
                </div>

                <div class="space-y-6">
                  <!-- Customer Info -->
                  <div class="bg-gray-50 rounded-xl p-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Müşteri Bilgileri</h4>
                    <div class="space-y-1">
                      <p class="text-sm">
                        <span class="font-medium">Ad Soyad:</span>
                        {{ selectedSale?.customer?.name }}
                      </p>
                      <p class="text-sm">
                        <span class="font-medium">Telefon:</span>
                        {{ selectedSale?.customer?.phone || 'Belirtilmemiş' }}
                      </p>
                      <p class="text-sm">
                        <span class="font-medium">E-posta:</span>
                        {{ selectedSale?.customer?.email || 'Belirtilmemiş' }}
                      </p>
                    </div>
                  </div>

                  <!-- Sale Items -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Satış Kalemleri</h4>
                    <div class="space-y-3">
                      <div v-for="item in saleDetails" 
                           :key="item.id"
                           class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <i :class="[
                              'fas',
                              item.package_id ? 'fa-box-open text-indigo-600' : 'fa-box text-gray-400'
                            ]"></i>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-gray-900">
                              {{ item.package?.name || item.product?.name }}
                            </p>
                            <p class="text-xs text-gray-500">
                              {{ formatPrice(item.unit_price) }} × {{ item.quantity }}
                            </p>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-medium text-gray-900">
                            {{ formatPrice(item.total_price) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Sale Summary -->
                  <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Ara Toplam</span>
                      <span class="font-medium">{{ formatPrice(selectedSale?.total_amount) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">KDV ({{ selectedSale?.tax_rate }}%)</span>
                      <span class="font-medium">
                        {{ formatPrice((selectedSale?.total_amount * selectedSale?.tax_rate) / 100) }}
                      </span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">İndirim ({{ selectedSale?.discount_rate }}%)</span>
                      <span class="font-medium text-green-600">
                        -{{ formatPrice((selectedSale?.total_amount * selectedSale?.discount_rate) / 100) }}
                      </span>
                    </div>
                    <div class="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                      <span>Toplam</span>
                      <span>{{ formatPrice(selectedSale?.total_amount) }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end">
                  <button
                    type="button"
                    @click="closeDetailsModal"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                  >
                    Kapat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// State
const toast = useToast()
const sales = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const isDetailsModalOpen = ref(false)
const selectedSale = ref(null)
const saleDetails = ref([])

// Pagination state
const currentPage = ref(1)
const perPage = ref(25)

// Additional state for product stats
const topSellingProducts = ref([])
const leastSellingProducts = ref([])

// Computed
const filteredSales = computed(() => {
  let filtered = sales.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(sale => 
      sale.customer?.name?.toLowerCase().includes(query) ||
      sale.customer?.phone?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(sale => sale.status === statusFilter.value)
  }

  return filtered
})

// Computed properties for pagination
const totalItems = computed(() => filteredSales.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
const startIndex = computed(() => (currentPage.value - 1) * perPage.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * perPage.value, totalItems.value))

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredSales.value.slice(start, end)
})

// Computed property for displayed page numbers
const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if total pages is less than max visible pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (currentPage.value > 3) {
      pages.push('...')
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage.value - 1); i <= Math.min(totalPages.value - 1, currentPage.value + 1); i++) {
      pages.push(i)
    }
    
    if (currentPage.value < totalPages.value - 2) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(totalPages.value)
  }
  
  return pages
})

// Watch for filters change to reset pagination
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'd MMMM yyyy HH:mm', { locale: tr })
}

const getSaleStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Beklemede'
    case 'completed':
      return 'Tamamlandı'
    case 'cancelled':
      return 'İptal Edildi'
    default:
      return status
  }
}

const loadSales = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers (
          name,
          phone,
          email
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    sales.value = data
  } catch (error) {
    console.error('Error loading sales:', error)
    toast.error('Satışlar yüklenirken bir hata oluştu')
  }
}

const showSaleDetails = async (sale) => {
  selectedSale.value = sale
  isDetailsModalOpen.value = true

  try {
    const { data, error } = await supabase
      .from('sale_details')
      .select(`
        *,
        product:products (*),
        package:packages (
          name,
          items:package_products (
            quantity,
            product:products (*)
          )
        )
      `)
      .eq('sale_id', sale.id)

    if (error) throw error
    saleDetails.value = data
  } catch (error) {
    console.error('Error loading sale details:', error)
    toast.error('Satış detayları yüklenirken bir hata oluştu')
  }
}

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false
  selectedSale.value = null
  saleDetails.value = []
}

const approveSale = async (sale) => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({ status: 'completed' })
      .eq('id', sale.id)

    if (error) throw error

    toast.success('Satış onaylandı')
    loadSales()
  } catch (error) {
    console.error('Error approving sale:', error)
    toast.error('Satış onaylanırken bir hata oluştu')
  }
}

const cancelSale = async (sale) => {
  try {
    // Önce satışın detaylarını al
    const { data: saleDetails, error: detailsError } = await supabase
      .from('sale_details')
      .select(`
        quantity,
        product_id,
        package_id,
        products (
          stock
        ),
        packages (
          items:package_products (
            quantity,
            product:products (
              id,
              stock
            )
          )
        )
      `)
      .eq('sale_id', sale.id)

    if (detailsError) throw detailsError

    // Her satış detayı için stok güncelleme işlemi yap
    for (const detail of saleDetails) {
      if (detail.package_id) {
        // Paket satışı ise, paket içindeki her ürün için stok güncelle
        const packageItems = detail.packages.items
        for (const packageItem of packageItems) {
          const totalQuantity = packageItem.quantity * detail.quantity
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock: packageItem.product.stock + totalQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', packageItem.product.id)

          if (stockError) throw stockError
        }
      } else if (detail.product_id) {
        // Normal ürün satışı ise
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: detail.products.stock + detail.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', detail.product_id)

        if (stockError) throw stockError
      }
    }

    // Satışı iptal et
    const { error } = await supabase
      .from('sales')
      .update({ status: 'cancelled' })
      .eq('id', sale.id)

    if (error) throw error

    toast.success('Satış iptal edildi')
    loadSales()
  } catch (error) {
    console.error('Error cancelling sale:', error)
    toast.error('Satış iptal edilirken bir hata oluştu')
  }
}

// Add new method to load product stats
const loadProductStats = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get top selling products from completed sales only
    const { data: topProducts, error: topError } = await supabase
      .from('sale_details')
      .select(`
        quantity,
        total_price,
        product:products (
          id,
          name,
          user_id
        ),
        sale:sales (
          status,
          created_at
        )
      `)
      .eq('sale.status', 'completed')
      .gte('sale.created_at', thirtyDaysAgo.toISOString())
      .not('product', 'is', null)

    if (topError) throw topError

    // Process and aggregate product data
    const productStats = {}
    topProducts.forEach(detail => {
      if (!detail.product || detail.product.user_id !== user.id) return
      if (!detail.sale || detail.sale.status !== 'completed') return
      
      const productId = detail.product.id
      if (!productStats[productId]) {
        productStats[productId] = {
          id: productId,
          name: detail.product.name,
          total_quantity: 0,
          total_amount: 0
        }
      }
      
      productStats[productId].total_quantity += detail.quantity
      productStats[productId].total_amount += detail.total_price
    })

    // Convert to array and sort
    const sortedProducts = Object.values(productStats).sort((a, b) => b.total_quantity - a.total_quantity)

    // Set top and least selling products
    topSellingProducts.value = sortedProducts.slice(0, 5)
    leastSellingProducts.value = sortedProducts.slice(-5).reverse()

  } catch (error) {
    console.error('Error loading product stats:', error)
    toast.error('Ürün istatistikleri yüklenirken bir hata oluştu')
  }
}

// Update onMounted to include product stats
onMounted(() => {
  loadSales()
  loadProductStats()
})
</script> 