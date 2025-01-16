<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
        Stok Yönetimi
      </h1>
      
      <div class="flex space-x-4">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Stock',
  setup() {
    const router = useRouter();
    const userData = ref(JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}'));
    const companyId = ref(userData.value.CompanyId);
    const categories = ref([]);
    const products = ref([]);
    const selectedCategory = ref(null);
    const showAddCategoryModal = ref(false);
    const showAddProductModal = ref(false);
    const searchQuery = ref('');
    const selectedCategoryFilter = ref('');
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true');
    
    const newCategory = ref({
      name: '',
      description: '',
      companyId: companyId.value
    });

    const newProduct = ref({
      name: '',
      quantity: 0,
      price: 0,
      description: '',
      categoryId: '',
      companyId: companyId.value
    });

    const fetchCategories = async () => {
      try {
        console.log('Fetching categories for companyId:', companyId.value);
        const response = await fetch(`https://api.example.com/categories?companyId=${companyId.value}`);
        const data = await response.json();
        categories.value = data;
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      }
    };

    const addCategory = async () => {
      try {
        console.log('Adding category with companyId:', companyId.value);
        const response = await fetch('https://api.example.com/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newCategory.value,
            companyId: companyId.value
          })
        });
        
        if (response.ok) {
          await fetchCategories();
          showAddCategoryModal.value = false;
          newCategory.value = { name: '', description: '', companyId: companyId.value };
        }
      } catch (error) {
        console.error('Kategori eklenirken hata:', error);
      }
    };

    const addProduct = async () => {
      try {
        console.log('Adding product with companyId:', companyId.value);
        const response = await fetch('https://api.example.com/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newProduct.value,
            companyId: companyId.value
          })
        });
        
        if (response.ok) {
          await fetchProducts();
          showAddProductModal.value = false;
          newProduct.value = {
            name: '',
            quantity: 0,
            price: 0,
            description: '',
            categoryId: '',
            companyId: companyId.value
          };
        }
      } catch (error) {
        console.error('Ürün eklenirken hata:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        console.log('Fetching products for companyId:', companyId.value);
        const response = await fetch(`https://api.example.com/products?companyId=${companyId.value}`);
        const data = await response.json();
        products.value = data;
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      }
    };

    onMounted(() => {
      if (companyId.value) {
        console.log('Component mounted with companyId:', companyId.value);
        fetchCategories();
        fetchProducts();
      } else {
        console.error('CompanyId not found in user data');
      }
    });

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value);
    };

    return {
      companyId,
      categories,
      products,
      selectedCategory,
      showAddCategoryModal,
      showAddProductModal,
      searchQuery,
      selectedCategoryFilter,
      isDarkMode,
      newCategory,
      newProduct,
      addCategory,
      addProduct,
      fetchCategories,
      fetchProducts,
      toggleDarkMode
    };
  }
};
</script> 