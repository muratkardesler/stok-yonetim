<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Breadcrumb Navigation -->
    <nav class="mb-6">
      <div class="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
        <router-link 
          to="/dashboard" 
          class="flex items-center text-gray-600 hover:text-primary-500 transition-colors group"
        >
          <div class="bg-gray-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
            <i class="fas fa-home text-gray-500 group-hover:text-primary-500"></i>
          </div>
          <span class="ml-2 font-medium">Ana Sayfa</span>
        </router-link>
        <div class="flex items-center text-gray-400">
          <i class="fas fa-chevron-right text-xs"></i>
        </div>
        <div class="flex items-center text-primary-500">
          <div class="bg-primary-50 p-2 rounded-lg">
            <i class="fas fa-box-open"></i>
          </div>
          <span class="ml-2 font-medium">Stok Yönetimi</span>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Left Side -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-box-open text-primary-500 mr-3"></i>
              Stok Yönetimi
            </h1>
            <p class="mt-1 text-gray-600">
              Kategorileri ve ürünleri kolayca yönetin
            </p>
          </div>

          <!-- Right Side - Action Buttons -->
          <div class="flex flex-wrap items-center gap-3">
            <button 
              @click="fetchData" 
              class="btn-icon"
              :class="{ 'animate-spin': loading }"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt"></i>
            </button>

            <button 
              @click="showAddCategoryModal = true" 
              class="btn-primary flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              Yeni Kategori
            </button>

            <button 
              @click="showNewPackageModal = true" 
              class="btn-primary flex items-center"
            >
              <i class="fas fa-box mr-2"></i>
              Yeni Paket
            </button>
          </div>
        </div>

        <!-- Company Info & Search Bar -->
        <div class="mt-6 flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Kategori veya ürün ara..." 
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>
          <div class="sm:w-64">
            <div class="relative">
              <select
                v-model="selectedCategoryFilter"
                class="w-full appearance-none rounded-lg border border-gray-200 py-2 pl-4 pr-10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
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
              <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="category in filteredCategories" 
          :key="category.CategoryId"
          class="flip-card-container h-[200px]"
        >
          <!-- Flip Card -->
          <div class="flip-card" :class="{ 'is-flipped': flippedCardId === category.CategoryId }">
            <!-- Front Side -->
            <div class="flip-card-front bg-white rounded-xl shadow-sm p-6 relative overflow-hidden flex flex-col">
              <!-- Background Pattern -->
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 opacity-5">
                <i class="fas fa-box-open text-6xl"></i>
              </div>

              <!-- Action Buttons -->
              <div class="absolute top-4 right-4 flex space-x-2">
                <button 
                  class="action-btn-small edit-btn-light"
                  @click.stop="editCategory(category)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn-small delete-btn-light"
                  @click.stop="confirmDeleteCategory(category)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>

              <!-- Category Icon and Name -->
              <div class="flex-grow flex flex-col items-center justify-center mb-4">
                <div class="bg-primary-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <i class="fas fa-box-open text-2xl text-primary-500"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800" style="font-family: 'Poppins', sans-serif;">
                  {{ category.Name }}
                </h3>
              </div>

              <!-- Footer with Stats and Details -->
              <div class="border-t border-gray-100 pt-4 mt-auto">
                <div class="flex items-center justify-between">
                  <!-- Product Count -->
                  <span 
                    class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 cursor-pointer hover:bg-primary-100 transition-colors"
                    @click="selectedCategoryFilter = category.CategoryId"
                  >
                    <i class="fas fa-box-open mr-2"></i>
                    {{ getProductCountByCategory(category.CategoryId) }} Ürün
                  </span>
                  
                  <!-- Details Button -->
                  <button 
                    @click="toggleCard(category.CategoryId, $event)"
                    class="btn-details flex items-center text-primary-500 font-medium hover:text-primary-600 transition-colors group"
                  >
                    <span>Detaylar</span>
                    <i class="fas fa-chevron-right ml-2 text-xs transition-transform group-hover:translate-x-1"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Back Side -->
            <div class="flip-card-back bg-primary-500 text-white rounded-xl shadow-sm p-6 flex flex-col">
              <!-- Header with Category Name and Creation Date -->
              <div class="mb-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold card-title">{{ category.Name }}</h3>
                  <button 
                    class="close-btn"
                    @click="toggleCard(category.CategoryId, $event)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <p class="card-date">
                  <i class="far fa-calendar-alt mr-2"></i>
                  {{ new Date(category.CreatedAt).toLocaleDateString('tr-TR') }}
                </p>
              </div>

              <!-- Category Description -->
              <div class="flex-1">
                <div class="card-description">
                  <p class="description-text">
                    {{ category.Description || 'Bu kategori için henüz bir açıklama eklenmemiş.' }}
                  </p>
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-4">
                <button 
                  class="add-product-btn w-full"
                  @click.stop="openAddProductModal(category)"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Bu Kategoriye Ürün Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 flex items-center">
            <i class="fas fa-boxes text-primary-500 mr-3"></i>
            Ürünlerim
          </h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              Toplam {{ products.length }} ürün
            </span>
          </div>
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.ProductId" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ product.Name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full cursor-pointer transition-colors',
                      getCategoryColor(product.CategoryId).bg,
                      getCategoryColor(product.CategoryId).text
                    ]"
                    @click="selectedCategoryFilter = product.CategoryId"
                  >
                    {{ getCategoryName(product.CategoryId) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate">{{ product.Description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatPrice(product.Price) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ product.StockQuantity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="product.CodeType && product.CodeValue" class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          :class="product.CodeType === 'qr' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                      {{ product.CodeType === 'qr' ? 'QR' : 'Barkod' }}
                    </span>
                    <button 
                      @click="showCodePreview(product)"
                      class="text-primary-600 hover:text-primary-900"
                      title="Kodu Görüntüle"
                    >
                      <i :class="product.CodeType === 'qr' ? 'fas fa-qrcode' : 'fas fa-barcode'"></i>
                    </button>
                  </div>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button class="text-primary-600 hover:text-primary-900" @click="editProduct(product)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="text-red-600 hover:text-red-900" @click="confirmDeleteProduct(product)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  Henüz ürün bulunmamaktadır.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Packages Section -->
      <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 flex items-center">
            <i class="fas fa-box text-primary-500 mr-3"></i>
            Paketlerim
          </h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              Toplam {{ packages.length }} paket
            </span>
          </div>
        </div>

        <!-- Packages Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket Adı</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Sayısı</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="isLoadingPackages">
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                  <div class="flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Yükleniyor...
                  </div>
                </td>
              </tr>
              <tr v-else-if="!packages.length">
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                  Henüz paket bulunmuyor
                </td>
              </tr>
              <tr v-for="pkg in packages" :key="pkg.PackageId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ pkg.Name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 max-w-xs truncate">{{ pkg.Description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatPrice(pkg.Price) }}</div>
                  <div v-if="pkg.DiscountPrice" class="text-xs text-primary-600">
                    İndirimli: {{ formatPrice(pkg.DiscountPrice) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ pkg.ProductCount }} ürün</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': pkg.TotalStock > (pkg.MinStockAlert || 0),
                      'bg-yellow-100 text-yellow-800': pkg.TotalStock <= (pkg.MinStockAlert || 0) && pkg.TotalStock > 0,
                      'bg-red-100 text-red-800': pkg.TotalStock === 0
                    }"
                  >
                    {{ pkg.TotalStock }} adet
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editPackage(pkg)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                    title="Düzenle"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deletePackage(pkg.PackageId)"
                    class="text-red-600 hover:text-red-900"
                    title="Sil"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Kategori Düzenle</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Kategori Adı</label>
            <input 
              type="text" 
              v-model="editingCategory.Name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Açıklama</label>
            <div class="relative">
              <textarea 
                v-model="editingCategory.Description"
                rows="3"
                maxlength="50"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              ></textarea>
              <div class="absolute bottom-2 right-2 text-xs text-gray-500">
                {{ editingCategory.Description?.length || 0 }}/50
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="showEditModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </button>
          <button 
            @click="saveCategory"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Kategori Silme Onayı</h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <p class="text-gray-600">
            <strong class="text-red-500">"{{ deletingCategory?.Name }}"</strong> kategorisini silmek istediğinize emin misiniz?
          </p>
          
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  Bu işlem geri alınamaz. Kategoriyi sildiğinizde:
                </p>
                <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>Kategoriye ait tüm ürünler silinecektir</li>
                  <li>İlgili tüm raporlar ve istatistikler etkilenecektir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Vazgeç
          </button>
          <button 
            @click="deleteCategory"
            class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Yeni Kategori Ekle</h3>
          <button @click="showAddCategoryModal = false" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Kategori Adı</label>
            <input 
              type="text" 
              v-model="newCategory.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Kategori adını girin"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Açıklama</label>
            <div class="relative">
              <textarea 
                v-model="newCategory.description"
                rows="3"
                maxlength="50"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Kategori açıklamasını girin"
                @input="checkDescriptionLength"
              ></textarea>
              <div class="absolute bottom-2 right-2 text-xs text-gray-500">
                {{ newCategory.description.length }}/50
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="showAddCategoryModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </button>
          <button 
            @click="addCategory"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Ekleniyor...' : 'Ekle' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 flex items-center">
            <i class="fas fa-box-open text-primary-500 mr-3"></i>
            Yeni Ürün Ekle
          </h3>
          <button @click="showAddProductModal = false" class="text-gray-400 hover:text-gray-500 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Sol Taraf - Temel Bilgiler -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
              <input 
                type="text" 
                v-model="newProduct.name"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Ürün adını girin"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <div class="relative">
                <textarea 
                  v-model="newProduct.description"
                  rows="3"
                  maxlength="100"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ürün açıklamasını girin"
                ></textarea>
                <div class="absolute bottom-2 right-2 text-xs text-gray-400">
                  {{ newProduct.description?.length || 0 }}/100
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                <input 
                  type="number" 
                  v-model="newProduct.price"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stok Miktarı</label>
                <input 
                  type="number" 
                  v-model="newProduct.stockQuantity"
                  min="0"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <!-- Sağ Taraf - Kod Bilgileri -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kod Türü</label>
              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center p-3 border rounded-lg cursor-pointer transition-all"
                       :class="[newProduct.codeType === 'barcode' ? 'border-primary-500 bg-primary-50' : 'border-gray-200']">
                  <input 
                    type="radio" 
                    v-model="newProduct.codeType" 
                    value="barcode"
                    class="hidden"
                  >
                  <i class="fas fa-barcode mr-2" :class="[newProduct.codeType === 'barcode' ? 'text-primary-500' : 'text-gray-400']"></i>
                  <span :class="[newProduct.codeType === 'barcode' ? 'text-primary-700' : 'text-gray-600']">Barkod</span>
                </label>
                <label class="flex items-center p-3 border rounded-lg cursor-pointer transition-all"
                       :class="[newProduct.codeType === 'qr' ? 'border-primary-500 bg-primary-50' : 'border-gray-200']">
                  <input 
                    type="radio" 
                    v-model="newProduct.codeType" 
                    value="qr"
                    class="hidden"
                  >
                  <i class="fas fa-qrcode mr-2" :class="[newProduct.codeType === 'qr' ? 'text-primary-500' : 'text-gray-400']"></i>
                  <span :class="[newProduct.codeType === 'qr' ? 'text-primary-700' : 'text-gray-600']">QR Kod</span>
                </label>
              </div>
            </div>

            <div v-if="newProduct.codeType" class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-center mb-4">
                <button 
                  @click="generateCode"
                  class="btn-primary flex items-center"
                >
                  <i class="fas fa-magic mr-2"></i>
                  Otomatik Oluştur
                </button>
              </div>

              <!-- Code Preview -->
              <div v-if="newProduct.codeValue" class="text-center">
                <div v-if="newProduct.codeType === 'qr'" class="bg-white p-4 rounded-lg inline-block">
                  <qrcode-vue :value="newProduct.codeValue" :size="200" level="H" class="mx-auto"></qrcode-vue>
                </div>
                <div v-else class="bg-white p-4 rounded-lg">
                  <svg ref="barcodeElement"></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end space-x-3 border-t pt-4">
          <button 
            @click="showAddProductModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button 
            @click="addProduct"
            class="px-6 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors flex items-center"
            :disabled="isAddingProduct"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ isAddingProduct ? 'Ekleniyor...' : 'Ürün Ekle' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Ürün Düzenle</h3>
          <button @click="showEditProductModal = false" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- Product Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Ürün Adı</label>
            <input 
              type="text" 
              v-model="editingProduct.Name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Ürün adını girin"
            />
          </div>

          <!-- Product Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Açıklama</label>
            <div class="relative">
              <textarea 
                v-model="editingProduct.Description"
                rows="3"
                maxlength="100"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Ürün açıklamasını girin"
              ></textarea>
              <div class="absolute bottom-2 right-2 text-xs text-gray-500">
                {{ editingProduct.Description?.length || 0 }}/100
              </div>
            </div>
          </div>

          <!-- Price -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Fiyat (₺)</label>
            <input 
              type="number" 
              v-model="editingProduct.Price"
              min="0"
              step="0.01"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>

          <!-- Stock Quantity -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Stok Miktarı</label>
            <input 
              type="number" 
              v-model="editingProduct.StockQuantity"
              min="0"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="0"
            />
          </div>

          <!-- Code Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Kod Türü</label>
            <div class="mt-2 flex space-x-4">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="editingProduct.CodeType" 
                  value="barcode"
                  class="form-radio text-primary-500"
                >
                <span class="ml-2">Barkod</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="editingProduct.CodeType" 
                  value="qr"
                  class="form-radio text-primary-500"
                >
                <span class="ml-2">QR Kod</span>
              </label>
            </div>
          </div>

          <!-- Code Input/Scanner -->
          <div v-if="editingProduct.CodeType">
            <label class="block text-sm font-medium text-gray-700">
              {{ editingProduct.CodeType === 'barcode' ? 'Barkod' : 'QR Kod' }}
            </label>
            <div class="mt-2 space-y-3">
              <div class="flex space-x-2">
                <input 
                  type="text" 
                  v-model="editingProduct.CodeValue"
                  :placeholder="editingProduct.CodeType === 'barcode' ? 'Barkod değeri' : 'QR kod değeri'"
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button 
                  @click="scanCode"
                  class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <i class="fas fa-qrcode mr-2"></i>
                  Tarat
                </button>
              </div>
              
              <button 
                @click="generateEditCode"
                class="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <i class="fas fa-magic mr-2"></i>
                Otomatik Oluştur
              </button>

              <!-- Code Preview -->
              <div v-if="editingProduct.CodeValue" class="p-4 bg-gray-50 rounded-lg">
                <div class="text-center" v-if="editingProduct.CodeType === 'qr'">
                  <qrcode-vue :value="editingProduct.CodeValue" :size="200" level="H"></qrcode-vue>
                </div>
                <div class="text-center" v-else>
                  <svg ref="editBarcodeElement"></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="showEditProductModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </button>
          <button 
            @click="saveProduct"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600"
            :disabled="isEditingProduct"
          >
            {{ isEditingProduct ? 'Güncelleniyor...' : 'Güncelle' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Product Confirmation Modal -->
    <div v-if="showDeleteProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Ürün Silme Onayı</h3>
          <button @click="showDeleteProductModal = false" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <p class="text-gray-600">
            <strong class="text-red-500">"{{ deletingProduct?.Name }}"</strong> ürünü silmek istediğinize emin misiniz?
          </p>
          
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  Bu işlem geri alınamaz. Ürünü sildiğinizde:
                </p>
                <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>Ürüne ait tüm veriler silinecektir</li>
                  <li>İlgili tüm raporlar ve istatistikler etkilenecektir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="showDeleteProductModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Vazgeç
          </button>
          <button 
            @click="deleteProduct"
            class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>

    <!-- Code Preview Modal -->
    <div v-if="showCodePreviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900 flex items-center">
            <i :class="[previewProduct?.CodeType === 'qr' ? 'fas fa-qrcode' : 'fas fa-barcode']" class="mr-2 text-primary-500"></i>
            {{ previewProduct?.CodeType === 'qr' ? 'QR Kod' : 'Barkod' }}
          </h3>
          <button @click="showCodePreviewModal = false" class="text-gray-400 hover:text-gray-500 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="text-center bg-gray-50 p-4 rounded-xl">
            <div v-if="previewProduct?.CodeType === 'qr'" id="qrcode" class="flex justify-center">
              <qrcode-vue :value="previewProduct.CodeValue" :size="200" level="H" class="mx-auto"></qrcode-vue>
            </div>
            <div v-else>
              <svg ref="previewBarcodeElement"></svg>
            </div>
          </div>
          
          <div class="flex justify-center">
            <button 
              @click="downloadCode"
              class="btn-primary flex items-center px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <i class="fas fa-download mr-2"></i>
              {{ previewProduct?.CodeType === 'qr' ? 'QR Kodu İndir' : 'Barkodu İndir' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Package Modal -->
    <PackageModal
      v-if="showNewPackageModal"
      :show="showNewPackageModal"
      :available-products="availableProducts"
      @close="showNewPackageModal = false"
      @package-created="handlePackageCreated"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Modal from '@/components/Modal.vue';
import { useToast } from 'vue-toastification';
import QrcodeVue from 'qrcode.vue';
import JsBarcode from 'jsbarcode';
import axios from 'axios';
import PackageModal from '@/components/PackageModal.vue';

export default {
  name: 'Stock',
  components: {
    Modal,
    QrcodeVue,
    PackageModal
  },
  setup() {
    const toast = useToast();
    const store = useStore();
    const router = useRouter();
    
    // State
    const companyId = ref(localStorage.getItem('companyIdva'));
    const showAddCategoryModal = ref(false);
    const showAddProductModal = ref(false);
    const showNewPackageModal = ref(false);
    const searchQuery = ref('');
    const packageSearch = ref('');
    const selectedCategoryFilter = ref('');
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true');
    const flippedCardId = ref(null);
    const packages = ref([]);
    const availableProducts = computed(() => {
      return store.state.product.products;
    });

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
      description: '',
      price: '',
      stockQuantity: '',
      categoryId: '',
      codeType: '', // 'qr' or 'barcode'
      codeValue: '',
      isCodeGenerated: false
    });

    const barcodeElement = ref(null);

    // Products computed property
    const products = computed(() => {
      const allProducts = store.getters['product/getProducts'] || [];
      
      if (selectedCategoryFilter.value) {
        return allProducts.filter(product => 
          String(product.CategoryId) === String(selectedCategoryFilter.value)
        );
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return allProducts.filter(product => 
          (product.Name && product.Name.toLowerCase().includes(query)) ||
          (product.Description && product.Description.toLowerCase().includes(query))
        );
      }
      
      return allProducts;
    });

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

    // Categories computed property
    const categories = computed(() => {
      const allCategories = store.getters['stock/getCategories'];
      if (!searchQuery.value) return allCategories;
      
      const query = searchQuery.value.toLowerCase();
      return allCategories.filter(cat => 
        cat.Name.toLowerCase().includes(query) ||
        (cat.Description && cat.Description.toLowerCase().includes(query))
      );
    });

    // Filtered categories computed property
    const filteredCategories = computed(() => {
      let result = categories.value;
      
      if (selectedCategoryFilter.value) {
        result = result.filter(cat => cat.CategoryId === selectedCategoryFilter.value);
      }
      
      return result;
    });

    // Computed Properties
    const filteredPackages = computed(() => {
      if (!packageSearch.value) return packages.value;
      
      const query = packageSearch.value.toLowerCase();
      return packages.value.filter(paket => 
        paket.Name.toLowerCase().includes(query)
      );
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

    // Ses nesnelerini null olarak başlat
    const deleteSound = ref(null);

    // Sesleri yükle
    onMounted(() => {
      try {
        deleteSound.value = new Audio('/sounds/delete.mp3');
      } catch (error) {
        console.warn('Ses dosyası yüklenemedi:', error);
      }
    });

    // Ses çalma fonksiyonu
    const playDeleteSound = () => {
      try {
        deleteSound.value?.play().catch(err => console.warn('Ses çalınamadı:', err));
      } catch (error) {
        console.warn('Ses çalma hatası:', error);
      }
    };

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
      const existingCategory = products.value.find(
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
          // Başarılı ekleme sesi çal
          playDeleteSound();
          
          // Reset form and close modal
          newCategory.value = { name: '', description: '' };
          showAddCategoryModal.value = false;
          
          // Show success toast
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

    const isAddingProduct = ref(false);

    const generateCode = () => {
      if (newProduct.value.codeType === 'qr') {
        // QR kod için ürün bilgilerini JSON formatında saklayalım
        const codeData = {
          name: newProduct.value.name,
          categoryId: newProduct.value.categoryId,
          price: parseFloat(newProduct.value.price),
          description: newProduct.value.description
        };
        newProduct.value.codeValue = JSON.stringify(codeData);
      } else {
        // Barkod için basit bir format kullanalım: URUN-KATEGORI-ID şeklinde
        const timestamp = Date.now().toString().slice(-6); // Son 6 hanesi yeterli
        newProduct.value.codeValue = `URUN-${newProduct.value.categoryId}-${timestamp}`;
      }
      newProduct.value.isCodeGenerated = true;
    };

    const scanCode = async () => {
      try {
        // Here you would integrate with a barcode/QR scanner library
        // For now, we'll just show a mock implementation
        toast.info("Tarayıcı özelliği yakında eklenecek!", {
          timeout: 3000,
          position: "top-right",
          icon: "📷"
        });
      } catch (error) {
        toast.error("Kod tarama sırasında bir hata oluştu", {
          timeout: 3000,
          position: "top-right",
          icon: "❌"
        });
      }
    };

    const addProduct = async () => {
      console.log('Starting addProduct with:', newProduct.value); // Debug log

      // Validation
      if (!newProduct.value.name || !newProduct.value.description || 
          !newProduct.value.price || !newProduct.value.stockQuantity || 
          !newProduct.value.categoryId) {
        toast.error("Lütfen tüm zorunlu alanları doldurun!", {
          timeout: 3000,
          position: "top-right",
          icon: "❌"
        });
        return;
      }

      isAddingProduct.value = true;
      try {
        // Eğer kod türü seçilmişse ve değer yoksa otomatik oluştur
        if (newProduct.value.codeType && !newProduct.value.codeValue) {
          generateCode();
        }

        const productData = {
          CompanyId: companyId.value.toString(),
          CategoryId: newProduct.value.categoryId.toString(),
          Name: newProduct.value.name,
          Description: newProduct.value.description,
          Price: parseFloat(newProduct.value.price),
          StockQuantity: parseInt(newProduct.value.stockQuantity),
          CodeType: newProduct.value.codeType || null,
          CodeValue: newProduct.value.codeValue || null,
          IsCodeGenerated: newProduct.value.isCodeGenerated ? 1 : 0
        };

        console.log('Sending product data to API:', productData); // Debug log

        const response = await store.dispatch('product/addProduct', productData);

        console.log('API Response:', response); // Debug log

        if (response.success) {
          // Reset form and close modal
          newProduct.value = {
            name: '',
            description: '',
            price: 0,
            stockQuantity: 0,
            categoryId: null,
            codeType: '',
            codeValue: null,
            isCodeGenerated: false
          };
          showAddProductModal.value = false;
          
          toast.success(`✨ ${response.message}`, {
            timeout: 4000,
            position: "top-right",
            closeOnClick: true,
            theme: "colored"
          });

          // Refresh products list
          await store.dispatch('product/fetchProducts', {
            companyId: companyId.value,
            categoryId: newProduct.value.categoryId
          });
        }
      } catch (error) {
        console.error('Error adding product:', error);
        toast.error(`Ürün eklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, {
          timeout: 5000,
          position: "top-right",
          icon: "⚠️",
          closeOnClick: true
        });
      } finally {
        isAddingProduct.value = false;
      }
    };

    const fetchProducts = async (categoryId) => {
      if (!companyId.value) {
        console.error('CompanyId bulunamadı');
        return;
      }

      try {
        await store.dispatch('product/fetchProducts', {
          companyId: companyId.value,
          categoryId: categoryId
        });
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      }
    };

    const getProductCountByCategory = (categoryId) => {
      return store.getters['product/getProductCountByCategory'](categoryId) || 0;
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
        const category = products.value.find(cat => cat.CategoryId === selectedCategoryFilter.value);
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
        console.log('Mounting with CompanyId:', companyId.value);
        try {
          await store.dispatch('stock/fetchCategories', companyId.value);
          await store.dispatch('product/fetchProducts', {
            companyId: companyId.value,
            categoryId: ''
          });
          await fetchPackages(); // Paketleri yükle
        } catch (error) {
          console.error('Veriler yüklenirken hata:', error);
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

    const toggleCard = (categoryId, event) => {
      event.stopPropagation(); // Event propagation'ı durdur
      if (flippedCardId.value === categoryId) {
        flippedCardId.value = null;
      } else {
        flippedCardId.value = categoryId;
      }
    };

    const showEditModal = ref(false);
    const editingCategory = ref({
      CategoryId: null,
      Name: '',
      Description: ''
    });

    const editCategory = (category) => {
      editingCategory.value = { ...category };
      showEditModal.value = true;
    };

    const saveCategory = async () => {
      try {
        const response = await store.dispatch('stock/updateCategory', {
          category: editingCategory.value,
          companyId: companyId.value
        });

        if (response.success) {
          toast.info(`${response.message}`, {
            timeout: 3000,
            position: "top-right",
            icon: "✨",
            closeOnClick: true,
            theme: "colored"
          });
          showEditModal.value = false;
        }
      } catch (error) {
        toast.error(`Kategori güncellenirken bir hata oluştu: ${error.message}`, {
          timeout: 4000,
          position: "top-right",
          icon: "⚠️"
        });
      }
    };

    const showDeleteModal = ref(false);
    const deletingCategory = ref(null);

    const confirmDeleteCategory = (category) => {
      deletingCategory.value = category;
      showDeleteModal.value = true;
    };

    const deleteCategory = async () => {
      try {
        const response = await store.dispatch('stock/deleteCategory', {
          categoryId: deletingCategory.value.CategoryId,
          companyId: companyId.value
        });

        if (response.success) {
          // Başarılı silme sesi çal
          playDeleteSound();
          
          toast.error(`🗑️ ${response.message}`, {
            timeout: 3000,
            position: "top-right",
            closeOnClick: true,
            theme: "colored"
          });
          showDeleteModal.value = false;
        }
      } catch (error) {
        toast.error(`Kategori silinirken bir hata oluştu: ${error.message}`, {
          timeout: 4000,
          position: "top-right",
          icon: "⚠️"
        });
      }
    };

    const openAddProductModal = (category) => {
      console.log('Opening add product modal with category:', category); // Debug log
      
      if (!category || !category.CategoryId) {
        toast.error("Kategori bilgisi bulunamadı!", {
          timeout: 3000,
          position: "top-right",
          icon: "❌"
        });
        return;
      }

      newProduct.value = {
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        categoryId: category.CategoryId, // CategoryId'yi doğrudan atıyoruz
        codeType: '',
        codeValue: null,
        isCodeGenerated: false
      };
      
      console.log('New product initialized:', newProduct.value); // Debug log
      showAddProductModal.value = true;
    };

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(cat => String(cat.CategoryId) === String(categoryId));
      return category ? category.Name : 'Bilinmeyen Kategori';
    };

    const showEditProductModal = ref(false);
    const editingProduct = ref({
      ProductId: null,
      Name: '',
      Description: '',
      Price: '',
      StockQuantity: '',
      CategoryId: '',
      CodeType: '',
      CodeValue: '',
      IsCodeGenerated: false
    });
    const isEditingProduct = ref(false);

    const editProduct = (product) => {
      editingProduct.value = { ...product };
      showEditProductModal.value = true;
    };

    const editBarcodeElement = ref(null);

    // Watch for changes in edit barcode value to update preview
    watch(() => editingProduct.value.CodeValue, (newValue) => {
      if (editingProduct.value.CodeType === 'barcode' && newValue && editBarcodeElement.value) {
        nextTick(() => {
          try {
            JsBarcode(editBarcodeElement.value, newValue, {
              format: "CODE128",
              width: 2,
              height: 100,
              displayValue: true
            });
          } catch (error) {
            console.error('Error generating barcode:', error);
          }
        });
      }
    });

    const generateEditCode = () => {
      if (editingProduct.value.CodeType === 'qr') {
        // QR kod için ürün bilgilerini JSON formatında saklayalım
        const codeData = {
          productId: editingProduct.value.ProductId,
          name: editingProduct.value.Name,
          categoryId: editingProduct.value.CategoryId,
          price: parseFloat(editingProduct.value.Price),
          description: editingProduct.value.Description
        };
        editingProduct.value.CodeValue = JSON.stringify(codeData);
      } else {
        // Barkod için basit bir format kullanalım: URUN-KATEGORI-ID şeklinde
        const timestamp = Date.now().toString().slice(-6); // Son 6 hanesi yeterli
        editingProduct.value.CodeValue = `URUN-${editingProduct.value.CategoryId}-${editingProduct.value.ProductId}-${timestamp}`;
      }
      editingProduct.value.IsCodeGenerated = true;
    };

    const saveProduct = async () => {
      if (!editingProduct.value.Name || !editingProduct.value.Description || 
          !editingProduct.value.Price || !editingProduct.value.StockQuantity) {
        toast.error("Lütfen tüm alanları doldurun!", {
          timeout: 3000,
          position: "top-right",
          icon: "❌"
        });
        return;
      }

      isEditingProduct.value = true;
      try {
        // Eğer kod türü seçilmişse ve değer yoksa otomatik oluştur
        if (editingProduct.value.CodeType && !editingProduct.value.CodeValue) {
          generateEditCode();
        }

        // Prepare product data
        const productData = {
          ProductId: editingProduct.value.ProductId,
          CompanyId: parseInt(companyId.value),
          CategoryId: parseInt(editingProduct.value.CategoryId),
          Name: editingProduct.value.Name,
          Description: editingProduct.value.Description,
          Price: parseFloat(editingProduct.value.Price),
          StockQuantity: parseInt(editingProduct.value.StockQuantity),
          CodeType: editingProduct.value.CodeType || null,
          CodeValue: editingProduct.value.CodeValue || null,
          IsCodeGenerated: editingProduct.value.IsCodeGenerated ? 1 : 0
        };

        const response = await store.dispatch('product/updateProduct', productData);

        if (response.success) {
          toast.info(`✨ ${response.message}`, {
            timeout: 3000,
            position: "top-right",
            closeOnClick: true,
            theme: "colored"
          });
          showEditProductModal.value = false;

          // Refresh products list
          await store.dispatch('product/fetchProducts', {
            companyId: parseInt(companyId.value),
            categoryId: productData.CategoryId
          });
        }
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error(`Ürün güncellenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, {
          timeout: 5000,
          position: "top-right",
          icon: "⚠️",
          closeOnClick: true
        });
      } finally {
        isEditingProduct.value = false;
      }
    };

    const showDeleteProductModal = ref(false);
    const deletingProduct = ref(null);

    const confirmDeleteProduct = (product) => {
      deletingProduct.value = product;
      showDeleteProductModal.value = true;
    };

    const deleteProduct = async () => {
      try {
        const response = await store.dispatch('product/deleteProduct', {
          productId: deletingProduct.value.ProductId,
          companyId: companyId.value,
          categoryId: deletingProduct.value.CategoryId
        });

        if (response.success) {
          // Silme sesi çal
          playDeleteSound();
          
          toast.error(`🗑️ ${response.message}`, {
            timeout: 3000,
            position: "top-right",
            closeOnClick: true,
            theme: "colored"
          });
          showDeleteProductModal.value = false;
        }
      } catch (error) {
        toast.error(`Ürün silinirken bir hata oluştu: ${error.message}`, {
          timeout: 4000,
          position: "top-right",
          icon: "⚠️"
        });
      }
    };

    const getCategoryColor = (categoryId) => {
      if (!categoryId) return { bg: 'bg-gray-100', text: 'text-gray-800' }; // Default color for undefined categoryId
      
      // Benzersiz renkler listesi
      const colors = [
        { bg: 'bg-blue-100', text: 'text-blue-800' },
        { bg: 'bg-green-100', text: 'text-green-800' },
        { bg: 'bg-purple-100', text: 'text-purple-800' },
        { bg: 'bg-pink-100', text: 'text-pink-800' },
        { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        { bg: 'bg-red-100', text: 'text-red-800' },
        { bg: 'bg-orange-100', text: 'text-orange-800' }
      ];
      
      // CategoryId'ye göre renk seç
      const index = Math.abs(parseInt(categoryId)) % colors.length;
      return colors[index] || colors[0]; // Eğer hesaplanan index geçersizse ilk rengi döndür
    };

    const showCodePreviewModal = ref(false);
    const previewProduct = ref(null);
    const previewBarcodeElement = ref(null);

    const showCodePreview = (product) => {
      previewProduct.value = product;
      showCodePreviewModal.value = true;

      // If it's a barcode, render it in the next tick
      if (product.CodeType === 'barcode') {
        nextTick(() => {
          JsBarcode(previewBarcodeElement.value, product.CodeValue, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true
          });
        });
      }
    };

    const downloadCode = () => {
      if (!previewProduct.value) return;

      if (previewProduct.value.CodeType === 'qr') {
        // QR kod için canvas oluştur
        const qrContainer = document.querySelector('#qrcode canvas');
        if (!qrContainer) {
          console.error('QR code container not found');
          return;
        }

        try {
          // Canvas'ı PNG olarak indir
          const link = document.createElement('a');
          link.download = `${previewProduct.value.Name}-qr-code.png`;
          link.href = qrContainer.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success('QR Kod başarıyla indirildi!', {
            timeout: 2000,
            position: "top-right",
            icon: "💾"
          });
        } catch (error) {
          console.error('Error downloading QR code:', error);
          toast.error('QR Kod indirilirken bir hata oluştu', {
            timeout: 3000,
            position: "top-right",
            icon: "❌"
          });
        }
      } else {
        // Barkod için SVG'yi PNG'ye çevir
        const svgElement = previewBarcodeElement.value;
        if (!svgElement) {
          console.error('Barcode element not found');
          return;
        }

        try {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // SVG'yi image'a çevir
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // PNG olarak indir
            const link = document.createElement('a');
            link.download = `${previewProduct.value.Name}-barcode.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Barkod başarıyla indirildi!', {
              timeout: 2000,
              position: "top-right",
              icon: "💾"
            });
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        } catch (error) {
          console.error('Error downloading barcode:', error);
          toast.error('Barkod indirilirken bir hata oluştu', {
            timeout: 3000,
            position: "top-right",
            icon: "❌"
          });
        }
      }
    };

    // Package Methods
    const isLoadingPackages = ref(false);

    const fetchPackages = async () => {
      try {
        isLoadingPackages.value = true;
        const response = await axios.get('https://flowbridge.us-e2.cloudhub.io/api/orders/getPackage', {
          params: {
            client_id: '6f0b2e5229c7455091966ef898fd6f68',
            client_secret: '8041a365CDfb448c88a7780b7699A6aC',
            CompanyId: companyId.value,
            CategoryId: selectedCategory.value?.CategoryId || 'null',
            Status: 'Active',
            Search: searchQuery.value || 'null'
          }
        });

        if (response.data && response.data.packages) {
          packages.value = response.data.packages;
        } else {
          packages.value = [];
        }
      } catch (error) {
        console.error('Paketler yüklenirken hata:', error);
        toast.error('Paketler yüklenirken bir hata oluştu');
      } finally {
        isLoadingPackages.value = false;
      }
    };

    const editPackage = (pkg) => {
      // TODO: Implement edit functionality
      console.log('Edit package:', pkg);
    };

    const deletePackage = async (packageId) => {
      if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;

      try {
        await axios.delete(`https://flowbridge.us-e2.cloudhub.io/api/orders/packages/${packageId}`, {
          params: {
            client_id: '6f0b2e5229c7455091966ef898fd6f68',
            client_secret: '8041a365CDfb448c88a7780b7699A6aC'
          }
        });
        
        toast.success('Paket başarıyla silindi');
        await fetchPackages();
      } catch (error) {
        console.error('Paket silinirken hata:', error);
        toast.error('Paket silinirken bir hata oluştu');
      }
    };

    const viewPackageDetails = (paket) => {
      // View package details logic will be implemented
    };

    const handlePackageCreated = async () => {
      await fetchPackages();
      showNewPackageModal.value = false;
      toast.success('Paket başarıyla oluşturuldu');
    };

    // Watch for search and category changes
    watch([searchQuery, selectedCategory], () => {
      fetchPackages();
    });

    // Add to existing onMounted
    onMounted(() => {
      fetchPackages();
    });

    return {
      // State
      companyId,
      showAddCategoryModal,
      showAddProductModal,
      showNewPackageModal,
      searchQuery,
      packageSearch,
      selectedCategoryFilter,
      isDarkMode,
      flippedCardId,
      barcodeElement,
      editBarcodeElement,
      previewBarcodeElement,
      showCodePreviewModal,
      previewProduct,
      isAddingProduct,
      isEditingProduct,
      showEditProductModal,
      showDeleteProductModal,
      deletingProduct,

      // Form states
      newCategory,
      newProduct,
      editingProduct,

      // Computed
      categories,
      products,
      filteredCategories,
      filteredProducts,
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
      fetchData,
      isSaving,
      filterByCategory,
      isDescriptionTooLong,
      checkDescriptionLength,
      toggleCard,
      editCategory,
      confirmDeleteCategory,
      showEditModal,
      editingCategory,
      saveCategory,
      showDeleteModal,
      deletingCategory,
      deleteCategory,
      openAddProductModal,
      getCategoryName,
      editProduct,
      confirmDeleteProduct,
      saveProduct,
      deleteProduct,
      getCategoryColor,
      generateCode,
      scanCode,
      generateEditCode,
      showCodePreview,
      downloadCode,

      // Package methods
      packages,
      availableProducts,
      handlePackageCreated,
      fetchPackages,
      editPackage,
      deletePackage,
      viewPackageDetails,
      packageSearch,
      filteredPackages,
      isLoadingPackages
    };
  }
};
</script>

<style scoped>
.flip-card-container {
  perspective: 1500px;
  height: 320px;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  cursor: pointer;
}

.flip-card.is-flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
}

.flip-card-front {
  background: white;
  transform: rotateY(0deg);
}

.flip-card-back {
  background: linear-gradient(135deg, #4F46E5 0%, #818CF8 100%);
  color: white;
  transform: rotateY(180deg);
  padding: 1.5rem;
}

.card-title {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.card-date {
  font-size: 0.95rem;
  opacity: 0.8;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.card-description {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.25rem;
  margin-top: 1rem;
  border-radius: 0.75rem;
}

.description-text {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.add-product-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-product-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn {
  opacity: 0.8;
  transition: opacity 0.3s ease;
  color: white;
}

.close-btn:hover {
  opacity: 1;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.edit-btn {
  background: rgba(255, 255, 255, 0.15);
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.delete-btn {
  background: rgba(255, 0, 0, 0.15);
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.25);
}

.action-btn-small {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.edit-btn-light {
  background: #EEF2FF;
  color: #4F46E5;
}

.edit-btn-light:hover {
  background: #E0E7FF;
  transform: translateY(-1px);
}

.delete-btn-light {
  background: #FEE2E2;
  color: #EF4444;
}

.delete-btn-light:hover {
  background: #FEE2E2;
  transform: translateY(-1px);
}
</style> 