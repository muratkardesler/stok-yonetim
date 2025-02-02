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
        <router-link to="/dashboard" class="nav-item">
          <i class="fas fa-chart-line"></i>
          <span>Güncel Durum</span>
        </router-link>
        <router-link to="/sales" class="nav-item">
          <i class="fas fa-shopping-cart"></i>
          <span>Satışlar</span>
        </router-link>
        <router-link to="/customers" class="nav-item active">
          <i class="fas fa-users"></i>
          <span>Müşteriler</span>
        </router-link>
        <router-link to="/stock" class="nav-item">
          <i class="fas fa-box"></i>
          <span>Stok</span>
        </router-link>
      </nav>
    </aside>

    <!-- Ana İçerik -->
    <main class="main-content">
      <div class="container mx-auto px-4 py-8">
        <!-- Üst Kısım: Başlık, İstatistikler ve Arama -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Müşteriler</h1>
            <button @click="showAddCustomerModal = true" 
                    class="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all">
              <i class="fas fa-plus mr-2"></i>
              Yeni Müşteri
            </button>
          </div>

          <!-- İstatistik Kartları -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Toplam Müşteri -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Toplam Müşteri</p>
                  <p class="text-2xl font-bold text-gray-900">{{ totalCustomers }}</p>
                </div>
                <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <i class="fas fa-users text-primary-600 text-xl"></i>
                </div>
              </div>
            </div>

            <!-- Aktif Müşteri -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Aktif Müşteri</p>
                  <p class="text-2xl font-bold text-gray-900">{{ activeCustomers }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i class="fas fa-user-check text-green-600 text-xl"></i>
                </div>
              </div>
            </div>

            <!-- Toplam Satış -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Toplam Satış</p>
                  <p class="text-2xl font-bold text-gray-900">₺{{ formatPrice(totalSales) }}</p>
                </div>
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Arama ve Filtreleme -->
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Arama -->
            <div class="flex-1">
              <div class="relative">
                <input 
                  type="text" 
                  v-model="searchQuery"
                  placeholder="Müşteri ara..."
                  class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  @input="searchCustomers"
                >
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <!-- Filtreler -->
            <div class="flex space-x-2">
              <select 
                v-model="statusFilter"
                class="rounded-xl border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="passive">Pasif</option>
              </select>

              <select 
                v-model="sortBy"
                class="rounded-xl border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                <option value="name">İsme Göre</option>
                <option value="total_purchases_desc">En Çok Alışveriş</option>
                <option value="last_purchase_desc">Son Alışveriş</option>
                <option value="created_at_desc">Yeniden Eskiye</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Müşteri Listesi -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <!-- Yükleniyor -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <i class="fas fa-spinner fa-spin text-xl text-primary-500"></i>
          </div>

          <!-- Veri Yok -->
          <div v-else-if="filteredCustomers.length === 0" class="text-center py-8">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-users text-gray-400 text-lg"></i>
            </div>
            <p class="text-gray-500 text-sm">Müşteri bulunamadı</p>
            <p v-if="searchQuery" class="text-sm text-gray-400 mt-1">Farklı bir arama terimi deneyin</p>
          </div>

          <!-- Müşteri Tablosu -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th class="pb-3 font-medium">Müşteri</th>
                  <th class="pb-3 font-medium">İletişim</th>
                  <th class="pb-3 font-medium">Toplam Alışveriş</th>
                  <th class="pb-3 font-medium">Son Alışveriş</th>
                  <th class="pb-3 font-medium">Durum</th>
                  <th class="pb-3 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="customer in paginatedCustomers" 
                    :key="customer.id"
                    class="text-sm text-gray-900">
                  <td class="py-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-primary-600 font-medium">{{ customer.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div>
                        <p class="font-medium">{{ customer.name }}</p>
                        <p class="text-xs text-gray-500">Müşteri ID: {{ customer.id.slice(0,8) }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4">
                    <p v-if="customer.phone" class="text-gray-600">
                      <i class="fas fa-phone-alt mr-1"></i>
                      {{ customer.phone }}
                    </p>
                    <p v-if="customer.email" class="text-gray-600">
                      <i class="fas fa-envelope mr-1"></i>
                      {{ customer.email }}
                    </p>
                  </td>
                  <td class="py-4">
                    <p class="font-medium">₺{{ formatPrice(customer.total_purchases) }}</p>
                  </td>
                  <td class="py-4">
                    <p>{{ formatDate(customer.last_purchase_date) }}</p>
                  </td>
                  <td class="py-4">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    ]">
                      {{ customer.status === 'active' ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="py-4">
                    <div class="flex space-x-2">
                      <button @click="editCustomer(customer)" 
                              class="p-2 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="showCustomerDetails(customer)" 
                              class="p-2 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Sayfalama -->
            <div class="flex justify-between items-center mt-4">
              <p class="text-sm text-gray-500">
                Toplam {{ totalCustomers }} müşteriden {{ startIndex + 1 }}-{{ endIndex }} arası gösteriliyor
              </p>
              <div class="flex space-x-2">
                <button @click="prevPage" 
                        :disabled="currentPage === 1"
                        class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="text-sm text-gray-600">
                  Sayfa {{ currentPage }} / {{ totalPages }}
                </span>
                <button @click="nextPage"
                        :disabled="currentPage === totalPages"
                        class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Müşteri Ekleme/Düzenleme Modal -->
        <Modal v-if="showAddCustomerModal" @close="closeCustomerModal">
          <template #header>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-user-plus text-primary-600 text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900">{{ editingCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri' }}</h3>
            </div>
          </template>
          <template #body>
            <form @submit.prevent="saveCustomer" class="space-y-4">
              <!-- Müşteri Adı -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Adı
                </label>
                <input type="text" 
                       v-model="customerForm.name"
                       required
                       placeholder="Müşteri adı girin"
                       class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500">
              </div>

              <!-- Telefon -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input type="tel" 
                       v-model="customerForm.phone"
                       placeholder="Telefon numarası"
                       class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500">
              </div>

              <!-- E-posta -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input type="email" 
                       v-model="customerForm.email"
                       placeholder="E-posta adresi"
                       class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500">
              </div>

              <!-- Adres -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea v-model="customerForm.address"
                          rows="3"
                          placeholder="Adres bilgisi"
                          class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"></textarea>
              </div>

              <!-- Notlar -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea v-model="customerForm.notes"
                          rows="3"
                          placeholder="Müşteri ile ilgili notlar"
                          class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"></textarea>
              </div>

              <!-- Durum -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select v-model="customerForm.status"
                        class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500">
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
              </div>

              <!-- Butonlar -->
              <div class="flex space-x-3 pt-4">
                <button type="button"
                        @click="closeCustomerModal"
                        class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                  İptal
                </button>
                <button type="submit"
                        :disabled="processing"
                        class="flex-1 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ processing ? 'Kaydediliyor...' : (editingCustomer ? 'Güncelle' : 'Kaydet') }}
                </button>
              </div>
            </form>
          </template>
        </Modal>

        <!-- Müşteri Detay Modal -->
        <Modal v-if="showCustomerDetailsModal" @close="closeCustomerDetailsModal">
          <template #header>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-user text-primary-600 text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Müşteri Detayları</h3>
            </div>
          </template>
          <template #body>
            <div v-if="selectedCustomer" class="space-y-6">
              <!-- Müşteri Bilgileri -->
              <div class="bg-gray-50 p-4 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Müşteri Bilgileri</h4>
                <p class="text-sm text-gray-900">{{ selectedCustomer.name }}</p>
                <p v-if="selectedCustomer.phone" class="text-sm text-gray-600 mt-1">
                  <i class="fas fa-phone-alt mr-1"></i>
                  {{ selectedCustomer.phone }}
                </p>
                <p v-if="selectedCustomer.email" class="text-sm text-gray-600 mt-1">
                  <i class="fas fa-envelope mr-1"></i>
                  {{ selectedCustomer.email }}
                </p>
                <p v-if="selectedCustomer.address" class="text-sm text-gray-600 mt-1">
                  <i class="fas fa-map-marker-alt mr-1"></i>
                  {{ selectedCustomer.address }}
                </p>
                <p v-if="selectedCustomer.notes" class="text-sm text-gray-600 mt-2">
                  {{ selectedCustomer.notes }}
                </p>
              </div>

              <!-- Alışveriş İstatistikleri -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Alışveriş İstatistikleri</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 p-4 rounded-xl">
                    <p class="text-sm text-gray-500">Toplam Alışveriş</p>
                    <p class="text-lg font-bold text-gray-900">₺{{ formatPrice(selectedCustomer.total_purchases) }}</p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-xl">
                    <p class="text-sm text-gray-500">Son Alışveriş</p>
                    <p class="text-lg font-bold text-gray-900">{{ formatDate(selectedCustomer.last_purchase_date) }}</p>
                  </div>
                </div>
              </div>

              <!-- Son Alışverişler -->
              <div v-if="customerSales.length > 0">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Alışveriş Geçmişi</h4>
                <div class="space-y-2">
                  <div v-for="sale in customerSales" 
                       :key="sale.id"
                       class="p-4 bg-gray-50 rounded-xl">
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ formatDate(sale.created_at) }}</p>
                        <span :class="[
                          'px-2 py-1 text-xs font-medium rounded-full inline-block mt-1',
                          sale.sale_type === 'package' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                        ]">
                          {{ sale.sale_type === 'package' ? 'Paket' : 'Ürün' }}
                        </span>
                      </div>
                      <span class="text-lg font-bold text-indigo-600">₺{{ formatPrice(sale.total_amount) }}</span>
                    </div>

                    <!-- Satış Detayları -->
                    <div class="space-y-2">
                      <div v-for="detail in sale.details" :key="detail.id" 
                           class="flex justify-between items-center p-2 bg-white rounded-lg">
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
                </div>
              </div>
              <div v-else class="text-center py-4">
                <p class="text-sm text-gray-500">Henüz alışveriş geçmişi bulunmuyor</p>
              </div>

              <!-- Kapat Butonu -->
              <button @click="closeCustomerDetailsModal"
                      class="w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                Kapat
              </button>
            </div>
          </template>
        </Modal>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Customers',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const customers = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const sortBy = ref('name')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const showAddCustomerModal = ref(false)
    const showCustomerDetailsModal = ref(false)
    const processing = ref(false)
    const editingCustomer = ref(null)
    const selectedCustomer = ref(null)
    const customerSales = ref([])
    const isMenuCollapsed = ref(false)

    // Müşteri formu
    const customerForm = ref({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      status: 'active'
    })

    // Computed Properties
    const filteredCustomers = computed(() => {
      let filtered = [...customers.value]

      // Arama filtresi
      if (searchQuery.value.trim()) {
        const search = searchQuery.value.toLowerCase()
        filtered = filtered.filter(customer => 
          customer.name.toLowerCase().includes(search) ||
          customer.phone?.includes(search) ||
          customer.email?.toLowerCase().includes(search)
        )
      }

      // Durum filtresi
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(customer => customer.status === statusFilter.value)
      }

      // Sıralama
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'total_purchases_desc':
            return b.total_purchases - a.total_purchases
          case 'last_purchase_desc':
            return new Date(b.last_purchase_date) - new Date(a.last_purchase_date)
          case 'created_at_desc':
            return new Date(b.created_at) - new Date(a.created_at)
          default:
            return a.name.localeCompare(b.name)
        }
      })

      return filtered
    })

    const paginatedCustomers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredCustomers.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredCustomers.value.length / pageSize.value)
    )

    const startIndex = computed(() => 
      (currentPage.value - 1) * pageSize.value
    )

    const endIndex = computed(() => 
      Math.min(startIndex.value + pageSize.value, filteredCustomers.value.length)
    )

    const totalCustomers = computed(() => customers.value.length)

    const activeCustomers = computed(() => 
      customers.value.filter(c => c.status === 'active').length
    )

    const totalSales = computed(() => 
      customers.value.reduce((sum, customer) => sum + (customer.total_purchases || 0), 0)
    )

    // Methods
    const loadCustomers = async () => {
      try {
        loading.value = true
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name')

        if (error) throw error
        customers.value = data
      } catch (error) {
        console.error('Error loading customers:', error)
        toast.error('Müşteriler yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    const searchCustomers = () => {
      currentPage.value = 1
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const editCustomer = (customer) => {
      editingCustomer.value = customer
      customerForm.value = { ...customer }
      showAddCustomerModal.value = true
    }

    const closeCustomerModal = () => {
      showAddCustomerModal.value = false
      editingCustomer.value = null
      customerForm.value = {
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        status: 'active'
      }
    }

    const saveCustomer = async () => {
      if (!customerForm.value.name.trim()) {
        toast.error('Müşteri adı gereklidir')
        return
      }

      processing.value = true
      try {
        const customerData = {
          name: customerForm.value.name.trim(),
          phone: customerForm.value.phone?.trim() || null,
          email: customerForm.value.email?.trim() || null,
          address: customerForm.value.address?.trim() || null,
          notes: customerForm.value.notes?.trim() || null,
          status: customerForm.value.status || 'active',
          total_purchases: 0,
          last_purchase_date: null
        }

        if (editingCustomer.value) {
          // Müşteri güncelleme
          const { error } = await supabase
            .from('customers')
            .update(customerData)
            .eq('id', editingCustomer.value.id)

          if (error) throw error
          toast.success('Müşteri başarıyla güncellendi')
        } else {
          // Yeni müşteri ekleme
          const { error } = await supabase
            .from('customers')
            .insert([customerData])

          if (error) throw error
          toast.success('Müşteri başarıyla eklendi')
        }

        await loadCustomers()
        closeCustomerModal()
      } catch (error) {
        console.error('Error saving customer:', error)
        toast.error('Müşteri kaydedilirken bir hata oluştu: ' + error.message)
      } finally {
        processing.value = false
      }
    }

    const showCustomerDetails = async (customer) => {
      selectedCustomer.value = customer
      showCustomerDetailsModal.value = true

      try {
        // Müşterinin tüm satışlarını yükle
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            created_at,
            sale_type,
            total_amount,
            details:sale_details(
              id,
              quantity,
              unit_price,
              total_price,
              product:products(name),
              package:packages(name)
            )
          `)
          .eq('status', 'completed')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })

        if (salesError) throw salesError

        // Satışları kaydet
        customerSales.value = salesData || []

        // Toplam alışveriş tutarını hesapla
        const totalPurchases = customerSales.value.reduce((sum, sale) => sum + Number(sale.total_amount), 0)

        // Son alışveriş tarihini bul
        const lastPurchaseDate = customerSales.value[0]?.created_at || null

        // Müşteri bilgilerini güncelle
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            total_purchases: totalPurchases,
            last_purchase_date: lastPurchaseDate
          })
          .eq('id', customer.id)

        if (updateError) throw updateError

        // Güncel müşteri bilgilerini al
        const { data: updatedCustomer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customer.id)
          .single()

        if (customerError) throw customerError

        // Seçili müşteriyi güncelle
        selectedCustomer.value = updatedCustomer
      } catch (error) {
        console.error('Error loading customer details:', error)
        toast.error('Müşteri detayları yüklenirken bir hata oluştu')
      }
    }

    const closeCustomerDetailsModal = () => {
      showCustomerDetailsModal.value = false
      selectedCustomer.value = null
      customerSales.value = []
    }

    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const toggleMenu = () => {
      isMenuCollapsed.value = !isMenuCollapsed.value
    }

    // Sayfa yüklendiğinde müşterileri getir
    onMounted(() => {
      loadCustomers()
    })

    return {
      customers,
      loading,
      searchQuery,
      statusFilter,
      sortBy,
      currentPage,
      showAddCustomerModal,
      showCustomerDetailsModal,
      processing,
      customerForm,
      editingCustomer,
      selectedCustomer,
      customerSales,
      filteredCustomers,
      paginatedCustomers,
      totalPages,
      startIndex,
      endIndex,
      totalCustomers,
      activeCustomers,
      totalSales,
      searchCustomers,
      prevPage,
      nextPage,
      editCustomer,
      closeCustomerModal,
      saveCustomer,
      showCustomerDetails,
      closeCustomerDetailsModal,
      formatPrice,
      formatDate,
      isMenuCollapsed,
      toggleMenu,
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--background-light);
}

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

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.menu-collapsed .logo-text {
  display: none;
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

.main-content {
  flex: 1;
  overflow-y: auto;
}

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
}
</style> 