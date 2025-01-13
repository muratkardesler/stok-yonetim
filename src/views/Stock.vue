<template>
  <div class="stock-management">
    <!-- Üst Bar -->
    <div class="top-section">
      <div class="header">
        <h1>Stok Yönetimi</h1>
        <div class="actions">
          <button @click="openCategoryModal" class="btn-primary">
            <i class="fas fa-plus"></i> Kategori Ekle
          </button>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Ürün veya kategori ara..."
              @input="filterItems"
            >
          </div>
        </div>
      </div>

      <!-- İstatistik Kartları -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-info">
            <h3>Toplam Stok</h3>
            <p>{{ totalStock }} Adet</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="stat-info">
            <h3>Toplam Kategori</h3>
            <p>{{ categories.length }} Adet</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-info">
            <h3>Toplam Ürün</h3>
            <p>{{ totalProducts }} Adet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ana İçerik -->
    <div class="main-content">
      <!-- Kategori ve Ürün Tablosu -->
      <div class="stock-table">
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Ürün Adı</th>
              <th>Stok Miktarı</th>
              <th>Alış Fiyatı</th>
              <th>Satış Fiyatı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="category in filteredCategories" :key="category.id">
              <!-- Kategori Başlığı -->
              <tr class="category-row">
                <td colspan="6">
                  <div class="category-header">
                    <span>{{ category.name }}</span>
                    <div class="category-actions">
                      <button @click="openProductModal(category)" class="btn-secondary">
                        <i class="fas fa-plus"></i> Ürün Ekle
                      </button>
                      <button @click="deleteCategory(category.id)" class="btn-icon">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              <!-- Ürünler -->
              <tr v-for="product in filteredProducts(category.id)" :key="product.id" class="product-row">
                <td></td>
                <td>{{ product.name }}</td>
                <td>{{ product.stock }}</td>
                <td>{{ formatPrice(product.buyPrice) }}</td>
                <td>{{ formatPrice(product.sellPrice) }}</td>
                <td>
                  <div class="actions">
                    <button @click="editProduct(product)" class="btn-icon">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteProduct(product.id)" class="btn-icon">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Kategori Modal -->
    <Modal v-if="showCategoryModal" @close="closeCategoryModal">
      <template #header>
        <h2>Yeni Kategori Ekle</h2>
      </template>
      
      <template #body>
        <div class="form-group">
          <label>Kategori Adı</label>
          <input 
            v-model="newCategory.name" 
            type="text" 
            placeholder="Kategori adını girin"
            required
          >
        </div>
      </template>
      
      <template #footer>
        <button @click="closeCategoryModal" class="btn-secondary">İptal</button>
        <button @click="saveCategory" class="btn-primary">Kaydet</button>
      </template>
    </Modal>

    <!-- Ürün Modal -->
    <Modal v-if="showProductModal" @close="closeProductModal">
      <template #header>
        <h2>{{ editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}</h2>
      </template>
      
      <template #body>
        <div class="form-group">
          <label>Ürün Adı</label>
          <input 
            v-model="newProduct.name" 
            type="text" 
            placeholder="Ürün adını girin"
            required
          >
        </div>
        <div class="form-group">
          <label>Stok Miktarı</label>
          <input 
            v-model.number="newProduct.stock" 
            type="number" 
            min="0"
            required
          >
        </div>
        <div class="form-group">
          <label>Alış Fiyatı</label>
          <input 
            v-model.number="newProduct.buyPrice" 
            type="number" 
            min="0"
            step="0.01"
            required
          >
        </div>
        <div class="form-group">
          <label>Satış Fiyatı</label>
          <input 
            v-model.number="newProduct.sellPrice" 
            type="number" 
            min="0"
            step="0.01"
            required
          >
        </div>
      </template>
      
      <template #footer>
        <button @click="closeProductModal" class="btn-secondary">İptal</button>
        <button @click="saveProduct" class="btn-primary">Kaydet</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Modal from '@/components/Modal.vue';

export default {
  name: 'Stock',
  components: {
    Modal
  },
  setup() {
    // State
    const categories = ref([]);
    const products = ref([]);
    const searchQuery = ref('');
    const showCategoryModal = ref(false);
    const showProductModal = ref(false);
    const selectedCategoryId = ref(null);
    const editingProduct = ref(null);
    
    const newCategory = ref({
      name: ''
    });
    
    const newProduct = ref({
      name: '',
      stock: 0,
      buyPrice: 0,
      sellPrice: 0
    });

    // Computed Properties
    const totalStock = computed(() => {
      return products.value.reduce((sum, product) => sum + product.stock, 0);
    });

    const totalProducts = computed(() => products.value.length);

    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value;
      return categories.value.filter(category => 
        category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        products.value.some(product => 
          product.categoryId === category.id &&
          product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      );
    });

    const filteredProducts = (categoryId) => {
      let categoryProducts = products.value.filter(p => p.categoryId === categoryId);
      if (!searchQuery.value) return categoryProducts;
      return categoryProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    };

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    };

    const openCategoryModal = () => {
      newCategory.value = { name: '' };
      showCategoryModal.value = true;
    };

    const closeCategoryModal = () => {
      showCategoryModal.value = false;
      newCategory.value = { name: '' };
    };

    const openProductModal = (category) => {
      selectedCategoryId.value = category.id;
      newProduct.value = {
        name: '',
        stock: 0,
        buyPrice: 0,
        sellPrice: 0
      };
      showProductModal.value = true;
    };

    const closeProductModal = () => {
      showProductModal.value = false;
      selectedCategoryId.value = null;
      editingProduct.value = null;
      newProduct.value = {
        name: '',
        stock: 0,
        buyPrice: 0,
        sellPrice: 0
      };
    };

    const saveToLocalStorage = () => {
      localStorage.setItem('stockCategories', JSON.stringify(categories.value));
      localStorage.setItem('stockProducts', JSON.stringify(products.value));
    };

    const loadFromLocalStorage = () => {
      const savedCategories = localStorage.getItem('stockCategories');
      const savedProducts = localStorage.getItem('stockProducts');
      
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories);
      }
      
      if (savedProducts) {
        products.value = JSON.parse(savedProducts);
      }
    };

    const saveCategory = () => {
      if (!newCategory.value.name.trim()) return;
      
      const category = {
        id: Date.now(),
        name: newCategory.value.name.trim()
      };
      
      categories.value.push(category);
      saveToLocalStorage();
      closeCategoryModal();
    };

    const saveProduct = () => {
      if (!newProduct.value.name.trim()) return;
      
      const product = {
        id: editingProduct.value?.id || Date.now(),
        categoryId: selectedCategoryId.value,
        name: newProduct.value.name.trim(),
        stock: newProduct.value.stock,
        buyPrice: newProduct.value.buyPrice,
        sellPrice: newProduct.value.sellPrice
      };

      if (editingProduct.value) {
        const index = products.value.findIndex(p => p.id === product.id);
        if (index !== -1) {
          products.value[index] = product;
        }
      } else {
        products.value.push(product);
      }
      
      saveToLocalStorage();
      closeProductModal();
    };

    const editProduct = (product) => {
      editingProduct.value = product;
      selectedCategoryId.value = product.categoryId;
      newProduct.value = { ...product };
      showProductModal.value = true;
    };

    const deleteProduct = (productId) => {
      if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        products.value = products.value.filter(p => p.id !== productId);
        saveToLocalStorage();
      }
    };

    const deleteCategory = (categoryId) => {
      if (confirm('Bu kategoriyi ve içindeki tüm ürünleri silmek istediğinizden emin misiniz?')) {
        categories.value = categories.value.filter(c => c.id !== categoryId);
        products.value = products.value.filter(p => p.categoryId !== categoryId);
        saveToLocalStorage();
      }
    };

    // Lifecycle Hooks
    onMounted(() => {
      loadFromLocalStorage();
      
      // Eğer localStorage'da veri yoksa örnek verileri yükle
      if (categories.value.length === 0) {
        categories.value = [
          { id: 1, name: 'Yüzük' },
          { id: 2, name: 'Kolye' }
        ];
        
        products.value = [
          { id: 1, categoryId: 1, name: 'Tektaş', stock: 50, buyPrice: 1000, sellPrice: 1500 },
          { id: 2, categoryId: 1, name: 'Alyans', stock: 30, buyPrice: 800, sellPrice: 1200 },
          { id: 3, categoryId: 2, name: 'Baget', stock: 20, buyPrice: 1200, sellPrice: 1800 },
          { id: 4, categoryId: 2, name: 'Harf Kolye', stock: 10, buyPrice: 500, sellPrice: 750 }
        ];
        
        saveToLocalStorage();
      }
    });

    return {
      categories,
      products,
      searchQuery,
      showCategoryModal,
      showProductModal,
      newCategory,
      newProduct,
      selectedCategoryId,
      editingProduct,
      totalStock,
      totalProducts,
      filteredCategories,
      filteredProducts,
      formatPrice,
      openCategoryModal,
      closeCategoryModal,
      openProductModal,
      closeProductModal,
      saveCategory,
      saveProduct,
      editProduct,
      deleteProduct,
      deleteCategory
    };
  }
};
</script>

<style scoped>
.stock-management {
  padding: 2rem;
  background: var(--background-light);
  min-height: 100vh;
}

.top-section {
  margin-bottom: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.8rem;
  color: var(--text-color);
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 1.5rem;
  color: white;
}

.stat-info h3 {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.stat-info p {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.stock-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: var(--background-light);
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: var(--text-light);
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.category-row {
  background: var(--background-light);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.product-row:hover {
  background: var(--background-light);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  color: var(--primary-color);
  background: rgba(79, 70, 229, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stock-management {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .actions {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .category-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 