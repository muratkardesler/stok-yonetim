<template>
  <div>
    <!-- Header -->
    <div class="bg-surface dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
      <div class="px-6 py-5 border-b border-border dark:border-border-dark">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
              <i class="fas fa-box-archive text-primary dark:text-primary-light text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-text dark:text-text-dark">Ürünler</h2>
              <p class="text-sm text-text/60 dark:text-text-dark/60 mt-0.5">Tüm ürünlerinizi buradan yönetin</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- View Toggle -->
            <div class="flex items-center bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-1 shadow-sm">
              <button @click="viewMode = 'grid'"
                      :class="[
                        'px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2',
                        viewMode === 'grid' 
                          ? 'bg-primary text-white shadow-sm dark:bg-primary-dark' 
                          : 'text-text dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                      ]">
                <i class="fas fa-grid-2 transition-transform group-hover:scale-110"></i>
                <span class="text-sm font-medium">Izgara</span>
              </button>
              <button @click="viewMode = 'list'"
                      :class="[
                        'px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2',
                        viewMode === 'list' 
                          ? 'bg-primary text-white shadow-sm dark:bg-primary-dark' 
                          : 'text-text dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                      ]">
                <i class="fas fa-list transition-transform group-hover:scale-110"></i>
                <span class="text-sm font-medium">Liste</span>
              </button>
            </div>
            <button @click="showAddProductModal = true" 
                    class="inline-flex items-center px-4 py-2.5 bg-primary dark:bg-primary-dark text-white rounded-xl hover:bg-primary-dark focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 group shadow-sm">
              <i class="fas fa-plus mr-2 group-hover:scale-110 transition-transform"></i>
              <span>Yeni Ürün</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="p-4 border-b border-border dark:border-border-dark bg-background/50 dark:bg-background-dark/50">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Ürün ara..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all duration-200"
              >
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 dark:text-text-dark/40"></i>
            </div>
          </div>
          <div class="sm:w-64">
            <select 
              v-model="selectedCategoryFilter"
              class="custom-select w-full text-text dark:text-text-dark"
            >
              <option value="">Tüm Kategoriler</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-background/50 dark:bg-background-dark/50">
        <div class="bg-surface dark:bg-surface-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-text/60 dark:text-text-dark/60">Toplam Ürün</h3>
            <div class="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-box text-blue-500 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-2xl font-bold text-text dark:text-text-dark">
              {{ filteredProducts.length }}
            </span>
          </div>
        </div>
        
        <div class="bg-surface dark:bg-surface-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-text/60 dark:text-text-dark/60">Toplam Stok</h3>
            <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-layer-group text-emerald-500 dark:text-emerald-400"></i>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-2xl font-bold text-text dark:text-text-dark">
              {{ filteredProducts.reduce((sum, product) => sum + (parseInt(product.stock) || 0), 0) }}
            </span>
          </div>
        </div>

        <div class="bg-surface dark:bg-surface-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-text/60 dark:text-text-dark/60">Kritik Stok</h3>
            <div class="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-triangle-exclamation text-orange-500 dark:text-orange-400"></i>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-2xl font-bold text-text dark:text-text-dark">
              {{ filteredProducts.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= 10).length }}
            </span>
          </div>
        </div>

        <div class="bg-surface dark:bg-surface-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-text/60 dark:text-text-dark/60">Tükenen</h3>
            <div class="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-box-open text-red-500 dark:text-red-400"></i>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-2xl font-bold text-text dark:text-text-dark">
              {{ filteredProducts.filter(p => parseInt(p.stock) <= 0).length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="product in filteredProducts" :key="product.id"
             class="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <!-- Product Image -->
          <div class="relative aspect-square group">
            <div v-if="product.primary_image" 
                 class="w-full h-full">
              <img :src="product.primary_image" 
                   :alt="product.name"
                   class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <div v-else
                 :class="[getCategoryGradient(product.category_id), 'w-full h-full flex items-center justify-center']">
              <i class="fas fa-box-open text-4xl text-white/90"></i>
            </div>

            <!-- Action Buttons Overlay -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button @click.stop="editProduct(product)" 
                      class="p-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg">
                <i class="fas fa-edit text-lg"></i>
              </button>
              <button @click.stop="deleteProduct(product)" 
                      class="p-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg">
                <i class="fas fa-trash text-lg"></i>
              </button>
            </div>

            <!-- Stock Status Overlay -->
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t"
                 :class="getStockGradient(product.stock)">
            </div>

            <!-- Category Badge -->
            <div class="absolute top-3 left-3">
              <span class="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/90 backdrop-blur-sm shadow-sm"
                    :class="getCategoryBadgeColor(product.category_id)">
                {{ getCategoryName(product.category_id) }}
              </span>
            </div>

            <!-- Stock Badge -->
            <div class="absolute top-3 right-3">
              <span class="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium shadow-sm"
                    :class="getStockTextColor(product.stock)">
                {{ product.stock }} Adet
              </span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
            
            <!-- Price Section -->
            <div class="mt-3 flex items-end justify-between">
              <div>
                <p class="text-2xl font-bold text-gray-900">₺{{ formatPrice(product.price) }}</p>
                <p class="text-sm text-gray-500 mt-0.5">KDV Dahil</p>
              </div>
              
              <!-- Mini Price Trend -->
              <div class="flex items-center space-x-1 text-sm">
                <span class="text-emerald-600">
                  <i class="fas fa-trending-up"></i>
                  %12
                </span>
                <div class="w-16 h-8">
                  <!-- Mini Chart will be added here -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Durumu</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="product in filteredProducts" :key="product.id" 
                class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div v-if="product.primary_image" 
                       class="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                    <img :src="product.primary_image" 
                         :alt="product.name"
                         class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div v-else
                       class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100"
                       :class="getCategoryBgColor(product.category_id)">
                    <i class="fas fa-box text-2xl" :class="getCategoryTextColor(product.category_id)"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-900">{{ product.name }}</span>
                    <span class="text-xs text-gray-500 mt-0.5">{{ product.primary_image ? 'Görsel Yüklendi' : 'Görsel Yok' }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1.5 inline-flex text-sm font-medium rounded-lg"
                      :class="getCategoryBadgeColor(product.category_id)">
                  {{ getCategoryName(product.category_id) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 rounded-full" 
                       :class="[product.stock <= 0 ? 'bg-red-500' : product.stock <= 10 ? 'bg-orange-500' : 'bg-green-500']"></div>
                  <div class="font-mono text-sm" :class="getStockColor(product.stock)">
                    {{ product.stock }} Adet
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-mono text-sm font-bold text-emerald-600">
                  ₺{{ formatPrice(product.price) }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="editProduct(product)" 
                          class="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteProduct(product)" 
                          class="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <Modal v-if="showAddProductModal" @close="closeAddProductModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center"
               :class="selectedCategory ? getCategoryBgColor(selectedCategory.id) : 'bg-gradient-to-br from-indigo-500 to-indigo-600'">
            <i class="fas fa-box text-xl" :class="selectedCategory ? getCategoryTextColor(selectedCategory.id) : 'text-white'"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün' }}
          </h3>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="saveProduct" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              v-model="productForm.category_id"
              required
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
              <option value="" disabled>Kategori Seçin</option>
              <optgroup v-for="mainCat in mainCategories" :key="mainCat.id" :label="mainCat.name">
                <option :value="mainCat.id">{{ mainCat.name }}</option>
                <option v-for="subCat in getSubCategories(mainCat.id)" 
                        :key="subCat.id" 
                        :value="subCat.id"
                        class="ml-2">
                  ↳ {{ subCat.name }}
                </option>
              </optgroup>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
            <input
              type="text"
              v-model="productForm.name"
              required
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Ürün adını girin">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stok Miktarı</label>
              <div class="relative">
                <input
                  type="number"
                  v-model.number="productForm.stock"
                  required
                  min="0"
                  class="block w-full rounded-xl border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  placeholder="0">
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span class="text-gray-500 text-sm">Adet</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 text-sm">₺</span>
                </div>
                <input
                  type="number"
                  v-model.number="productForm.price"
                  required
                  min="0"
                  step="0.01"
                  class="block w-full rounded-xl border-gray-300 pl-7 pr-4 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  placeholder="0.00">
              </div>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeAddProductModal" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            İptal
          </button>
          <button @click="saveProduct" 
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors">
            {{ editingProduct ? 'Güncelle' : 'Kaydet' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Ürün Sil</h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">
            <span class="font-medium text-gray-900">"{{ itemToDelete?.name }}"</span> ürününü silmek istediğinizden emin misiniz?
            <br>
            <span class="text-red-600 text-sm mt-2 block">
              Bu işlem geri alınamaz.
            </span>
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeDeleteModal" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            Vazgeç
          </button>
          <button @click="confirmDelete" 
                  class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-colors">
            Evet, Sil
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'
import gsap from 'gsap'

export default {
  name: 'Products',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const products = ref([])
    const categories = ref([])
    const searchQuery = ref('')
    const selectedCategoryFilter = ref('')
    const showAddProductModal = ref(false)
    const editingProduct = ref(null)
    const showDeleteModal = ref(false)
    const itemToDelete = ref(null)
    const viewMode = ref('grid') // 'grid' or 'list'

    const productForm = ref({
      name: '',
      category_id: '',
      stock: 0,
      price: 0
    })

    // Load data
    const loadProducts = async () => {
      try {
        console.log('Starting to load products...')
        
        // Kullanıcı bilgisini al ve kontrol et
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          throw userError
        }

        if (!user) {
          console.error('No user found')
          return
        }

        console.log('Current user ID:', user.id)
        
        // Ürünleri çek
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('name')
        
        if (productsError) {
          console.error('Error fetching products:', productsError)
          throw productsError
        }

        console.log('Products data received:', productsData)

        if (!productsData) {
          console.log('No products data received')
          products.value = []
          return
        }

        // Ürün resimlerini çek
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('is_primary', true)
          .in('product_name', productsData.map(p => p.name))

        if (imagesError) {
          console.error('Error fetching images:', imagesError)
        }

        console.log('Images data received:', imagesData)

        // Ürünleri products.value'ya ata
        products.value = productsData.map(product => {
          const primaryImage = imagesData?.find(img => img.product_name === product.name)
          return {
            ...product,
            stock: parseInt(product.stock) || 0,
            primary_image: primaryImage?.image_url || null
          }
        })

        console.log('Final products array:', products.value)

      } catch (error) {
        console.error('Error in loadProducts:', error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
        products.value = []
      }
    }

    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        
        if (error) throw error
        categories.value = data
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Kategoriler yüklenirken bir hata oluştu')
      }
    }

    // Computed properties
    const mainCategories = computed(() => {
      return categories.value.filter(cat => !cat.parent_id)
    })

    const filteredProducts = computed(() => {
      console.log('Computing filtered products. Current products:', products.value)
      if (!products.value || !Array.isArray(products.value)) {
        console.log('Products is not an array')
        return []
      }

      let filtered = products.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query)
        )
      }

      if (selectedCategoryFilter.value) {
        filtered = filtered.filter(product => 
          product.category_id === selectedCategoryFilter.value
        )
      }

      console.log('Filtered products:', filtered)
      return filtered
    })

    const selectedCategory = computed(() => {
      if (!productForm.value.category_id) return null
      return categories.value.find(cat => cat.id === productForm.value.category_id)
    })

    // Helper functions
    const getSubCategories = (parentId) => {
      return categories.value.filter(cat => cat.parent_id === parentId)
    }

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      return category ? category.name : ''
    }

    const getCategoryGradient = (categoryId) => {
      return 'bg-gray-100'
    }

    const getStockGradient = (stock) => {
      return 'from-transparent to-black/5'
    }

    const getStockTextColor = (stock) => {
      if (stock <= 0) return 'text-gray-700 bg-white/90 ring-1 ring-gray-200'
      if (stock <= 10) return 'text-gray-700 bg-white/90 ring-1 ring-gray-200'
      return 'text-gray-700 bg-white/90 ring-1 ring-gray-200'
    }

    const getCategoryBadgeColor = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      if (!category) return ''

      const mainCategoryIndex = mainCategories.value.findIndex(cat => 
        cat.id === (category.parent_id || category.id)
      )

      const colors = [
        'text-blue-600 bg-blue-50 ring-1 ring-blue-200',
        'text-purple-600 bg-purple-50 ring-1 ring-purple-200',
        'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200',
        'text-orange-600 bg-orange-50 ring-1 ring-orange-200',
        'text-pink-600 bg-pink-50 ring-1 ring-pink-200',
        'text-cyan-600 bg-cyan-50 ring-1 ring-cyan-200'
      ]
      return colors[mainCategoryIndex % colors.length]
    }

    const getCategoryBgColor = (categoryId) => {
      const colors = {
        blue: 'bg-blue-50',
        purple: 'bg-purple-50',
        green: 'bg-emerald-50',
        orange: 'bg-orange-50',
        pink: 'bg-pink-50'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
    }

    const getCategoryTextColor = (categoryId) => {
      const colors = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        green: 'text-emerald-600',
        orange: 'text-orange-600',
        pink: 'text-pink-600'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
    }

    const getStockColor = (stock) => {
      return 'text-gray-700'
    }

    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    // Modal operations
    const closeAddProductModal = () => {
      showAddProductModal.value = false
      editingProduct.value = null
      productForm.value = { name: '', category_id: '', stock: 0, price: 0 }
    }

    const editProduct = (product) => {
      editingProduct.value = product
      productForm.value = { ...product }
      showAddProductModal.value = true
    }

    const deleteProduct = (product) => {
      itemToDelete.value = product
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      itemToDelete.value = null
    }

    // Save operations
    const saveProduct = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Current user:', user)
        
        const productData = {
          name: productForm.value.name,
          category_id: productForm.value.category_id,
          stock: parseInt(productForm.value.stock) || 0,
          price: parseFloat(productForm.value.price) || 0,
          user_id: user.id
        }
        
        console.log('Saving product data:', productData)
        
        if (editingProduct.value) {
          const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.value.id)
            .select()

          if (error) {
            console.error('Error updating product:', error)
            throw error
          }
          console.log('Updated product:', data)
          toast.success('Ürün güncellendi')
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()

          if (error) {
            console.error('Error inserting product:', error)
            throw error
          }
          console.log('Inserted product:', data)
          toast.success('Ürün eklendi')
        }

        closeAddProductModal()
        await loadProducts()
      } catch (error) {
        console.error('Error saving product:', error)
        toast.error('Ürün kaydedilirken bir hata oluştu: ' + error.message)
      }
    }

    const confirmDelete = async () => {
      try {
        // Önce sale_details tablosundaki ilgili kayıtları sil
        const { error: saleDetailsError } = await supabase
          .from('sale_details')
          .delete()
          .eq('product_id', itemToDelete.value.id)

        if (saleDetailsError) {
          console.error('Error deleting sale details:', saleDetailsError)
          throw saleDetailsError
        }

        // Sonra package_products tablosundaki ilgili kayıtları sil
        const { error: packageProductsError } = await supabase
          .from('package_products')
          .delete()
          .eq('product_id', itemToDelete.value.id)

        if (packageProductsError) {
          console.error('Error deleting package products:', packageProductsError)
          throw packageProductsError
        }

        // En son ürünü sil
        const { error: productError } = await supabase
          .from('products')
          .delete()
          .eq('id', itemToDelete.value.id)

        if (productError) {
          console.error('Error deleting product:', productError)
          throw productError
        }
        
        toast.success('Ürün başarıyla silindi')
        loadProducts()
        closeDeleteModal()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Ürün silinirken bir hata oluştu: ' + error.message)
      }
    }

    // Animasyon fonksiyonları
    const animateNumber = (el, value) => {
      if (!el || typeof value !== 'number' || isNaN(value)) return
      
      const duration = 1
      const start = Number(el.textContent) || 0
      const end = Number(value) || 0
      const range = end - start
      
      gsap.to({}, {
        duration,
        onUpdate: () => {
          const progress = gsap.getProperty({}, 'progress')
          el.textContent = Math.round(start + (range * progress))
        }
      })
    }

    // İstatistik değerlerini izle ve animasyonla güncelle
    watch([filteredProducts], ([newProducts], [oldProducts]) => {
      if (newProducts.length !== oldProducts.length) {
        nextTick(() => {
          const elements = document.querySelectorAll('.animate-count')
          elements.forEach((el, index) => {
            const value = newProducts.length
            if (!isNaN(value)) {
              animateNumber(el, value)
            }
          })
        })
      }
    })

    onMounted(() => {
      loadProducts()
      loadCategories()
    })

    return {
      products,
      categories,
      searchQuery,
      selectedCategoryFilter,
      showAddProductModal,
      productForm,
      editingProduct,
      showDeleteModal,
      itemToDelete,
      mainCategories,
      filteredProducts,
      selectedCategory,
      getSubCategories,
      getCategoryName,
      getCategoryBgColor,
      getCategoryTextColor,
      getCategoryBadgeColor,
      getStockColor,
      formatPrice,
      closeAddProductModal,
      editProduct,
      deleteProduct,
      closeDeleteModal,
      saveProduct,
      confirmDelete,
      viewMode,
      getCategoryGradient,
      getStockGradient,
      getStockTextColor
    }
  }
}
</script>

<style>
/* Özel animasyonlar */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover animasyonları */
.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Form elemanları için özel stiller */
.custom-input {
  @apply bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl px-4 py-2.5 focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all duration-200;
}

.custom-select {
  @apply appearance-none bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl px-4 py-2.5 pr-10 focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all duration-200;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
</style> 