<template>
  <div class="dashboard-layout" :class="{ 'menu-collapsed': isMenuCollapsed }">
    <!-- Sol Menü -->


    <!-- Ana İçerik -->
    <main class="main-content">
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Breadcrumb -->
    <nav class="mb-4">
    </nav>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
            <p class="mt-1 text-gray-600">Kategorileri, ürünleri ve paketleri kolayca yönetin</p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button @click="showAddCategoryModal = true" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>
          Yeni Kategori
        </button>
            <button @click="showAddPackageModal = true" class="btn-primary">
              <i class="fas fa-box mr-2"></i>
              Yeni Paket
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

        <!-- Ana Kategoriler -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div v-for="(mainCategory, index) in mainCategories" :key="mainCategory.id" 
               class="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <!-- Ana Kategori Header -->
            <div :class="[
              getCategoryHeaderColor(index),
              {'rounded-b-2xl': !isExpandedCategory(mainCategory.id)}
            ]" class="p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i class="fas fa-layer-group text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white">{{ mainCategory.name }}</h3>
                    <div class="flex items-center space-x-2 mt-1">
                      <div class="flex items-center space-x-1 bg-white/20 rounded-full px-2.5 py-0.5">
                        <i class="fas fa-folder-tree text-white/90 text-xs"></i>
                        <span class="text-white/90 text-xs">{{ getSubCategories(mainCategory.id).length }} Alt Kategori</span>
                      </div>
                      <div class="flex items-center space-x-1 bg-white/20 rounded-full px-2.5 py-0.5">
                        <i class="fas fa-box text-white/90 text-xs"></i>
                        <span class="text-white/90 text-xs">{{ getTotalProductCount(mainCategory.id) }} Ürün</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-1.5">
                  <button @click.stop="openAddProductModal(mainCategory)" 
                          class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <i class="fas fa-plus text-white text-sm"></i>
                  </button>
                  <button @click.stop="editCategory(mainCategory)" 
                          class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <i class="fas fa-edit text-white text-sm"></i>
                  </button>
                  <button @click.stop="deleteCategory(mainCategory)" 
                          class="p-2 rounded-lg bg-white/10 hover:bg-red-400 transition-colors">
                    <i class="fas fa-trash text-white text-sm"></i>
                  </button>
                  <button @click.stop="toggleCategory(mainCategory.id)" 
                          class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <i class="fas text-white text-sm" :class="getCategoryChevronIcon(mainCategory.id)"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Alt Kategoriler -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 -translate-y-2"
              enter-to-class="transform opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 translate-y-0"
              leave-to-class="transform opacity-0 -translate-y-2"
            >
              <div v-if="isExpandedCategory(mainCategory.id)" 
                   class="divide-y divide-gray-100 bg-white">
                <div class="p-3 bg-gray-50/80">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-medium text-gray-600">Alt Kategoriler</h4>
                    <button @click="openAddSubCategory(mainCategory)" 
                            :class="getCategoryButtonStyle(mainCategory.id)"
                            class="text-xs px-2 py-1 rounded-lg hover:bg-opacity-10 transition-colors">
                      <i class="fas fa-plus mr-1"></i>
                      Alt Kategori Ekle
                    </button>
                  </div>
                </div>
                
                <div class="space-y-0.5 p-2">
                  <div v-for="subCategory in getSubCategories(mainCategory.id)" 
                       :key="subCategory.id"
                       class="relative group">
                    <!-- Tree branch line -->
                    <div class="absolute left-4 top-0 bottom-0 w-px bg-gray-200 group-hover:bg-gray-300"></div>
                    
                    <div class="relative flex items-center pl-8 pr-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                      <!-- Tree branch connector -->
                      <div class="absolute left-4 top-1/2 w-3 h-px bg-gray-200 group-hover:bg-gray-300"></div>
                      
                      <div class="flex-1 flex items-center min-w-0">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
                             :class="getCategoryBgColor(mainCategory.id)">
                          <i class="fas fa-box text-sm" :class="getCategoryTextColor(mainCategory.id)"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-medium text-gray-900 truncate">{{ subCategory.name }}</h4>
                          <p class="text-xs text-gray-500 mt-0.5">{{ getCategoryProductCount(subCategory.id) }} Ürün</p>
                        </div>
                      </div>
                      
                      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="openAddProductModal(subCategory)" 
                                class="p-1.5 rounded-md hover:bg-gray-100"
                                :class="getCategoryTextColor(mainCategory.id)">
                          <i class="fas fa-plus text-xs"></i>
                        </button>
                        <button @click="editCategory(subCategory)" 
                                class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
                          <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button @click="deleteCategory(subCategory)" 
                                class="p-1.5 rounded-md hover:bg-red-50 text-red-500">
                          <i class="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Empty state for no subcategories -->
                  <div v-if="getSubCategories(mainCategory.id).length === 0" 
                       class="py-3 px-8 text-center">
                    <p class="text-sm text-gray-500">Henüz alt kategori bulunmuyor</p>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Yeni Ana Kategori Kartı -->
          <div @click="showAddCategoryModal = true" 
               class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-indigo-100/70 transition-all group">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <i class="fas fa-plus text-2xl text-indigo-600"></i>
            </div>
            <div class="text-center">
              <p class="text-xl font-semibold text-gray-900">Yeni Ana Kategori</p>
              <p class="text-sm text-gray-500 mt-1">Yeni bir kategori oluşturun</p>
            </div>
          </div>
        </div>

        <!-- Packages Section -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="px-6 py-5 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <i class="fas fa-box-open text-indigo-600 text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Paketler</h2>
                  <p class="text-sm text-gray-500 mt-0.5">Özel ürün paketlerinizi buradan yönetin</p>
                </div>
              </div>
              <button @click="showAddPackageModal = true" 
                      class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group">
                <i class="fas fa-plus mr-2 group-hover:scale-110 transition-transform"></i>
                <span>Yeni Paket</span>
              </button>
            </div>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="packageItem in packages" :key="packageItem.id"
                 class="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <div class="p-6">
        <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <i class="fas fa-box-open text-indigo-600 text-xl"></i>
            </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">{{ packageItem.name }}</h3>
                      <p class="text-sm text-gray-500">{{ packageItem.description }}</p>
          </div>
                  </div>
                  <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="editPackage(packageItem)"
                            class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <i class="fas fa-edit"></i>
            </button>
                    <button @click="deletePackage(packageItem)"
                            class="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
                
                <div class="space-y-3 mt-6">
                  <div v-for="item in packageItem.products" :key="item.product.id"
                       class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                           :class="getCategoryBgColor(item.product.category_id)">
                        <i class="fas fa-box text-lg" :class="getCategoryTextColor(item.product.category_id)"></i>
        </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ item.product.name }}</p>
                        <div class="flex items-center space-x-2 mt-0.5">
                          <span class="text-xs text-gray-500">{{ item.quantity }} Adet</span>
                          <span class="text-xs font-medium text-indigo-600">
                            ₺{{ formatPrice(item.product.price * item.quantity) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
                        {{ getCategoryName(item.product.category_id) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 pt-4 border-t border-gray-100">
                  <div class="relative">
                    <!-- İndirim Etiketi -->
                    <div class="absolute -top-3 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1 rounded-full transform rotate-3 shadow-lg">
                      <div class="flex items-center space-x-1">
                        <i class="fas fa-tag text-xs"></i>
                        <span class="font-bold">%{{ calculateDiscountPercentage(packageItem) }}</span>
                        <span class="text-xs">İNDİRİM</span>
                      </div>
                    </div>

                    <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                      <div class="flex flex-col space-y-3">
                        <!-- Normal Fiyat -->
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-medium text-gray-600">Normal Fiyat</span>
                          <div class="flex items-center">
                            <span class="line-through text-gray-500 text-lg">₺{{ formatPrice(calculatePackageOriginalPrice(packageItem)) }}</span>
                          </div>
                        </div>

                        <!-- İndirimli Fiyat -->
                        <div class="flex justify-between items-center pb-2">
                          <div>
                            <span class="text-base font-bold text-gray-900">İndirimli Fiyat</span>
                            <div class="flex items-center mt-0.5">
                              <span class="text-xs text-gray-500">KDV Dahil</span>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="flex flex-col items-end">
                              <span class="text-3xl font-bold text-red-600">₺{{ formatPrice(packageItem.price) }}</span>
                              <div class="text-xs text-gray-500 mt-1">
                                Kazancınız: ₺{{ formatPrice(calculatePackageOriginalPrice(packageItem) - packageItem.price) }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Ürün Sayısı -->
                        <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span class="text-sm text-gray-600">Toplam Ürün</span>
                          <span class="text-sm font-medium text-gray-900">
                            {{ packageItem.products.reduce((total, item) => total + item.quantity, 0) }} Adet
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- New Package Card -->
            <div @click="showAddPackageModal = true"
                 class="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all duration-300">
              <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-box-open text-3xl text-indigo-600 group-hover:text-indigo-700 transition-colors"></i>
              </div>
              <div class="text-center">
                <p class="text-xl font-semibold text-gray-900">Yeni Paket</p>
                <p class="text-sm text-gray-500 mt-2">Özel bir ürün paketi oluşturun</p>
              </div>
              <div class="mt-2 px-4 py-2 bg-white/50 rounded-full text-indigo-600 text-sm font-medium group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <i class="fas fa-plus mr-1"></i>
                Paket Ekle
              </div>
            </div>
      </div>
    </div>

    <!-- Products Table -->
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
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                           :class="getCategoryBgColor(product.category_id)">
                        <i class="fas fa-box" :class="getCategoryTextColor(product.category_id)"></i>
                      </div>
                      <span class="text-sm font-semibold text-gray-900">{{ product.name }}</span>
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
      </div>
    </main>

    <!-- Category Modal -->
    <Modal v-if="showAddCategoryModal" @close="closeAddCategoryModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-folder-tree text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">
          {{ editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori' }}
        </h3>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="saveCategory" class="space-y-6">
            <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
              <input
                type="text"
                v-model="categoryForm.name"
                required
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Kategori adını girin">
            </div>
            <div v-if="!editingCategory">
            <label class="block text-sm font-medium text-gray-700 mb-1">Üst Kategori</label>
              <select
                v-model="categoryForm.parent_id"
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                <option :value="null">Ana Kategori</option>
                <option v-for="cat in mainCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeAddCategoryModal" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            İptal
          </button>
          <button @click="saveCategory" 
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors">
            {{ editingCategory ? 'Güncelle' : 'Kaydet' }}
          </button>
        </div>
      </template>
    </Modal>

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
          <h3 class="text-xl font-bold text-gray-900">
            {{ deleteType === 'category' ? 'Kategori Sil' : 'Ürün Sil' }}
          </h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">
            <span v-if="deleteType === 'category'">
              <span class="font-medium text-gray-900">"{{ itemToDelete?.name }}"</span> kategorisini silmek istediğinizden emin misiniz?
              <br>
              <span class="text-red-600 text-sm mt-2 block">
                Bu işlem geri alınamaz ve kategoriye ait tüm ürünler de silinecektir.
              </span>
            </span>
            <span v-else>
              <span class="font-medium text-gray-900">"{{ itemToDelete?.name }}"</span> ürününü silmek istediğinizden emin misiniz?
              <br>
              <span class="text-red-600 text-sm mt-2 block">
                Bu işlem geri alınamaz.
              </span>
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

    <!-- Package Modal -->
    <Modal v-if="showAddPackageModal" @close="closeAddPackageModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-box text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingPackage ? 'Paketi Düzenle' : 'Yeni Paket' }}
          </h3>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="savePackage" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Paket Adı</label>
            <input
              type="text"
              v-model="packageForm.name"
              required
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Paket adını girin">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              v-model="packageForm.description"
              rows="2"
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Paket açıklaması girin"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ürünler</label>
            <div class="space-y-2">
              <div v-for="(item, index) in packageForm.products" :key="index"
                   class="flex items-center space-x-2">
                <select
                  v-model="item.product_id"
                  required
                  class="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                  <option value="" disabled>Ürün Seçin</option>
                  <optgroup v-for="mainCat in mainCategories" :key="mainCat.id" :label="mainCat.name">
                    <option v-for="product in getProductsByCategory(mainCat.id)" 
                            :key="product.id" 
                            :value="product.id">
                      {{ product.name }} - ₺{{ formatPrice(product.price) }}
                    </option>
                    <optgroup v-for="subCat in getSubCategories(mainCat.id)" 
                             :key="subCat.id" 
                             :label="'↳ ' + subCat.name">
                      <option v-for="product in getProductsByCategory(subCat.id)" 
                              :key="product.id" 
                              :value="product.id">
                        {{ product.name }} - ₺{{ formatPrice(product.price) }}
                      </option>
                    </optgroup>
                  </optgroup>
                </select>
                <div class="w-24">
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    required
                    min="1"
                    class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Adet">
                </div>
                <button type="button" @click="removeProductFromPackage(index)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button type="button" @click="addProductToPackage"
                      class="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                Ürün Ekle
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Paket Fiyatı</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 text-sm">₺</span>
              </div>
              <input
                type="number"
                v-model.number="packageForm.price"
                required
                min="0"
                step="0.01"
                class="block w-full rounded-xl border-gray-300 pl-7 pr-4 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="0.00">
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeAddPackageModal" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            İptal
          </button>
          <button @click="savePackage" 
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors">
            {{ editingPackage ? 'Güncelle' : 'Kaydet' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Stock',
  components: {
    Modal
  },
  setup() {
    const toast = useToast({
      timeout: 3000,
      closeOnClick: true,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      showCloseButtonOnHover: false,
      hideProgressBar: true,
      position: "top-right",
      toastClassName: "custom-toast",
      bodyClassName: "custom-toast-body",
      icon: true,
      closeButton: "button"
    })
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

    // Kategori açılma durumlarını tutacak nesne
    const expandedCategories = ref({})

    // Delete modal state
    const showDeleteModal = ref(false)
    const deleteType = ref(null) // 'category' or 'product'
    const itemToDelete = ref(null)

    // State for packages
    const packages = ref([])
    const showAddPackageModal = ref(false)
    const editingPackage = ref(null)
    const packageForm = ref({
      name: '',
      description: '',
      price: 0,
      products: []
    })

    const isMenuCollapsed = ref(false)

    const toggleMenu = () => {
      isMenuCollapsed.value = !isMenuCollapsed.value
    }

    const toggleCategory = (categoryId) => {
      // Önce tüm kategorileri kapat
      const newExpandedState = {}
      Object.keys(expandedCategories.value).forEach(key => {
        newExpandedState[key] = false
      })
      
      // Eğer tıklanan kategori zaten açıksa kapat, kapalıysa aç
      if (expandedCategories.value[categoryId]) {
        newExpandedState[categoryId] = false
      } else {
        newExpandedState[categoryId] = true
      }
      
      // Yeni durumu ata
      expandedCategories.value = newExpandedState
    }

    const isExpandedCategory = (categoryId) => {
      return !!expandedCategories.value[categoryId]
    }

    const getCategoryChevronIcon = (categoryId) => {
      return expandedCategories.value[categoryId] ? 'fa-chevron-up' : 'fa-chevron-down'
    }

    // Tüm kategorileri kapatmak için yardımcı fonksiyon
    const closeAllCategories = () => {
      expandedCategories.value = {}
    }

    // Tüm kategorileri açmak için yardımcı fonksiyon
    const openAllCategories = () => {
      const newState = {}
      mainCategories.value.forEach(category => {
        newState[category.id] = true
      })
      expandedCategories.value = newState
    }

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
        
        // Her kategori için başlangıç durumunu false olarak ayarla
        const initialState = {}
        data.forEach(category => {
          initialState[category.id] = false
        })
        expandedCategories.value = initialState
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

        // Kategori adının benzersiz olup olmadığını kontrol et
        const existingCategory = categories.value.find(
          cat => cat.name.toLowerCase() === categoryForm.value.name.toLowerCase() && 
                 cat.id !== editingCategory.value?.id &&
                 cat.parent_id === categoryForm.value.parent_id
        )

        if (existingCategory) {
          toast.error('Bu isimde bir kategori zaten mevcut')
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
      deleteType.value = 'category'
      itemToDelete.value = category
      showDeleteModal.value = true
    }

    // Ürün silme
    const deleteProduct = async (product) => {
      deleteType.value = 'product'
      itemToDelete.value = product
      showDeleteModal.value = true
    }

    // Silme işlemini onayla
    const confirmDelete = async () => {
      try {
        if (deleteType.value === 'category') {
        const { error } = await supabase
          .from('categories')
          .delete()
            .eq('id', itemToDelete.value.id)

          if (error) {
        console.error('Error deleting category:', error)
            throw new Error('Kategori silinirken hata oluştu')
          }

          toast.success('Kategori başarıyla silindi')
          loadCategories()
        } else {
        const { error } = await supabase
          .from('products')
          .delete()
            .eq('id', itemToDelete.value.id)

          if (error) {
            console.error('Error deleting product:', error)
            throw new Error('Ürün silinirken hata oluştu')
          }
        
          toast.success('Ürün başarıyla silindi')
        loadProducts()
          loadCategories()
        }
        closeDeleteModal()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error(error.message || 'Bir hata oluştu')
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

    const getSubCategories = (parentId) => {
      return categories.value.filter(cat => cat.parent_id === parentId)
    }

    const getCategoryProductCount = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      return category?.products?.length || 0
    }

    const openAddSubCategory = (parentCategory) => {
      categoryForm.value.parent_id = parentCategory.id
      showAddCategoryModal.value = true
    }

    const getSubCategoryColor = (index) => {
      const colors = ['hover:bg-purple-50', 'hover:bg-green-50', 'hover:bg-orange-50', 'hover:bg-pink-50']
      return colors[index % colors.length]
    }

    const getSubCategoryIconBg = (index) => {
      const colors = ['bg-purple-100', 'bg-green-100', 'bg-orange-100', 'bg-pink-100']
      return colors[index % colors.length]
    }

    const getSubCategoryIconColor = (index) => {
      const colors = ['text-purple-600', 'text-green-600', 'text-orange-600', 'text-pink-600']
      return colors[index % colors.length]
    }

    const getSubCategoryButtonColor = (index) => {
      const colors = ['text-purple-600', 'text-green-600', 'text-orange-600', 'text-pink-600']
      return colors[index % colors.length]
    }

    const getCategoryBadgeColor = (categoryId) => {
      // Önce kategoriyi bul
      const category = categories.value.find(cat => cat.id === categoryId)
      if (!category) return ''

      // Ana kategori ise direkt kendi indeksini kullan
      if (!category.parent_id) {
        const mainCategoryIndex = mainCategories.value.findIndex(cat => cat.id === category.id)
        return getMainCategoryBadgeColor(mainCategoryIndex)
      }

      // Alt kategori ise ana kategorisinin indeksini kullan
      const parentCategory = mainCategories.value.find(cat => cat.id === category.parent_id)
      const parentIndex = mainCategories.value.findIndex(cat => cat.id === parentCategory?.id)
      return getMainCategoryBadgeColor(parentIndex)
    }

    // Ana kategori badge renkleri için yardımcı fonksiyon
    const getMainCategoryBadgeColor = (index) => {
      const colors = [
        'bg-blue-50/80 text-blue-700 border border-blue-200',
        'bg-purple-50/80 text-purple-700 border border-purple-200',
        'bg-emerald-50/80 text-emerald-700 border border-emerald-200',
        'bg-orange-50/80 text-orange-700 border border-orange-200',
        'bg-pink-50/80 text-pink-700 border border-pink-200',
        'bg-cyan-50/80 text-cyan-700 border border-cyan-200'
      ]
      return colors[index % colors.length]
    }

    const getStockColor = (stock) => {
      if (stock <= 0) return 'text-red-600'
      if (stock <= 10) return 'text-orange-600'
      return 'text-green-600'
    }

    const selectedCategory = computed(() => {
      if (!productForm.value.category_id) return null
      return categories.value.find(cat => cat.id === productForm.value.category_id)
    })

    const filteredProducts = computed(() => {
      if (!selectedCategoryFilter.value) return products.value
      return products.value.filter(product => product.category_id === selectedCategoryFilter.value)
    })

    const getTotalProductCount = (categoryId) => {
      const mainCategory = categories.value.find(cat => cat.id === categoryId)
      if (!mainCategory) return 0

      const subCategories = getSubCategories(categoryId)
      const mainCategoryProducts = mainCategory.products?.length || 0
      const subCategoryProducts = subCategories.reduce((total, subCat) => {
        return total + (subCat.products?.length || 0)
      }, 0)

      return mainCategoryProducts + subCategoryProducts
    }

    const getCategoryGradient = (categoryId) => {
      const colors = {
        blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
        purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
        green: 'bg-gradient-to-r from-green-500 to-green-600',
        orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
        pink: 'bg-gradient-to-r from-pink-500 to-pink-600'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
    }

    const getCategoryCardColor = (categoryId) => {
      const colors = {
        blue: 'hover:bg-blue-50',
        purple: 'hover:bg-purple-50',
        green: 'hover:bg-green-50',
        orange: 'hover:bg-orange-50',
        pink: 'hover:bg-pink-50'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
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

    const getCategoryButtonStyle = (categoryId) => {
      const colors = {
        blue: 'border-blue-200 text-blue-600 hover:bg-blue-50',
        purple: 'border-purple-200 text-purple-600 hover:bg-purple-50',
        green: 'border-green-200 text-green-600 hover:bg-green-50',
        orange: 'border-orange-200 text-orange-600 hover:bg-orange-50',
        pink: 'border-pink-200 text-pink-600 hover:bg-pink-50'
      }
      const colorKeys = Object.keys(colors)
      return colors[colorKeys[Math.abs(parseInt(categoryId)) % colorKeys.length]]
    }

    // Ana kategori renkleri için yeni fonksiyon
    const getCategoryHeaderColor = (index) => {
      const gradients = [
        'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
        'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
        'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
        'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700',
        'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700',
        'bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700'
      ]
      return gradients[index % gradients.length]
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      deleteType.value = null
      itemToDelete.value = null
    }

    // Load packages
    const loadPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select(`
            *,
            products:package_products(
              quantity,
              product:products(*)
            )
          `)
          .order('name')
        
        if (error) throw error
        packages.value = data
      } catch (error) {
        console.error('Error loading packages:', error)
        toast.error('Paketler yüklenirken bir hata oluştu')
      }
    }

    // Package operations
    const editPackage = (packageItem) => {
      editingPackage.value = packageItem
      packageForm.value = {
        name: packageItem.name,
        description: packageItem.description,
        price: packageItem.price,
        products: packageItem.products
      }
      showAddPackageModal.value = true
    }

    const deletePackage = async (packageItem) => {
      deleteType.value = 'package'
      itemToDelete.value = packageItem
      showDeleteModal.value = true
    }

    const savePackage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (editingPackage.value) {
          // Update package
          const { error: packageError } = await supabase
            .from('packages')
            .update({
              name: packageForm.value.name,
              description: packageForm.value.description,
              price: packageForm.value.price
            })
            .eq('id', editingPackage.value.id)

          if (packageError) throw packageError

          // Update package products
          const { error: productsError } = await supabase
            .from('package_products')
            .upsert(
              packageForm.value.products.map(product => ({
                package_id: editingPackage.value.id,
                product_id: product.product_id,
                quantity: product.quantity
              }))
            )

          if (productsError) throw productsError
          toast.success('Paket güncellendi')
        } else {
          // Insert new package
          const { data: newPackage, error: packageError } = await supabase
            .from('packages')
            .insert([{
              name: packageForm.value.name,
              description: packageForm.value.description,
              price: packageForm.value.price,
              user_id: user.id
            }])
            .select()
            .single()

          if (packageError) throw packageError

          // Insert package products
          const { error: productsError } = await supabase
            .from('package_products')
            .insert(
              packageForm.value.products.map(product => ({
                package_id: newPackage.id,
                product_id: product.product_id,
                quantity: product.quantity
              }))
            )

          if (productsError) throw productsError
          toast.success('Paket eklendi')
        }

        closeAddPackageModal()
        loadPackages()
      } catch (error) {
        console.error('Error saving package:', error)
        toast.error('Paket kaydedilirken bir hata oluştu')
      }
    }

    const closeAddPackageModal = () => {
      showAddPackageModal.value = false
      editingPackage.value = null
      packageForm.value = {
        name: '',
        description: '',
        price: 0,
        products: []
      }
    }

    // Paket yönetimi için yardımcı fonksiyonlar
    const getProductsByCategory = (categoryId) => {
      return products.value.filter(product => product.category_id === categoryId)
    }

    const addProductToPackage = () => {
      packageForm.value.products.push({
        product_id: '',
        quantity: 1
      })
    }

    const removeProductFromPackage = (index) => {
      packageForm.value.products.splice(index, 1)
    }

    const calculateTotalPrice = () => {
      return packageForm.value.products.reduce((total, item) => {
        const product = products.value.find(p => p.id === item.product_id)
        return total + (product ? product.price * item.quantity : 0)
      }, 0)
    }

    // Watch total price changes
    watch(
      () => packageForm.value.products,
      () => {
        packageForm.value.price = calculateTotalPrice()
      },
      { deep: true }
    )

    // Paket için indirim hesaplama fonksiyonları
    const calculatePackageOriginalPrice = (packageItem) => {
      return packageItem.products.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0)
    }

    const calculateDiscountPercentage = (packageItem) => {
      const originalPrice = calculatePackageOriginalPrice(packageItem)
      const discountAmount = originalPrice - packageItem.price
      const discountPercentage = (discountAmount / originalPrice) * 100
      return Math.round(discountPercentage)
    }

    onMounted(() => {
      loadCategories()
      loadProducts()
      loadPackages()
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
      filterByCategory,
      getSubCategories,
      getCategoryProductCount,
      openAddSubCategory,
      toggleCategory,
      isExpandedCategory,
      getCategoryChevronIcon,
      getSubCategoryColor,
      getSubCategoryIconBg,
      getSubCategoryIconColor,
      getSubCategoryButtonColor,
      getCategoryBadgeColor,
      getStockColor,
      selectedCategory,
      filteredProducts,
      getTotalProductCount,
      getCategoryGradient,
      getCategoryCardColor,
      getCategoryBgColor,
      getCategoryTextColor,
      getCategoryButtonStyle,
      getCategoryHeaderColor,
      closeAllCategories,
      openAllCategories,
      showDeleteModal,
      closeDeleteModal,
      confirmDelete,
      deleteType,
      itemToDelete,
      packages,
      showAddPackageModal,
      editingPackage,
      packageForm,
      editPackage,
      deletePackage,
      savePackage,
      closeAddPackageModal,
      getProductsByCategory,
      addProductToPackage,
      removeProductFromPackage,
      calculateTotalPrice,
      calculatePackageOriginalPrice,
      calculateDiscountPercentage,
      isMenuCollapsed,
      toggleMenu
    }
  }
}
</script>

<style>
.btn-primary {
  @apply px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 inline-flex items-center transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
}

/* Toast özelleştirmeleri */
.custom-toast {
  @apply bg-white shadow-lg rounded-xl border-l-4 !important;
}

.custom-toast.error {
  @apply border-red-500 !important;
}

.custom-toast.success {
  @apply border-green-500 !important;
}

.custom-toast.info {
  @apply border-indigo-500 !important;
}

.custom-toast.warning {
  @apply border-yellow-500 !important;
}

.custom-toast-body {
  @apply text-gray-800 font-medium !important;
}

.Vue-Toastification__close-button {
  @apply text-gray-500 hover:text-gray-700 !important;
}
</style> 