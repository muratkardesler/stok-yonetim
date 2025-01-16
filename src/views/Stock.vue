<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
        Stok Yönetimi
      </h1>
      
      <div class="flex space-x-4">
        <!-- Refresh Button -->
        <button 
          @click="fetchData" 
          class="btn btn-secondary"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt mr-2"></i>
          {{ loading ? 'Yükleniyor...' : 'Yenile' }}
        </button>

        <!-- Dark Mode Toggle -->
        <button 
          @click="toggleDarkMode" 
          class="btn btn-secondary"
        >
          <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" class="mr-2"></i>
          {{ isDarkMode ? 'Açık Mod' : 'Koyu Mod' }}
        </button>
        
        <!-- Add Category Button -->
        <button 
          @click="showAddCategoryModal = true" 
          class="btn btn-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Kategori Ekle
        </button>
        
        <!-- Save Products Button -->
        <button 
          v-if="hasUnsavedChanges"
          @click="saveProducts"
          class="btn bg-green-500 hover:bg-green-600 text-white"
          :disabled="isLoading"
        >
          <i class="fas fa-save mr-2"></i>
          {{ unsavedProducts.length }} Ürünü Kaydet
        </button>
      </div>
    </div>

    <!-- CompanyId Display -->
    <div class="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <p class="text-blue-800 dark:text-blue-200">
        <span class="font-semibold">CompanyId:</span> {{ companyId || 'Bulunamadı' }}
      </p>
    </div>

    <!-- Search and Filter Section -->
    <div class="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Search -->
      <div class="relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ürün veya kategori ara..."
          class="input pl-10"
        >
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
      
      <!-- Category Filter -->
      <select 
        v-model="selectedCategoryFilter" 
        class="input"
      >
        <option value="">Tüm Kategoriler</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <!-- Auto-save Notice -->
    <div 
      v-if="hasUnsavedChanges" 
      class="mb-8 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 rounded-r-lg animate-fade-in"
    >
      <div class="flex items-center">
        <i class="fas fa-clock text-blue-500 mr-3 text-lg"></i>
        <div>
          <p class="text-blue-900 dark:text-blue-100">
            {{ unsavedProducts.length }} ürün kaydedilmemiş
          </p>
          <p class="text-blue-700 dark:text-blue-300 text-sm">
            {{ formatTime(nextAutoSaveTime) }} sonra otomatik kaydedilecek
          </p>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <div 
        v-for="category in filteredCategories" 
        :key="category.id"
        class="card card-hover cursor-pointer"
        :class="{ 'ring-2 ring-primary-500': selectedCategory?.id === category.id }"
        @click="selectCategory(category)"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ category.name }}
          </h3>
          <span class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 px-3 py-1 rounded-full text-sm">
            {{ getProductCountByCategory(category.id) }} ürün
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          {{ category.description || 'Açıklama yok' }}
        </p>
      </div>
    </div>

    <!-- Products Section -->
    <div v-if="selectedCategory" class="animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ selectedCategory.name }} - Ürünler
        </h2>
        <button 
          @click="showAddProductModal = true" 
          class="btn btn-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Ürün Ekle
        </button>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id || product.tempId" 
          class="card card-hover group"
        >
          <div class="relative">
            <!-- Product Status Badge -->
            <span 
              v-if="!product.id" 
              class="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
            >
              Kaydedilmemiş
            </span>

            <!-- Product Info -->
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {{ product.name }}
              </h4>
              <div class="space-y-2">
                <p class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Stok:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ product.quantity }}</span>
                </p>
                <p class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Fiyat:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(product.price) }}</span>
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="btn btn-secondary text-sm">
                <i class="fas fa-edit mr-1"></i>
                Düzenle
              </button>
              <button class="btn bg-red-500 hover:bg-red-600 text-white text-sm">
                <i class="fas fa-trash-alt mr-1"></i>
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <modal 
      v-model="showAddCategoryModal" 
      title="Yeni Kategori"
      class="dark:bg-gray-800"
    >
      <form @submit.prevent="addCategory" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategori Adı
          </label>
          <input 
            v-model="newCategory.name" 
            class="input" 
            required 
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Açıklama
          </label>
          <textarea 
            v-model="newCategory.description" 
            class="input" 
            rows="3"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="showAddCategoryModal = false"
          >
            İptal
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Kaydediliyor...' : 'Kaydet' }}
          </button>
        </div>
      </form>
    </modal>

    <!-- Product Modal -->
    <modal 
      v-model="showAddProductModal" 
      title="Yeni Ürün"
      class="dark:bg-gray-800"
    >
      <form @submit.prevent="addProduct" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ürün Adı
          </label>
          <input 
            v-model="newProduct.name" 
            class="input" 
            required 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stok Miktarı
          </label>
          <input 
            type="number" 
            v-model.number="newProduct.quantity" 
            class="input" 
            required 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birim Fiyatı
          </label>
          <input 
            type="number" 
            v-model.number="newProduct.price" 
            class="input" 
            required 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Açıklama
          </label>
          <textarea 
            v-model="newProduct.description" 
            class="input" 
            rows="3"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="showAddProductModal = false"
          >
            İptal
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Ekleniyor...' : 'Ekle' }}
          </button>
        </div>
      </form>
    </modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Modal from '@/components/Modal.vue';

export default {
  name: 'Stock',
  components: {
    Modal
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // State
    const companyId = ref(localStorage.getItem('companyIdva'));
    const showAddCategoryModal = ref(false);
    const showAddProductModal = ref(false);
    const searchQuery = ref('');
    const selectedCategoryFilter = ref('');
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true');
    
    // Dark mode watcher
    watch(isDarkMode, (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, { immediate: true });

    const newCategory = ref({
      name: '',
      description: ''
    });

    const newProduct = ref({
      name: '',
      quantity: 0,
      price: 0,
      description: ''
    });

    // Computed Properties
    const categories = computed(() => store.getters['stock/getCategories']);
    const products = computed(() => store.getters['stock/getProducts']);
    const selectedCategory = computed(() => store.getters['stock/getSelectedCategory']);
    const loading = computed(() => store.getters['stock/getLoading']);
    const error = computed(() => store.getters['stock/getError']);
    const unsavedChanges = computed(() => store.getters['stock/getUnsavedChanges']);

    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value;
      return categories.value.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const filteredProducts = computed(() => {
      let filtered = products.value;
      if (selectedCategory.value) {
        filtered = filtered.filter(p => p.categoryId === selectedCategory.value.id);
      }
      if (searchQuery.value) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      return filtered;
    });

    // Methods
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value);
    };

    const selectCategory = (category) => {
      store.dispatch('stock/selectCategory', category);
    };

    async function addCategory() {
      if (!newCategory.value.name || !newCategory.value.description) {
        return;
      }

      try {
        const response = await store.dispatch('stock/addCategory', {
          category: {
            name: newCategory.value.name,
            description: newCategory.value.description
          },
          companyId: companyId.value
        });

        if (response.Status === 'Success') {
          // Reset form and close modal
          newCategory.value = { name: '', description: '' };
          showAddCategoryModal.value = false;
          
          // Show success message
          alert(response.Message || 'Kategori başarıyla eklendi');
        }
      } catch (error) {
        console.error('Error adding category:', error);
        alert(error.message || 'Kategori eklenirken bir hata oluştu');
      }
    }

    const addProduct = async () => {
      try {
        if (!newProduct.value.name.trim()) {
          throw new Error('Ürün adı zorunludur');
        }
        if (!selectedCategory.value) {
          throw new Error('Lütfen bir kategori seçin');
        }
        
        const product = {
          ...newProduct.value,
          categoryId: selectedCategory.value.id
        };
        
        await store.dispatch('stock/addProduct', product);
        showAddProductModal.value = false;
        newProduct.value = { name: '', quantity: 0, price: 0, description: '' };
      } catch (error) {
        console.error('Ürün eklenirken hata:', error);
      }
    };

    const getProductCountByCategory = (categoryId) => {
      return products.value.filter(p => p.categoryId === categoryId).length;
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    };

    // Lifecycle Hooks
    onMounted(() => {
      // Sadece dark mode kontrolü yap
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      }
    });

    // Kategorileri getirmek için yeni method - şimdilik boş bırakıyoruz
    const fetchData = async () => {
      // API hazır olduğunda burada kategorileri getireceğiz
      console.log('Kategorileri getirme özelliği henüz hazır değil');
    };

    return {
      // State
      companyId,
      showAddCategoryModal,
      showAddProductModal,
      searchQuery,
      selectedCategoryFilter,
      isDarkMode,
      newCategory,
      newProduct,

      // Computed
      categories: filteredCategories,
      products: filteredProducts,
      selectedCategory,
      loading,
      error,
      unsavedChanges,

      // Methods
      toggleDarkMode,
      selectCategory,
      addCategory,
      addProduct,
      getProductCountByCategory,
      formatPrice,
      fetchData
    };
  }
};
</script>

<style>
/* Dark mode styles */
:root {
  --primary-color: #4F46E5;
  --secondary-color: #06B6D4;
}

.dark {
  --primary-color: #818CF8;
  --secondary-color: #22D3EE;
}

/* ... rest of the styles ... */
</style> 