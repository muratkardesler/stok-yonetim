<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center justify-between">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Ürün Satış</h1>
        <p class="mt-2 text-sm text-gray-700">
          Satmak istediğiniz ürünleri sepete ekleyebilirsiniz.
        </p>
      </div>
      
      <!-- Search Bar -->
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Ürün ara..."
            class="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Filters -->
    <div class="mt-8">
      <div class="flex flex-wrap gap-2">
        <button
          @click="selectedCategory = null"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            !selectedCategory 
              ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          ]"
        >
          Tümü
        </button>
        <button
          v-for="category in displayedCategories"
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            selectedCategory === category.id
              ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          ]"
        >
          {{ category.name }}
        </button>
        <!-- Back button when showing child categories -->
        <button
          v-if="selectedCategory && !childCategories.length"
          @click="selectedCategory = null"
          class="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          Geri
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="mt-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- No Results -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-gray-400">
          <i class="fas fa-box-open text-6xl"></i>
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Ürün Bulunamadı</h3>
        <p class="mt-2 text-sm text-gray-500">
          {{ searchQuery ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Bu kategoride henüz ürün bulunmuyor.' }}
        </p>
      </div>

      <!-- Products -->
      <div v-else class="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        <div v-for="product in filteredProducts" 
             :key="product.id" 
             class="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
          <!-- Product Image -->
          <div class="aspect-square w-full overflow-hidden rounded-t-2xl">
            <img v-if="product.media?.[0]?.url" 
                 :src="product.media[0].url"
                 :alt="product.name"
                 class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
            <div v-else
                 class="h-full w-full bg-gray-100 flex items-center justify-center">
              <i class="fas fa-image text-gray-400 text-4xl"></i>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ product.name }}</h3>
                <p class="mt-1">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="[
                          getCategoryBgColor(product.category_id),
                          getCategoryTextColor(product.category_id)
                        ]">
                    {{ product.category.name }}
                  </span>
                </p>
              </div>
              <p class="text-lg font-bold text-indigo-600">{{ formatPrice(product.price) }}</p>
            </div>

            <!-- Stock and Add to Cart -->
            <div class="mt-4 flex items-center justify-between">
              <span :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              ]">
                {{ product.stock }} adet
              </span>
              <button
                @click="openQuantityModal(product)"
                :disabled="product.stock <= 0"
                class="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i class="fas fa-shopping-cart mr-2"></i>
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quantity Modal -->
    <Modal v-if="showQuantityModal" @close="closeQuantityModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Sepete Ekle</h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <img v-if="selectedProduct?.media?.[0]?.url" 
                 :src="selectedProduct.media[0].url" 
                 :alt="selectedProduct?.name"
                 class="w-20 h-20 rounded-lg object-cover" />
            <div v-else
                 class="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <i class="fas fa-image text-gray-400 text-2xl"></i>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ selectedProduct?.name }}</h4>
              <p class="text-sm text-gray-500">Stok: {{ selectedProduct?.stock }} adet</p>
              <p class="text-indigo-600 font-medium mt-1">{{ formatPrice(selectedProduct?.price) }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adet</label>
            <div class="flex items-center space-x-3">
              <button @click="decrementQuantity"
                      class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <i class="fas fa-minus text-gray-600"></i>
              </button>
              <input type="number" 
                     v-model="quantity" 
                     min="1" 
                     :max="selectedProduct?.stock"
                     class="block w-20 rounded-lg border-gray-300 text-center" />
              <button @click="incrementQuantity"
                      class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <i class="fas fa-plus text-gray-600"></i>
              </button>
            </div>
            <p v-if="quantity > selectedProduct?.stock" 
               class="mt-1 text-sm text-red-600">
              Stok miktarını aşamazsınız
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeQuantityModal"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
            İptal
          </button>
          <button @click="confirmAddToCart"
                  :disabled="!isValidQuantity"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Sepete Ekle
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Modal from '@/components/Modal.vue'

export default {
  name: 'ProductSale',
  components: {
    Modal
  },
  setup() {
    const products = ref([])
    const categories = ref([])
    const selectedCategory = ref(null)
    const searchQuery = ref('')
    const loading = ref(true)
    const toast = useToast()
    const router = useRouter()
    const store = useStore()

    const showQuantityModal = ref(false)
    const selectedProduct = ref(null)
    const quantity = ref(1)

    // Load categories
    const loadCategories = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error
        categories.value = data
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Kategoriler yüklenirken bir hata oluştu')
      }
    }

    // Computed properties for categories
    const parentCategories = computed(() => {
      return categories.value.filter(cat => !cat.parent_id)
    })

    const childCategories = computed(() => {
      if (!selectedCategory.value) return []
      return categories.value.filter(cat => cat.parent_id === selectedCategory.value)
    })

    // Update template section for category filters
    const displayedCategories = computed(() => {
      if (!selectedCategory.value) {
        return parentCategories.value
      }
      return childCategories.value
    })

    // Load products
    const loadProducts = async () => {
      loading.value = true
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            stock,
            category_id,
            category:categories!inner (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error

        // Tüm ürün resimlerini ayrı bir sorgu ile al
        const { data: allImages, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .order('is_primary', { ascending: false })

        if (imagesError) throw imagesError

        // Ürünleri ve resimleri eşleştir
        products.value = data.map(product => {
          const productImages = allImages.filter(img => img.product_name === product.name)
          const primaryImage = productImages.find(img => img.is_primary) || productImages[0]
          
          return {
            ...product,
            media: primaryImage ? [{ url: primaryImage.image_url }] : []
          }
        })
      } catch (error) {
        console.error('Error loading products:', error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    // Filtered products
    const filteredProducts = computed(() => {
      let filtered = products.value

      // Category filter
      if (selectedCategory.value) {
        const selectedCat = categories.value.find(c => c.id === selectedCategory.value)
        if (selectedCat) {
          if (!selectedCat.parent_id) {
            // If parent category is selected, show products from both parent and its children
            const childCatIds = categories.value
              .filter(c => c.parent_id === selectedCat.id)
              .map(c => c.id)
            filtered = filtered.filter(p => 
              p.category_id === selectedCat.id || childCatIds.includes(p.category_id)
            )
          } else {
            // If child category is selected, show only its products
            filtered = filtered.filter(p => p.category_id === selectedCat.id)
          }
        }
      }

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.category.name.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const isValidQuantity = computed(() => {
      return quantity.value >= 1 && quantity.value <= (selectedProduct.value?.stock || 0)
    })

    const openQuantityModal = (product) => {
      selectedProduct.value = product
      quantity.value = 1
      showQuantityModal.value = true
    }

    const closeQuantityModal = () => {
      showQuantityModal.value = false
      selectedProduct.value = null
      quantity.value = 1
    }

    const incrementQuantity = () => {
      if (quantity.value < selectedProduct.value?.stock) {
        quantity.value++
      }
    }

    const decrementQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = (product) => {
      if (product.stock <= 0) {
        toast.warning('Bu ürün stokta yok')
        return
      }
      openQuantityModal(product)
    }

    const confirmAddToCart = () => {
      if (!isValidQuantity.value) return

      store.dispatch('cart/addToCart', {
        type: 'product',
        id: selectedProduct.value.id,
        name: selectedProduct.value.name,
        price: selectedProduct.value.price,
        category_id: selectedProduct.value.category_id,
        quantity: quantity.value,
        product: selectedProduct.value
      })

      toast.success('Ürün sepete eklendi')
      closeQuantityModal()
    }

    const getCategoryBgColor = (categoryId) => {
      const colors = {
        1: 'bg-red-100',
        2: 'bg-yellow-100',
        3: 'bg-green-100',
        4: 'bg-blue-100',
        5: 'bg-indigo-100',
        6: 'bg-purple-100',
        7: 'bg-pink-100'
      }
      return colors[categoryId] || 'bg-gray-100'
    }

    const getCategoryTextColor = (categoryId) => {
      const colors = {
        1: 'text-red-800',
        2: 'text-yellow-800',
        3: 'text-green-800',
        4: 'text-blue-800',
        5: 'text-indigo-800',
        6: 'text-purple-800',
        7: 'text-pink-800'
      }
      return colors[categoryId] || 'text-gray-800'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price)
    }

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadCategories(),
        loadProducts()
      ])
    })

    return {
      products,
      categories,
      selectedCategory,
      searchQuery,
      loading,
      filteredProducts,
      addToCart,
      getCategoryBgColor,
      getCategoryTextColor,
      formatPrice,
      displayedCategories,
      parentCategories,
      childCategories,
      showQuantityModal,
      selectedProduct,
      quantity,
      isValidQuantity,
      openQuantityModal,
      closeQuantityModal,
      incrementQuantity,
      decrementQuantity,
      confirmAddToCart
    }
  }
}
</script>
