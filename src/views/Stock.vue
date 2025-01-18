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
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
            <i class="fas fa-search text-gray-400"></i>
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Ürün veya kategori ara..." 
            class="input pl-10 w-full"
          />
        </div>
      </div>

      <!-- Category Filter Dropdown -->
      <div class="relative w-full sm:w-64">
        <select
          v-model="selectedCategoryFilter"
          class="input w-full appearance-none pr-10"
          @change="filterByCategory"
        >
          <option value="">Tüm Kategoriler</option>
          <option 
            v-for="category in categories" 
            :key="category.CategoryId" 
            :value="category.CategoryId"
          >
            {{ category.Name }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <i class="fas fa-chevron-down text-gray-400"></i>
        </div>
      </div>
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
        :key="category.CategoryId"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 relative group"
        :class="{ 'ring-2 ring-primary-500': selectedCategory?.CategoryId === category.CategoryId }"
        @click="selectCategory(category)"
      >
        <!-- Category Header -->
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ category.Name }}
          </h3>
          <div class="flex items-center bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded-lg">
            <i class="fas fa-box-open text-blue-500 dark:text-blue-400 mr-1.5"></i>
            <span class="text-blue-700 dark:text-blue-300 font-medium text-sm">
              {{ getProductCountByCategory(category.CategoryId) }}
            </span>
          </div>
        </div>

        <!-- Category Description -->
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {{ category.Description || 'Bu kategori için henüz bir açıklama eklenmemiş.' }}
        </p>

        <!-- Category Footer -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center text-gray-500 dark:text-gray-400">
            <i class="far fa-calendar-alt mr-1.5"></i>
            {{ new Date(category.CreatedAt).toLocaleDateString('tr-TR') }}
          </div>
          <div class="flex items-center text-primary-500 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Detayları Görüntüle
            <i class="fas fa-arrow-right ml-1.5 text-xs transition-transform group-hover:translate-x-1"></i>
          </div>
        </div>

        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-primary-500/5 dark:bg-primary-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"></div>
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
            :disabled="isSaving"
            required 
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Açıklama
          </label>
          <div class="relative">
            <textarea 
              v-model="newCategory.description" 
              class="input pr-16" 
              :class="{'border-red-500': isDescriptionTooLong}"
              :disabled="isSaving"
              rows="3"
              maxlength="50"
              @input="checkDescriptionLength"
            />
            <div class="absolute bottom-2 right-2 text-xs">
              <span :class="{
                'text-gray-500': !isDescriptionTooLong,
                'text-red-500 font-medium': isDescriptionTooLong
              }">
                {{ newCategory.description.length }}/50
              </span>
            </div>
          </div>
          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <p v-if="isDescriptionTooLong" class="mt-1 text-sm text-red-500">
              <i class="fas fa-exclamation-circle mr-1"></i>
              Açıklama en fazla 50 karakter olabilir
            </p>
          </transition>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="showAddCategoryModal = false"
            :disabled="isSaving"
          >
            İptal
          </button>
          <button 
            type="submit" 
            class="btn btn-primary relative"
            :disabled="isSaving || isDescriptionTooLong"
          >
            <span v-if="!isSaving">Kaydet</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kaydediliyor...
            </span>
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
import { useToast } from 'vue-toastification';

export default {
  name: 'Stock',
  components: {
    Modal
  },
  setup() {
    const toast = useToast();
    const store = useStore();
    const router = useRouter();
    
    // State
    const companyId = ref(localStorage.getItem('companyIdva'));
    console.log('Initial CompanyId:', companyId.value); // Debug log
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
    const categories = computed(() => {
      const allCategories = store.getters['stock/getCategories'];
      if (!searchQuery.value) return allCategories;
      
      const query = searchQuery.value.toLowerCase();
      return allCategories.filter(cat => 
        cat.Name.toLowerCase().includes(query) ||
        (cat.Description && cat.Description.toLowerCase().includes(query))
      );
    });

    // Products array'ini boş array olarak başlat
    const products = ref([]);

    const selectedCategory = computed(() => store.getters['stock/getSelectedCategory']);
    const loading = computed(() => store.getters['stock/getLoading']);
    const error = computed(() => store.getters['stock/getError']);
    const unsavedChanges = computed(() => store.getters['stock/getUnsavedChanges']);

    const filteredProducts = computed(() => {
      let filtered = products.value;
      if (selectedCategory.value) {
        filtered = filtered.filter(p => p.categoryId === selectedCategory.value.CategoryId);
      }
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      }
      return filtered;
    });

    // Computed property for filtered categories
    const filteredCategories = computed(() => {
      let result = categories.value;
      
      // Eğer kategori filtresi seçilmişse
      if (selectedCategoryFilter.value) {
        result = result.filter(cat => cat.CategoryId === selectedCategoryFilter.value);
      }
      
      return result;
    });

    // Methods
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value);
    };

    const selectCategory = (category) => {
      store.dispatch('stock/selectCategory', category);
    };

    const isSaving = ref(false);

    async function addCategory() {
      if (!newCategory.value.name || !newCategory.value.description) {
        toast.error("Kategori adı ve açıklama alanları zorunludur!", {
          timeout: 3000,
          position: "top-right",
          icon: "❌"
        });
        return;
      }

      // Aynı isimde kategori var mı kontrolü
      const existingCategory = categories.value.find(
        cat => cat.Name.toLowerCase() === newCategory.value.name.toLowerCase()
      );

      if (existingCategory) {
        toast.error(`"${newCategory.value.name}" isimli kategori zaten mevcut!`, {
          timeout: 4000,
          position: "top-right",
          icon: "⚠️",
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      isSaving.value = true;
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
          
          // Show success toast with animation
          toast.success(`✨ ${response.Message || 'Yeni kategori başarıyla eklendi!'}`, {
            timeout: 4000,
            position: "top-right",
            icon: "🎉",
            closeOnClick: true,
            pauseOnFocusLoss: true,
            pauseOnHover: true,
            draggable: true,
            draggablePercent: 0.6,
            showCloseButtonOnHover: true,
            hideProgressBar: false,
            closeButton: "button",
            transition: {
              enter: "animate__animated animate__fadeInRight",
              leave: "animate__animated animate__fadeOutRight"
            }
          });
        }
      } catch (error) {
        console.error('Error adding category:', error);
        toast.error(`Kategori eklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, {
          timeout: 5000,
          position: "top-right",
          icon: "⚠️",
          closeOnClick: true
        });
      } finally {
        isSaving.value = false;
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
      // Şimdilik her kategori için 0 döndür
      return 0;
      // İleride products API hazır olduğunda bu kısmı aktif edeceğiz
      // return products.value.filter(p => p.CategoryId === categoryId).length;
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    };

    // Method to handle category filtering
    const filterByCategory = () => {
      if (selectedCategoryFilter.value) {
        const category = categories.value.find(cat => cat.CategoryId === selectedCategoryFilter.value);
        if (category) {
          selectCategory(category);
        }
      } else {
        // Tüm kategoriler seçildiğinde seçili kategoriyi temizle
        store.dispatch('stock/selectCategory', null);
      }
    };

    // Lifecycle Hooks
    onMounted(async () => {
      // Dark mode kontrolü
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      }

      // CompanyId kontrolü ve kategorileri getirme
      if (companyId.value) {
        console.log('Mounting with CompanyId:', companyId.value); // Debug log
        try {
          await store.dispatch('stock/fetchCategories', companyId.value);
        } catch (error) {
          console.error('Kategoriler yüklenirken hata:', error);
        }
      } else {
        console.error('CompanyId bulunamadı');
      }
    });

    // Kategorileri yenileme methodu
    const fetchData = async () => {
      if (!companyId.value) {
        console.error('CompanyId bulunamadı');
        return;
      }

      try {
        await store.dispatch('stock/fetchCategories', companyId.value);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      }
    };

    // State
    const isDescriptionTooLong = ref(false);

    // Methods
    const checkDescriptionLength = () => {
      if (newCategory.value.description.length > 50) {
        isDescriptionTooLong.value = true;
        toast.warning("Açıklama 50 karakterden uzun olamaz!", {
          timeout: 3000,
          position: "top-right",
          icon: "⚠️",
          closeOnClick: true
        });
        // Fazla karakterleri kes
        newCategory.value.description = newCategory.value.description.slice(0, 50);
      } else {
        isDescriptionTooLong.value = false;
      }
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
      categories,
      products: filteredProducts,
      selectedCategory,
      loading,
      error,
      unsavedChanges,
      filteredCategories,

      // Methods
      toggleDarkMode,
      selectCategory,
      addCategory,
      addProduct,
      getProductCountByCategory,
      formatPrice,
      fetchData,
      isSaving,
      filterByCategory,
      isDescriptionTooLong,
      checkDescriptionLength,
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

/* Animations */
@keyframes pulse-soft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-pulse-soft {
  animation: pulse-soft 2s infinite;
}

/* Card Hover Effects */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
}

/* Line Clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 