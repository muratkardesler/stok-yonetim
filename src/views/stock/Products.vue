<template>
  <div>
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <i class="fas fa-box-archive text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Ürünler</h2>
              <p class="text-sm text-gray-500 mt-0.5">Tüm ürünlerinizi buradan yönetin</p>
            </div>
          </div>
          <button @click="showAddProductModal = true" 
                  class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group">
            <i class="fas fa-plus mr-2 group-hover:scale-110 transition-transform"></i>
            <span>Yeni Ürün</span>
          </button>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="p-4 border-b border-gray-100 bg-gray-50/50">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Ürün ara..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div class="sm:w-64">
            <select 
              v-model="selectedCategoryFilter"
              class="w-full py-2 pl-3 pr-10 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Tüm Kategoriler</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'

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

    const productForm = ref({
      name: '',
      category_id: '',
      stock: 0,
      price: 0
    })

    // Load data
    const loadProducts = async () => {
      try {
        // Önce ürünleri çek
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('name')
        
        if (productsError) throw productsError

        // Tüm product_images'ları çek
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('is_primary', true)

        if (imagesError) throw imagesError

        // Her ürün için primary image'i güncelle
        products.value = productsData.map(product => {
          const primaryImage = imagesData.find(img => img.product_name === product.name)
          return {
            ...product,
            primary_image: primaryImage?.image_url || null
          }
        })

        // Eğer primary_image null olan ama eşleşen görseli olan ürünler varsa güncelle
        for (const product of products.value) {
          if (!product.primary_image) {
            const matchingImage = imagesData.find(img => img.product_name === product.name)
            if (matchingImage) {
              // Ürünün primary_image alanını güncelle
              const { error: updateError } = await supabase
                .from('products')
                .update({ primary_image: matchingImage.image_url })
                .eq('id', product.id)

              if (updateError) throw updateError
              product.primary_image = matchingImage.image_url
            }
          }
        }
      } catch (error) {
        console.error('Error loading products:', error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
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

    const getCategoryBgColor = (categoryId) => {
      const colors = {
        blue: 'bg-blue-100',
        purple: 'bg-purple-100',
        green: 'bg-green-100',
        orange: 'bg-orange-100',
        pink: 'bg-pink-100'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
    }

    const getCategoryTextColor = (categoryId) => {
      const colors = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
        pink: 'text-pink-600'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
    }

    const getCategoryBadgeColor = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      if (!category) return ''

      const mainCategoryIndex = mainCategories.value.findIndex(cat => 
        cat.id === (category.parent_id || category.id)
      )

      const colors = [
        'bg-blue-50/80 text-blue-700 border border-blue-200',
        'bg-purple-50/80 text-purple-700 border border-purple-200',
        'bg-emerald-50/80 text-emerald-700 border border-emerald-200',
        'bg-orange-50/80 text-orange-700 border border-orange-200',
        'bg-pink-50/80 text-pink-700 border border-pink-200',
        'bg-cyan-50/80 text-cyan-700 border border-cyan-200'
      ]
      return colors[mainCategoryIndex % colors.length]
    }

    const getStockColor = (stock) => {
      if (stock <= 0) return 'text-red-600'
      if (stock <= 10) return 'text-orange-600'
      return 'text-green-600'
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
        
        if (editingProduct.value) {
          const { error } = await supabase
            .from('products')
            .update({
              name: productForm.value.name,
              category_id: productForm.value.category_id,
              stock: productForm.value.stock,
              price: productForm.value.price
            })
            .eq('id', editingProduct.value.id)

          if (error) throw error
          toast.success('Ürün güncellendi')
        } else {
          const { error } = await supabase
            .from('products')
            .insert([{
              ...productForm.value,
              user_id: user.id
            }])

          if (error) throw error
          toast.success('Ürün eklendi')
        }

        closeAddProductModal()
        loadProducts()
      } catch (error) {
        console.error('Error saving product:', error)
        toast.error('Ürün kaydedilirken bir hata oluştu')
      }
    }

    const confirmDelete = async () => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', itemToDelete.value.id)

        if (error) throw error
        
        toast.success('Ürün başarıyla silindi')
        loadProducts()
        closeDeleteModal()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Ürün silinirken bir hata oluştu')
      }
    }

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
      confirmDelete
    }
  }
}
</script> 