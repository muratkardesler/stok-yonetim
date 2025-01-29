<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Breadcrumb -->
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm">
        <router-link to="/" class="text-gray-600 hover:text-primary-500">Ana Sayfa</router-link>
        <span class="text-gray-400">/</span>
        <span class="text-primary-500">Stok Yönetimi</span>
      </div>
    </nav>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
        <p class="mt-1 text-gray-600">Kategorileri ve ürünleri kolayca yönetin</p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button @click="showAddCategoryModal = true" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>
          Yeni Kategori
        </button>
        <button @click="showAddProductModal = true" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>
          Yeni Ürün
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Kategori veya ürün ara..."
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

    <!-- Categories -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <div v-for="category in filteredCategories" :key="category.id" class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <i class="fas fa-box text-primary-500"></i>
            </div>
            <h3 class="ml-3 font-semibold text-gray-900">{{ category.name }}</h3>
          </div>
          <div class="flex space-x-2">
            <button @click="editCategory(category)" class="text-gray-400 hover:text-primary-500">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteCategory(category)" class="text-gray-400 hover:text-red-500">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="text-sm text-gray-500 mb-2">
          {{ category.products?.length || 0 }} Ürün
        </div>
        <button 
          @click="openAddProductModal(category)"
          class="w-full mt-2 py-2 px-4 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
        >
          <i class="fas fa-plus mr-2"></i>
          Ürün Ekle
        </button>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Ürünler</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                  {{ getCategoryName(product.category_id) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.stock }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatPrice(product.price) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editProduct(product)" class="text-primary-600 hover:text-primary-900 mr-3">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteProduct(product)" class="text-red-600 hover:text-red-900">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category Modal -->
    <Modal v-if="showAddCategoryModal" @close="closeAddCategoryModal">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">
          {{ editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="saveCategory">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Kategori Adı</label>
              <input
                type="text"
                v-model="categoryForm.name"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
            </div>
            <div v-if="!editingCategory">
              <label class="block text-sm font-medium text-gray-700">Üst Kategori</label>
              <select
                v-model="categoryForm.parent_id"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option :value="null">Ana Kategori</option>
                <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeAddCategoryModal" class="btn-secondary">İptal</button>
          <button @click="saveCategory" class="btn-primary">
            {{ editingCategory ? 'Güncelle' : 'Kaydet' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Product Modal -->
    <Modal v-if="showAddProductModal" @close="closeAddProductModal">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">
          {{ editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="saveProduct">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Ürün Adı</label>
              <input
                type="text"
                v-model="productForm.name"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Kategori</label>
              <select
                v-model="productForm.category_id"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Kategori Seçin</option>
                <option v-for="category in allCategories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Stok</label>
              <input
                type="number"
                v-model.number="productForm.stock"
                required
                min="0"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Fiyat (₺)</label>
              <input
                type="number"
                v-model.number="productForm.price"
                required
                min="0"
                step="0.01"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeAddProductModal" class="btn-secondary">İptal</button>
          <button @click="saveProduct" class="btn-primary">
            {{ editingProduct ? 'Güncelle' : 'Kaydet' }}
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
  name: 'Stock',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const categories = ref([])
    const products = ref([])
    const searchQuery = ref('')
    const selectedCategoryFilter = ref('')
    const loading = ref(false)
    const showAddCategoryModal = ref(false)
    const showAddProductModal = ref(false)
    const editingCategory = ref(null)
    const editingProduct = ref(null)
    const showNewPackageModal = ref(false)

    const categoryForm = ref({
      name: '',
      parent_id: null
    })

    const productForm = ref({
      name: '',
      category_id: '',
      stock: 0,
      price: 0
    })

    // Kategorileri yükle
    const loadCategories = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            products:products(*)
          `)
          .order('name')
        
        if (error) throw error

        categories.value = data
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Kategoriler yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    // Ürünleri yükle
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        products.value = data
      } catch (error) {
        console.error('Error loading products:', error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
      }
    }

    // Filtrelenmiş kategoriler
    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value

      const query = searchQuery.value.toLowerCase()
      return categories.value.filter(category => 
        category.name.toLowerCase().includes(query) ||
        category.products?.some(product => 
          product.name.toLowerCase().includes(query)
        )
      )
    })

    // Ana kategoriler
    const mainCategories = computed(() => {
      return categories.value.filter(cat => !cat.parent_id)
    })

    // Tüm kategoriler (düz liste)
    const allCategories = computed(() => {
      return categories.value
    })

    // Kategori kaydetme/güncelleme
    const saveCategory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error('Oturum bulunamadı')
          return
        }
        
        if (editingCategory.value) {
          const { error } = await supabase
            .from('categories')
            .update({
              name: categoryForm.value.name
            })
            .eq('id', editingCategory.value.id)

          if (error) throw error
          toast.success('Kategori güncellendi')
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([{
              ...categoryForm.value,
              user_id: session.user.id
            }])

          if (error) throw error
          toast.success('Kategori eklendi')
        }

        closeAddCategoryModal()
        loadCategories()
      } catch (error) {
        console.error('Error saving category:', error)
        toast.error('Kategori kaydedilirken bir hata oluştu')
      }
    }

    // Ürün kaydetme/güncelleme
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
        loadCategories() // Kategori içindeki ürünleri güncellemek için
      } catch (error) {
        console.error('Error saving product:', error)
        toast.error('Ürün kaydedilirken bir hata oluştu')
      }
    }

    // Kategori silme
    const deleteCategory = async (category) => {
      if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', category.id)

        if (error) throw error
        
        toast.success('Kategori silindi')
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('Kategori silinirken bir hata oluştu')
      }
    }

    // Ürün silme
    const deleteProduct = async (product) => {
      if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id)

        if (error) throw error
        
        toast.success('Ürün silindi')
        loadProducts()
        loadCategories() // Kategori içindeki ürünleri güncellemek için
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Ürün silinirken bir hata oluştu')
      }
    }

    // Modal işlemleri
    const closeAddCategoryModal = () => {
      showAddCategoryModal.value = false
      editingCategory.value = null
      categoryForm.value = { name: '', parent_id: null }
    }

    const closeAddProductModal = () => {
      showAddProductModal.value = false
      editingProduct.value = null
      productForm.value = { name: '', category_id: '', stock: 0, price: 0 }
    }

    const editCategory = (category) => {
      editingCategory.value = category
      categoryForm.value = {
        name: category.name,
        parent_id: category.parent_id
      }
      showAddCategoryModal.value = true
    }

    const editProduct = (product) => {
      editingProduct.value = product
      productForm.value = {
        name: product.name,
        category_id: product.category_id,
        stock: product.stock,
        price: product.price
      }
      showAddProductModal.value = true
    }

    const openAddProductModal = (category) => {
      productForm.value.category_id = category.id
      showAddProductModal.value = true
    }

    // Yardımcı fonksiyonlar
    const getCategoryName = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      return category ? category.name : ''
    }

    const getCategoryColor = (categoryId) => {
      const colors = [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-yellow-100 text-yellow-800'
      ]
      const index = Math.abs(parseInt(categoryId)) % colors.length
      return colors[index]
    }

    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const fetchData = () => {
      loadCategories()
      loadProducts()
    }

    const filterByCategory = () => {
      // Kategori filtreleme işlemi burada yapılacak
    }

    onMounted(() => {
      loadCategories()
      loadProducts()
    })

    return {
      categories,
      products,
      searchQuery,
      selectedCategoryFilter,
      loading,
      showAddCategoryModal,
      showAddProductModal,
      showNewPackageModal,
      categoryForm,
      productForm,
      editingCategory,
      editingProduct,
      filteredCategories,
      mainCategories,
      allCategories,
      saveCategory,
      saveProduct,
      deleteCategory,
      deleteProduct,
      closeAddCategoryModal,
      closeAddProductModal,
      editCategory,
      editProduct,
      openAddProductModal,
      getCategoryName,
      getCategoryColor,
      formatPrice,
      fetchData,
      filterByCategory
    }
  }
}
</script>

<style>
.btn-primary {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 inline-flex items-center;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}
</style> 