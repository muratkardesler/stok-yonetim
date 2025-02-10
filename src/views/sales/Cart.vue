<template>
  <div class="px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Cart Section -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Sepet</h2>
        <button v-if="cartItems.length > 0" 
                @click="clearCart" 
                class="text-red-600 hover:text-red-700 text-sm font-medium">
          <i class="fas fa-trash mr-1"></i>
          Sepeti Temizle
        </button>
      </div>

      <!-- Empty Cart Message -->
      <div v-if="cartItems.length === 0" 
           class="flex flex-col items-center justify-center py-16 px-4">
        <div class="w-48 h-48 mb-8 relative">
          <!-- Shopping cart illustration -->
          <div class="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
          <div class="absolute inset-4 bg-indigo-50 rounded-full"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="fas fa-shopping-cart text-6xl text-indigo-600 opacity-80"></i>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h3>
        <p class="text-gray-500 text-center max-w-md mb-8">
          Sepetinize henüz ürün eklemediniz. Hemen alışverişe başlayın ve ürünlerinizi sepete ekleyin.
        </p>
        <router-link to="/sales/product"
                     class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <i class="fas fa-shopping-basket mr-2"></i>
          Alışverişe Başla
        </router-link>
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <i class="fas fa-box text-emerald-600"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Geniş Ürün Yelpazesi</h4>
            <p class="text-sm text-gray-500">Binlerce ürün arasından seçim yapın</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <i class="fas fa-truck text-blue-600"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Hızlı İşlem</h4>
            <p class="text-sm text-gray-500">Kolay ve hızlı sipariş süreci</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <i class="fas fa-tag text-amber-600"></i>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Özel Fırsatlar</h4>
            <p class="text-sm text-gray-500">Size özel indirim ve kampanyalar</p>
          </div>
        </div>
      </div>

      <!-- Cart Items -->
      <div v-else class="space-y-4">
        <div v-for="item in cartItems" 
             :key="item.id"
             class="flex items-center justify-between py-4 border-b border-gray-100">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 flex-shrink-0">
              <img v-if="item.product.media?.[0]?.url" 
                   :src="item.product.media[0].url" 
                   :alt="item.product.name"
                   class="w-12 h-12 rounded-lg object-cover" />
              <div v-else
                   class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <i class="fas fa-box text-gray-400"></i>
              </div>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ item.product.name }}</h3>
              <p class="text-sm text-gray-500">{{ formatPrice(item.product.price) }} × {{ item.quantity }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <button @click="decreaseQuantity(item)"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <i class="fas fa-minus text-gray-600 text-sm"></i>
              </button>
              <span class="w-8 text-center">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <i class="fas fa-plus text-gray-600 text-sm"></i>
              </button>
            </div>
            <div class="w-24 text-right font-medium">
              {{ formatPrice(item.product.price * item.quantity) }}
            </div>
            <button @click="removeFromCart(item)" 
                    class="text-red-600 hover:text-red-700">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div v-if="cartItems.length > 0" class="mt-6 space-y-3">
        <!-- KDV Select -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600">KDV Oranı (%)</span>
          <select v-model="taxRate" 
                  class="rounded-lg border-gray-300 w-32 text-right">
            <option value="0">0%</option>
            <option value="1">1%</option>
            <option value="8">8%</option>
            <option value="18">18%</option>
          </select>
        </div>

        <!-- Discount Input -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600">İndirim Oranı (%)</span>
          <input type="number" 
                 v-model="discountRate"
                 min="0"
                 max="100"
                 class="rounded-lg border-gray-300 w-32 text-right" />
        </div>

        <div class="border-t border-gray-200 pt-4 space-y-2">
          <div class="flex justify-between text-gray-600">
            <span>Ara Toplam</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>KDV ({{ taxRate }}%)</span>
            <span>{{ formatPrice(taxAmount) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>İndirim ({{ discountRate }}%)</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="flex justify-between font-medium text-lg text-gray-900">
            <span>Toplam</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>

        <button @click="openCustomerModal"
                class="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          <i class="fas fa-check mr-2"></i>
          Satış Yap
        </button>
      </div>
    </div>

    <!-- Pending Sales Section -->
    <div v-if="pendingSales.length > 0" class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Bekleyen Satışlar</h2>
        <span class="text-sm text-gray-500">{{ pendingSales.length }} bekleyen satış</span>
      </div>

      <div class="space-y-4">
        <div v-for="sale in pendingSales" 
             :key="sale.id"
             class="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-xl">
          <div>
            <h3 class="font-medium text-gray-900">{{ sale.customer_name }}</h3>
            <p class="text-sm text-gray-500">{{ formatDate(sale.created_at) }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="font-medium">{{ formatPrice(sale.total_amount) }}</span>
            <span class="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Beklemede
            </span>
            <div class="flex items-center space-x-2">
              <button @click="approveSale(sale)" 
                      class="p-2 text-green-600 hover:text-green-700">
                <i class="fas fa-check"></i>
              </button>
              <button @click="cancelSale(sale)" 
                      class="p-2 text-red-600 hover:text-red-700">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Sale Modal -->
    <TransitionRoot appear :show="isCustomerModalOpen" as="template">
      <Dialog as="div" @close="closeCustomerModal" class="relative z-10">
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
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div class="flex items-center space-x-3 mb-6">
                  <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
                  </div>
                  <DialogTitle as="h3" class="text-xl font-bold text-gray-900">
                    Yeni Satış
                  </DialogTitle>
                </div>

                <div class="space-y-4">
                  <!-- Customer Selection in Modal -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Müşteri Seçimi
                    </label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="customerSearch"
                        placeholder="Müşteri ara..."
                        class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <!-- Selected Customer Info -->
                      <div v-if="selectedCustomer" class="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div class="font-medium text-gray-900">{{ selectedCustomer.name }}</div>
                        <div class="text-sm text-gray-500">
                          {{ selectedCustomer.phone || 'Telefon yok' }}
                          {{ selectedCustomer.email ? `• ${selectedCustomer.email}` : '' }}
                        </div>
                      </div>
                      <!-- Customer Suggestions -->
                      <div v-if="filteredCustomers.length > 0 && !selectedCustomer"
                           class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                        <div class="py-1">
                          <button v-for="customer in filteredCustomers"
                                  :key="customer.id"
                                  @click="selectCustomer(customer)"
                                  class="w-full px-4 py-2 text-left hover:bg-gray-50">
                            <div class="font-medium text-gray-900">{{ customer.name }}</div>
                            <div class="text-sm text-gray-500">
                              {{ customer.phone || 'Telefon yok' }}
                              {{ customer.email ? `• ${customer.email}` : '' }}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      v-model="saleNotes"
                      rows="3"
                      placeholder="Satış ile ilgili notlar..."
                      class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Toplam Tutar</span>
                      <span class="font-medium">{{ formatPrice(total) }}</span>
                    </div>
                    <div class="flex justify-between text-sm mt-1">
                      <span class="text-gray-600">Ürün Sayısı</span>
                      <span class="font-medium">{{ totalItems }} Adet</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="closeCustomerModal"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    @click="completeSale"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                  >
                    Onayla
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
import { ref, computed, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useToast } from 'vue-toastification'
import { useStore } from 'vuex'
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// State
const store = useStore()
const toast = useToast()
const isCustomerModalOpen = ref(false)
const selectedCustomer = ref(null)
const customerSearch = ref('')
const customers = ref([])
const filteredCustomers = computed(() => {
  if (!customerSearch.value) return []
  return customers.value.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.value.toLowerCase())
  )
})
const saleNotes = ref('')
const taxRate = ref(18)
const discountRate = ref(0)
const pendingSales = ref([])

// Format price function
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Computed
const cartItems = computed(() => store.getters['cart/cartItems'])

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const taxAmount = computed(() => {
  return subtotal.value * (taxRate.value / 100)
})

const discountAmount = computed(() => {
  const afterTax = subtotal.value + taxAmount.value
  return afterTax * (discountRate.value / 100)
})

const total = computed(() => {
  return subtotal.value + taxAmount.value - discountAmount.value
})

const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

// Methods
const loadPendingSales = async () => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    pendingSales.value = data
  } catch (error) {
    console.error('Error loading pending sales:', error)
    toast.error('Bekleyen satışlar yüklenirken bir hata oluştu')
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'd MMMM yyyy HH:mm', { locale: tr })
}

const approveSale = async (sale) => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({ status: 'completed' })
      .eq('id', sale.id)

    if (error) throw error

    toast.success('Satış onaylandı')
    loadPendingSales()
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
        products (
          stock
        )
      `)
      .eq('sale_id', sale.id)

    if (detailsError) throw detailsError

    // Her ürün için stok güncelleme işlemi yap
    for (const detail of saleDetails) {
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock: detail.products.stock + detail.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', detail.product_id)

      if (stockError) throw stockError
    }

    // Satışı iptal et
    const { error } = await supabase
      .from('sales')
      .update({ status: 'cancelled' })
      .eq('id', sale.id)

    if (error) throw error

    toast.success('Satış iptal edildi')
    loadPendingSales()
  } catch (error) {
    console.error('Error cancelling sale:', error)
    toast.error('Satış iptal edilirken bir hata oluştu')
  }
}

const increaseQuantity = (item) => {
  store.dispatch('cart/incrementQuantity', { type: 'product', id: item.id })
}

const decreaseQuantity = (item) => {
  if (item.quantity <= 1) {
    removeFromCart(item)
    return
  }
  store.dispatch('cart/decrementQuantity', { type: 'product', id: item.id })
}

const removeFromCart = (item) => {
  store.dispatch('cart/removeFromCart', { type: 'product', id: item.id })
  toast.success('Ürün sepetten kaldırıldı')
}

const clearCart = () => {
  store.dispatch('cart/clearCart')
  toast.success('Sepet temizlendi')
}

const openCustomerModal = () => {
  if (cartItems.value.length === 0) {
    toast.warning('Sepetiniz boş')
    return
  }
  isCustomerModalOpen.value = true
}

const closeCustomerModal = () => {
  isCustomerModalOpen.value = false
  selectedCustomer.value = null
  customerSearch.value = ''
  saleNotes.value = ''
}

const completeSale = async () => {
  if (!selectedCustomer.value) {
    toast.warning('Lütfen müşteri seçin')
    return
  }

  try {
    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: user.id,
        customer_id: selectedCustomer.value.id,
        sale_type: 'product',
        status: 'pending',
        total_amount: total.value,
        tax_rate: taxRate.value,
        discount_rate: discountRate.value,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saleError) throw saleError

    // Update customer notes if there are new notes
    if (saleNotes.value) {
      const existingNotes = selectedCustomer.value.notes || ''
      const newNotes = `${existingNotes}\n${new Date().toLocaleDateString()}: ${saleNotes.value}`.trim()
      
      const { error: customerError } = await supabase
        .from('customers')
        .update({ notes: newNotes })
        .eq('id', selectedCustomer.value.id)

      if (customerError) throw customerError
    }

    // Create sale items
    for (const item of cartItems.value) {
      const { error: itemError } = await supabase
        .from('sale_details')
        .insert({
          sale_id: sale.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity,
          product_id: item.product.id,
          created_at: new Date().toISOString()
        })

      if (itemError) throw itemError

      // Update stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock: item.product.stock - item.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product.id)

      if (stockError) throw stockError
    }

    // Clear cart and close modal
    store.dispatch('cart/clearCart')
    closeCustomerModal()
    loadPendingSales()
    toast.success('Satış kaydedildi ve beklemeye alındı')
  } catch (error) {
    console.error('Error completing sale:', error)
    toast.error('Satış tamamlanırken bir hata oluştu')
  }
}

// Load customers
const loadCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    
    if (error) throw error
    customers.value = data
  } catch (error) {
    console.error('Error loading customers:', error)
    toast.error('Müşteriler yüklenirken bir hata oluştu')
  }
}

// Add new method for customer selection
const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  customerSearch.value = customer.name
  // Dropdown'ı kapat
  filteredCustomers.value = []
}

// Update onMounted
onMounted(() => {
  loadPendingSales()
  loadCustomers()
})
</script>

