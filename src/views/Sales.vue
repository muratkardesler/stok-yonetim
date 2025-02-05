<template>
  <div class="dashboard-layout" :class="{ 'menu-collapsed': isMenuCollapsed }">


    <!-- Ana İçerik -->
    <main class="main-content">
      <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
        <!-- Breadcrumb -->

        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Sol Taraf: Ürün ve Paket Seçimi -->
          <div class="lg:w-2/3 space-y-6">
            <!-- Arama ve Filtreler -->
            <div class="bg-white rounded-2xl shadow-lg p-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                  <div class="relative">
                    <input 
                      type="text" 
                      v-model="searchQuery"
                      placeholder="Ürün veya paket ara..."
                      class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      @input="searchProducts"
                    >
                    <i :class="['fas absolute left-3 top-1/2 transform -translate-y-1/2', loading ? 'fa-spinner fa-spin text-primary-500' : 'fa-search text-gray-400']"></i>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button @click="showBarcodeScanner = true" 
                          class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                    <i class="fas fa-barcode mr-2"></i>
                    Barkod Okut
            </button>
                  <button @click="toggleView" 
                          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                    <i :class="['fas', currentView === 'products' ? 'fa-box' : 'fa-boxes']" class="mr-2"></i>
                    {{ currentView === 'products' ? 'Paketler' : 'Ürünler' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ürünler Grid -->
            <div v-if="currentView === 'products'" class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900">Ürünler</h2>
                <span class="text-sm text-gray-500">{{ filteredProducts.length }} ürün bulundu</span>
              </div>
              <div v-if="loading" class="flex items-center justify-center py-12">
                <i class="fas fa-spinner fa-spin text-2xl text-primary-500"></i>
              </div>
              <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-search text-gray-400 text-xl"></i>
                </div>
                <p class="text-gray-500">Ürün bulunamadı</p>
                <p class="text-sm text-gray-400 mt-1">Farklı bir arama terimi deneyin</p>
              </div>
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="product in filteredProducts" 
                     :key="product.id"
                     @click="addToCart(product)"
                     class="group relative bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div class="aspect-square rounded-lg mb-3 flex items-center justify-center"
                       :class="getCategoryBgColor(product.category_id)">
                    <i class="fas fa-box text-2xl" :class="getCategoryTextColor(product.category_id)"></i>
                  </div>
                  <h3 class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</h3>
                  <p class="text-sm font-bold text-indigo-600 mt-1">₺{{ formatPrice(product.price) }}</p>
                  <div class="absolute top-2 right-2">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-lg',
                      product.stock <= 0 ? 'bg-red-100 text-red-700' : 
                      product.stock <= 10 ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    ]">
                      {{ product.stock }} Adet
                    </span>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center bg-indigo-600/0 group-hover:bg-indigo-600/10 rounded-xl transition-all">
                    <button class="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg transform scale-95 group-hover:scale-100 transition-all">
                      <i class="fas fa-plus mr-1"></i>
                      Sepete Ekle
            </button>
                  </div>
                </div>
          </div>
        </div>

            <!-- Paketler Grid -->
            <div v-else class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-4">Paketler</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="packageItem in packages" 
                     :key="packageItem.id"
                     @click="addPackageToCart(packageItem)"
                     class="group relative bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div class="absolute -top-2 -right-2">
                    <div class="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-lg">
                      %{{ calculateDiscountPercentage(packageItem) }} İndirim
            </div>
          </div>

                  <div class="mb-3">
                    <h3 class="text-base font-medium text-gray-900">{{ packageItem.name }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ packageItem.description }}</p>
          </div>

                  <div class="space-y-2">
                    <div v-for="item in packageItem.products.slice(0, 2)" 
                         :key="item.product.id"
                         class="flex items-center text-sm">
                      <div class="w-6 h-6 rounded-lg flex items-center justify-center mr-2"
                           :class="getCategoryBgColor(item.product.category_id)">
                        <i class="fas fa-box text-xs" :class="getCategoryTextColor(item.product.category_id)"></i>
            </div>
                      <span class="text-gray-600">{{ item.quantity }}x {{ item.product.name }}</span>
          </div>
                    <div v-if="packageItem.products.length > 2" 
                         class="text-xs text-gray-500 pl-8">
                      +{{ packageItem.products.length - 2 }} diğer ürün
        </div>
      </div>

                  <div class="mt-3 pt-3 border-t border-gray-100">
                    <div class="flex justify-between items-center">
                      <div class="flex flex-col">
                        <span class="text-xs text-gray-500 line-through">₺{{ formatPrice(calculatePackageOriginalPrice(packageItem)) }}</span>
                        <span class="text-base font-bold text-emerald-600">₺{{ formatPrice(packageItem.price) }}</span>
                      </div>
                      <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg transform scale-95 group-hover:scale-100 transition-all">
                          <i class="fas fa-plus mr-1"></i>
                          Sepete Ekle
                  </button>
                      </div>
                    </div>
                  </div>
        </div>
      </div>
    </div>

            <!-- Bekleyen Satışlar -->
            <div class="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900">Bekleyen Satışlar</h2>
                <span class="text-sm text-gray-500">{{ pendingSales.length }} bekleyen satış</span>
              </div>

              <!-- Bekleyen Satış Listesi -->
              <div class="space-y-4">
                <div v-for="sale in pendingSales" 
                     :key="sale.id" 
                     class="p-4 bg-gray-50 rounded-xl">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-sm font-medium text-gray-900">{{ sale.extra?.[0]?.customer_name }}</h3>
                      <p class="text-xs text-gray-500">{{ formatDate(sale.created_at) }}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                      Beklemede
                    </span>
                  </div>
                  
                  <!-- Satış Detayları -->
                  <div class="space-y-2 mb-3">
                    <div v-for="detail in sale.details" :key="detail.id" 
                         class="flex justify-between items-center text-sm">
                      <span class="text-gray-600">
                        {{ detail.product?.name || detail.package?.name }} × {{ detail.quantity }}
                      </span>
                      <span class="font-medium">₺{{ formatPrice(detail.total_price) }}</span>
                    </div>
                  </div>

                  <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span class="text-sm font-bold text-gray-900">
                      Toplam: ₺{{ formatPrice(sale.total_amount) }}
                    </span>
                    <div class="flex space-x-2">
                      <button @click="completeSale(sale)" 
                              class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        Onayla
                      </button>
                      <button @click="cancelSale(sale)"
                              class="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
                    </div>
                  </div>

            <!-- Tüm Satışlar -->
            <div class="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-gray-900">Tüm Satışlar</h2>
                <span class="text-sm text-gray-500">{{ totalSalesCount }} satış</span>
              </div>

              <!-- Arama ve Filtreleme -->
              <div class="flex flex-col sm:flex-row gap-4 mb-4">
                <!-- Arama -->
                <div class="flex-1">
                  <div class="relative">
                    <input
                      type="text"
                      v-model="salesSearchQuery"
                      placeholder="Müşteri adına göre ara..."
                      class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      @input="searchSales"
                    >
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  </div>

                <!-- Sıralama -->
                <div class="flex space-x-2">
                  <select 
                    v-model="sortBy"
                    @change="loadAllSales"
                    class="rounded-xl border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="date_desc">Tarihe Göre (Yeni - Eski)</option>
                    <option value="date_asc">Tarihe Göre (Eski - Yeni)</option>
                  </select>
                        </div>
                        </div>

              <!-- Yükleniyor -->
              <div v-if="loadingAllSales" class="flex items-center justify-center py-8">
                <i class="fas fa-spinner fa-spin text-xl text-primary-500"></i>
                      </div>

              <!-- Veri Yok -->
              <div v-else-if="allSales.length === 0" class="text-center py-8">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-receipt text-gray-400 text-lg"></i>
                    </div>
                <p class="text-gray-500 text-sm">Satış bulunamadı</p>
                <p v-if="salesSearchQuery" class="text-sm text-gray-400 mt-1">Farklı bir arama terimi deneyin</p>
                  </div>

              <!-- Satış Listesi -->
              <div v-else>
                <div class="space-y-3">
                  <div v-for="sale in paginatedSales" 
                       :key="sale.id" 
                       @click="handleSaleClick(sale)"
                       class="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                        <h3 class="text-sm font-medium text-gray-900">{{ sale.extra?.[0]?.customer_name }}</h3>
                        <p class="text-xs text-gray-500">{{ formatDate(sale.created_at) }}</p>
                        </div>
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        sale.sale_type === 'package' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                      ]">
                        {{ sale.sale_type === 'package' ? 'Paket' : 'Ürün' }}
                      </span>
                        </div>
                    <div class="flex justify-between items-center">
                      <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-shopping-cart mr-1"></i>
                        {{ sale.details?.length || 0 }} ürün
                      </div>
                      <span class="text-sm font-bold text-indigo-600">₺{{ formatPrice(sale.total_amount) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Sayfalama -->
                <div class="flex justify-center items-center space-x-2 mt-4">
                  <button @click="prevPage" 
                          :disabled="currentPage === 1"
                          class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="text-sm text-gray-600">
                    Sayfa {{ currentPage }} / {{ totalPages }}
                  </span>
                  <button @click="nextPage"
                          :disabled="currentPage === totalPages"
                          class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sağ Taraf: Sepet ve Satış Listesi -->
          <div class="lg:w-1/3 space-y-6">
            <!-- Sepet -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-gray-900">Sepet</h2>
                <button v-if="cart.length > 0" 
                        @click="clearCart"
                        class="text-sm text-red-600 hover:text-red-700">
                  <i class="fas fa-trash mr-1"></i>
                  Sepeti Temizle
                </button>
                  </div>
                  
              <div v-if="cart.length === 0" 
                   class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-shopping-cart text-gray-400 text-xl"></i>
                </div>
                <p class="text-gray-500">Sepetiniz boş</p>
                <p class="text-sm text-gray-400 mt-1">Ürün eklemek için sol taraftaki ürünlere tıklayın</p>
                      </div>
                      
              <div v-else class="space-y-4">
                <!-- Sepet Ürünleri -->
                <div v-for="item in cart" 
                     :key="item.id"
                     class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                      <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                         :class="[item.type === 'package' ? 'bg-indigo-100' : getCategoryBgColor(item.category_id)]">
                      <i class="fas" 
                         :class="[
                           item.type === 'package' ? 'fa-box-open text-indigo-600' : 'fa-box',
                           item.type === 'product' ? getCategoryTextColor(item.category_id) : ''
                         ]">
                      </i>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                      <div class="flex items-center mt-1">
                        <div class="flex items-center space-x-2">
                          <button @click="decrementQuantity(item)"
                                  class="w-6 h-6 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                          <span class="text-sm text-gray-600">{{ item.quantity }}</span>
                          <button @click="incrementQuantity(item)"
                                  class="w-6 h-6 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                      </div>
                        <span class="text-xs text-gray-500 ml-2">×</span>
                        <span class="text-xs font-medium text-gray-700 ml-2">₺{{ formatPrice(item.price) }}</span>
                    </div>
                    </div>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-sm font-bold text-gray-900">₺{{ formatPrice(item.price * item.quantity) }}</span>
                    <button @click="removeFromCart(item)" 
                            class="text-xs text-red-600 hover:text-red-700 mt-1">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Toplam ve Ayarlar -->
                <div class="border-t border-gray-200 pt-4 mt-4 space-y-4">
                  <!-- KDV ve İndirim Ayarları -->
                  <div class="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-medium text-gray-700">KDV Oranı (%)</label>
                      <select v-model="taxRate" 
                              class="w-24 rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="0">0%</option>
                        <option value="1">1%</option>
                        <option value="8">8%</option>
                        <option value="18">18%</option>
                    </select>
                  </div>
                    
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-medium text-gray-700">İndirim Oranı (%)</label>
                      <input type="number" 
                             v-model="discountRate" 
                             min="0" 
                             max="100"
                             class="w-24 rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                  </div>
                </div>

                  <!-- Fiyat Detayları -->
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Ara Toplam</span>
                      <span class="font-medium text-gray-900">₺{{ formatPrice(subtotal) }}</span>
                  </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">KDV (%{{ taxRate }})</span>
                      <span class="font-medium text-gray-900">₺{{ formatPrice(tax) }}</span>
                  </div>
                    <div v-if="discountRate > 0" class="flex justify-between text-sm">
                      <span class="text-red-600">İndirim (%{{ discountRate }})</span>
                      <span class="font-medium text-red-600">-₺{{ formatPrice(discount) }}</span>
                </div>
                    <div class="flex justify-between text-base font-bold pt-2">
                      <span class="text-gray-900">Toplam</span>
                      <span class="text-indigo-600">₺{{ formatPrice(total) }}</span>
          </div>
        </div>
                </div>

                <!-- Satış Butonu -->
                <button @click="createSale"
                        :disabled="cart.length === 0 || processing"
                        class="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <i class="fas fa-shopping-cart mr-2"></i>
                  {{ processing ? 'İşleniyor...' : 'Satış Yap' }}
                </button>
              </div>
            </div>

            <!-- Son Satışlar -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-gray-900">Son Yapılan Satışlar</h2>
                </div>

              <!-- Yükleniyor -->
              <div v-if="loadingSales" class="flex items-center justify-center py-8">
                <i class="fas fa-spinner fa-spin text-xl text-primary-500"></i>
                </div>

              <!-- Veri Yok -->
              <div v-else-if="recentSales.length === 0" class="text-center py-8">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-receipt text-gray-400 text-lg"></i>
                </div>
                <p class="text-gray-500 text-sm">Henüz satış bulunmuyor</p>
              </div>

              <!-- Son 5 Satış Listesi -->
              <div v-else class="space-y-3">
                <div v-for="sale in recentSales" 
                     :key="sale.id" 
                     @click="handleSaleClick(sale)"
                     class="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h3 class="text-sm font-medium text-gray-900">{{ sale.extra?.[0]?.customer_name }}</h3>
                      <p class="text-xs text-gray-500">{{ formatDate(sale.created_at) }}</p>
              </div>
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      sale.sale_type === 'package' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                    ]">
                      {{ sale.sale_type === 'package' ? 'Paket' : 'Ürün' }}
                    </span>
          </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center text-xs text-gray-500">
                      <i class="fas fa-shopping-cart mr-1"></i>
                      {{ sale.details?.length || 0 }} ürün
        </div>
                    <span class="text-sm font-bold text-indigo-600">₺{{ formatPrice(sale.total_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barkod Okuyucu Modal -->
      <Modal v-if="showBarcodeScanner" @close="showBarcodeScanner = false">
        <template #header>
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-barcode text-indigo-600 text-xl"></i>
                </div>
            <h3 class="text-xl font-bold text-gray-900">Barkod Okut</h3>
          </div>
        </template>
        <template #body>
          <BarcodeScanner @scanned="onBarcodeScanned" />
        </template>
      </Modal>

      <!-- Satış Modal -->
      <Modal v-if="showSaleModal" @close="closeSaleModal">
        <template #header>
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
                </div>
            <h3 class="text-xl font-bold text-gray-900">{{ isViewingSaleDetails ? 'Satış Detayları' : 'Yeni Satış' }}</h3>
          </div>
        </template>
        <template #body>
          <!-- Satış Detayları -->
          <template v-if="isViewingSaleDetails">
            <div class="space-y-4">
              <!-- Müşteri Bilgileri -->
              <div class="bg-gray-50 p-4 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Müşteri Bilgileri</h4>
                <p class="text-sm text-gray-900">{{ selectedSale.extra?.[0]?.customer_name }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(selectedSale.created_at) }}</p>
                <p v-if="selectedSale.extra?.[0]?.notes" class="text-sm text-gray-500 mt-2">
                  {{ selectedSale.extra[0].notes }}
                </p>
        </div>

              <!-- Ürün Listesi -->
                    <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Satın Alınan Ürünler</h4>
                <div class="space-y-2">
                  <div v-for="detail in selectedSale.details" :key="detail.id" 
                       class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                           :class="[detail.product ? getCategoryBgColor(detail.product.category_id) : 'bg-indigo-100']">
                        <i class="fas" :class="[
                          detail.product ? 'fa-box' : 'fa-box-open',
                          detail.product ? getCategoryTextColor(detail.product.category_id) : 'text-indigo-600'
                        ]"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">
                          {{ detail.product?.name || detail.package?.name }}
                        </p>
                        <p class="text-xs text-gray-500">
                          {{ detail.quantity }} adet × ₺{{ formatPrice(detail.unit_price) }}
                        </p>
                    </div>
                    </div>
                    <p class="text-sm font-bold text-gray-900">
                      ₺{{ formatPrice(detail.total_price) }}
                    </p>
                    </div>
                  </div>
                </div>

              <!-- Fiyat Detayları -->
              <div class="border-t pt-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Ara Toplam</span>
                    <span class="font-medium text-gray-900">₺{{ formatPrice(selectedSale.subtotal) }}</span>
                        </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">KDV (%{{ selectedSale.taxRate }})</span>
                    <span class="font-medium text-gray-900">₺{{ formatPrice(selectedSale.tax) }}</span>
                  </div>
                  <div v-if="selectedSale.discountRate > 0" class="flex justify-between text-sm">
                    <span class="text-red-600">İndirim (%{{ selectedSale.discountRate }})</span>
                    <span class="font-medium text-red-600">-₺{{ formatPrice(selectedSale.discount) }}</span>
                  </div>
                  <div class="flex justify-between text-base font-bold pt-2 border-t">
                    <span class="text-gray-900">Toplam</span>
                    <span class="text-indigo-600">₺{{ formatPrice(selectedSale.total) }}</span>
                  </div>
                </div>
              </div>

              <!-- Kapat Butonu -->
              <button @click="closeSaleModal"
                      class="w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                Kapat
              </button>
            </div>
          </template>

          <!-- Yeni Satış Formu -->
          <template v-else>
            <!-- Müşteri Bilgileri -->
            <div class="relative">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                Müşteri Adı
                            </label>
              <input type="text" 
                     v-model="customerName"
                     @input="searchCustomers"
                     @focus="showCustomerSuggestions = true"
                     @blur="() => { showCustomerSuggestions = false }"
                     placeholder="Müşteri adı girin..."
                     class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
              
              <!-- Müşteri Önerileri -->
              <div v-if="showCustomerSuggestions && filteredCustomers.length > 0"
                   class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                <ul class="py-1">
                  <li v-for="customer in filteredCustomers"
                      :key="customer.id"
                      @mousedown="selectCustomer(customer)"
                      class="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <span class="text-sm text-gray-900">{{ customer.name }}</span>
                  </li>
                </ul>
                          </div>
            </div>

            <!-- Notlar -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                Notlar
                            </label>
              <textarea v-model="saleNotes"
                        rows="3"
                        placeholder="Satış ile ilgili notlar..."
                        class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                          </div>

            <!-- Özet -->
            <div class="bg-gray-50 p-4 rounded-xl space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Toplam Tutar</span>
                <span class="font-medium text-gray-900">₺{{ formatPrice(total) }}</span>
                        </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Ürün Sayısı</span>
                <span class="font-medium text-gray-900">{{ totalItems }} Adet</span>
                  </div>
                </div>

            <!-- Butonlar -->
            <div class="flex space-x-3">
              <button @click="closeSaleModal"
                      class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                      İptal
                    </button>
              <button @click="confirmSale"
                      :disabled="!customerName.trim() || processing"
                      class="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {{ processing ? 'İşleniyor...' : 'Onayla' }}
                    </button>
                  </div>
          </template>
        </template>
      </Modal>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import BarcodeScanner from '@/components/BarcodeScanner.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Sales',
  components: {
    Modal,
    BarcodeScanner
  },
  setup() {
    const toast = useToast()
    const searchQuery = ref('')
    const currentView = ref('products')
    const showBarcodeScanner = ref(false)
    const products = ref([])
    const packages = ref([])
    const cart = ref([])
    const loading = ref(false)
    const taxRate = ref(18)
    const discountRate = ref(0)
    const processing = ref(false)
    const showSaleModal = ref(false)
    const customerName = ref('')
    const saleNotes = ref('')
    const recentSales = ref([])
    const loadingSales = ref(true)
    const selectedSale = ref(null)
    const pendingSales = ref([])
    const customers = ref([])
    const filteredCustomers = ref([])
    const showCustomerSuggestions = ref(false)
    const isViewingSaleDetails = ref(false)
    const showingAllSales = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalSalesCount = ref(0)
    const salesSearchQuery = ref('')
    const sortBy = ref('date_desc')
    const allSales = ref([])
    const loadingAllSales = ref(true)
    const isMenuCollapsed = ref(false)

    // Ürünleri yükle
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .order('name')
        
        if (error) throw error
        products.value = data
      } catch (error) {
        console.error('Error loading products:', error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
      }
    }

    // Debounce fonksiyonu
    const debounce = (fn, delay) => {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
      }
    }

    // Debounce'lu arama fonksiyonu
    const debouncedSearch = debounce(async () => {
      if (!searchQuery.value.trim()) {
        await loadProducts()
        return
      }

      loading.value = true
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .ilike('name', `%${searchQuery.value}%`)
          .order('name')

        if (error) throw error
        products.value = data
      } catch (error) {
        console.error('Error searching products:', error)
        toast.error('Ürün araması yapılırken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }, 300)

    // Arama fonksiyonunu debounce ile güncelle
    const searchProducts = () => {
      debouncedSearch()
    }

    // Filtrelenmiş ürünler
    const filteredProducts = computed(() => {
      return products.value
    })

    // Paketleri yükle
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

    // Sepet işlemleri
    const addToCart = (product) => {
      const existingItem = cart.value.find(item => 
        item.type === 'product' && item.id === product.id
      )

      if (existingItem) {
        existingItem.quantity++
      } else {
        cart.value.push({
          type: 'product',
          id: product.id,
          name: product.name,
          price: product.price,
          category_id: product.category_id,
          quantity: 1
        })
      }
      toast.success('Ürün sepete eklendi')
    }

    const addPackageToCart = (packageItem) => {
      const existingItem = cart.value.find(item => 
        item.type === 'package' && item.id === packageItem.id
      )

      if (existingItem) {
        existingItem.quantity++
      } else {
        cart.value.push({
          type: 'package',
          id: packageItem.id,
          name: packageItem.name,
          price: packageItem.price,
          quantity: 1,
          products: packageItem.products
        })
      }
      toast.success('Paket sepete eklendi')
    }

    const removeFromCart = (item) => {
      const index = cart.value.findIndex(i => i.id === item.id && i.type === item.type)
      if (index > -1) {
        cart.value.splice(index, 1)
        toast.success(item.type === 'package' ? 'Paket sepetten çıkarıldı' : 'Ürün sepetten çıkarıldı')
      }
    }

    const incrementQuantity = (item) => {
      const cartItem = cart.value.find(i => i.id === item.id && i.type === item.type)
      if (cartItem) {
        cartItem.quantity++
      }
    }

    const decrementQuantity = (item) => {
      const cartItem = cart.value.find(i => i.id === item.id && i.type === item.type)
      if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity--
      }
    }

    const clearCart = () => {
      cart.value = []
      toast.success('Sepet temizlendi')
    }

    // Hesaplamalar
    const subtotal = computed(() => {
      return cart.value.reduce((total, item) => total + (Number(item.price) * item.quantity), 0)
    })

    const tax = computed(() => {
      return subtotal.value * (Number(taxRate.value) / 100)
    })

    const discount = computed(() => {
      const subtotalWithTax = subtotal.value + tax.value
      return subtotalWithTax * (Number(discountRate.value) / 100)
    })

    const total = computed(() => {
      return subtotal.value + tax.value - discount.value
    })

    const totalItems = computed(() => {
      return cart.value.reduce((total, item) => total + item.quantity, 0)
    })

    // Yardımcı fonksiyonlar
    const toggleView = () => {
      currentView.value = currentView.value === 'products' ? 'packages' : 'products'
    }

    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

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

    const onBarcodeScanned = (barcode) => {
      // Barkod okuma işlemleri burada yapılacak
      console.log('Scanned barcode:', barcode)
      showBarcodeScanner.value = false
    }

    const isNewSale = computed(() => !selectedSale.value)

    const createSale = () => {
      isViewingSaleDetails.value = false
      selectedSale.value = null
      showSaleModal.value = true
    }

    const handleSaleClick = async (sale) => {
      try {
        // Önce basit veriyi göster
        selectedSale.value = {
          ...sale,
          details: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: sale.total_amount,
          taxRate: sale.extra?.[0]?.tax_rate || 0,
          discountRate: sale.extra?.[0]?.discount_rate || 0
        }
        isViewingSaleDetails.value = true
        showSaleModal.value = true

        // Sonra detaylı veriyi getir
        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            details:sale_details(
              *,
              product:products(
                *,
                category:categories(*)
              ),
              package:packages(*)
            ),
            extra:sale_details_extra(*)
          `)
          .eq('id', sale.id)
          .single()

        if (error) throw error

        // Satış detaylarını hesapla
        if (data) {
          const details = data.details || []
          const subtotal = details.reduce((sum, detail) => sum + detail.total_price, 0)
          const taxRate = data.extra?.[0]?.tax_rate || 0
          const discountRate = data.extra?.[0]?.discount_rate || 0
          const tax = subtotal * (taxRate / 100)
          const discount = subtotal * (discountRate / 100)
          const total = subtotal + tax - discount

          selectedSale.value = {
            ...data,
            details,
            subtotal,
            tax,
            discount,
            total,
            taxRate,
            discountRate
          }
        }
      } catch (error) {
        console.error('Error loading sale details:', error)
        toast.error('Satış detayları yüklenirken bir hata oluştu')
        closeSaleModal()
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadRecentSales = async () => {
      try {
        loadingSales.value = true
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            details:sale_details(
              *,
              product:products(*),
              package:packages(*)
            ),
            extra:sale_details_extra(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        recentSales.value = data
      } catch (error) {
        console.error('Error loading recent sales:', error)
        toast.error('Son satışlar yüklenirken bir hata oluştu')
      } finally {
        loadingSales.value = false
      }
    }

    const loadAllSales = async () => {
      try {
        loadingAllSales.value = true
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('sales')
          .select(`
            id,
            created_at,
            sale_type,
            status,
            total_amount,
            details:sale_details(
              id,
              quantity,
              unit_price,
              total_price,
              product:products(
                id,
                name,
                category_id
              ),
              package:packages(
                id,
                name
              )
            ),
            extra:sale_details_extra(
              id,
              customer_name,
              tax_rate,
              discount_rate,
              notes
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: sortBy.value === 'date_asc' })

        if (error) throw error
        allSales.value = data || []
        totalSalesCount.value = data?.length || 0
      } catch (error) {
        console.error('Error loading all sales:', error)
        toast.error('Satışlar yüklenirken bir hata oluştu')
      } finally {
        loadingAllSales.value = false
      }
    }

    const loadPendingSales = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            extra:sale_details_extra(*),
            details:sale_details(
              *,
              product:products(*),
              package:packages(*)
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error
        pendingSales.value = data
      } catch (error) {
        console.error('Error loading pending sales:', error)
        toast.error('Bekleyen satışlar yüklenirken bir hata oluştu')
      }
    }

    // Filtrelenmiş satışları computed olarak tanımla
    const filteredSales = computed(() => {
      if (!salesSearchQuery.value.trim()) {
        return allSales.value
      }
      const searchTerm = salesSearchQuery.value.toLowerCase().trim()
      return allSales.value.filter(sale => 
        sale.extra?.[0]?.customer_name?.toLowerCase().includes(searchTerm)
      )
    })

    // Sayfalama için computed değerler
    const paginatedSales = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredSales.value.slice(start, end)
    })

    // totalPages computed'ını güncelle
    const totalPages = computed(() => Math.ceil(filteredSales.value.length / pageSize.value))

    // Arama fonksiyonunu güncelle
    const searchSales = () => {
      currentPage.value = 1 // Aramada ilk sayfaya dön
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        loadAllSales()
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        loadAllSales()
      }
    }

    const completeSale = async (sale) => {
      try {
        processing.value = true

        // Satışı tamamla
        const { error: saleError } = await supabase
          .from('sales')
          .update({ status: 'completed' })
          .eq('id', sale.id)

        if (saleError) throw saleError

        // Müşteri bilgilerini güncelle
        const { data: saleData } = await supabase
          .from('sales')
          .select('*, extra:sale_details_extra(*)')
          .eq('id', sale.id)
          .single()

        if (saleData?.extra?.customer_name) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('*')
            .eq('name', saleData.extra.customer_name)
            .single()

          if (customerData) {
            // Müşterinin tüm tamamlanmış satışlarını getir
            const { data: allSales } = await supabase
              .from('sales')
              .select('total_amount')
              .eq('status', 'completed')
              .eq('sale_details_extra.customer_name', customerData.name)

            // Toplam alışveriş tutarını hesapla
            const totalPurchases = allSales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0

            // Müşteri bilgilerini güncelle
            const { error: customerError } = await supabase
              .from('customers')
              .update({
                total_purchases: totalPurchases,
                last_purchase_date: new Date().toISOString()
              })
              .eq('id', customerData.id)

            if (customerError) throw customerError
          }
        }

        await loadPendingSales()
        toast.success('Satış başarıyla tamamlandı')
      } catch (error) {
        console.error('Error completing sale:', error)
        toast.error('Satış tamamlanırken bir hata oluştu')
      } finally {
        processing.value = false
      }
    }

    const cancelSale = async (sale) => {
      try {
        // 1. Stokları geri al
        for (const detail of sale.details) {
          if (detail.product_id) {
            const { data: product, error: getError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', detail.product_id)
              .single()

            if (getError) throw getError

            const newStock = product.stock + detail.quantity
            const { error: updateError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', detail.product_id)

            if (updateError) throw updateError
          }
        }

        // 2. Satışı iptal olarak işaretle
        const { error: updateError } = await supabase
          .from('sales')
          .update({ status: 'cancelled' })
          .eq('id', sale.id)

        if (updateError) throw updateError

        toast.success('Satış iptal edildi')
        await loadPendingSales()
        await loadProducts()
        await loadRecentSales()
      } catch (error) {
        console.error('Error cancelling sale:', error)
        toast.error('Satış iptal edilirken bir hata oluştu')
      }
    }

    const confirmSale = async () => {
      if (!customerName.value.trim()) {
        toast.error('Lütfen müşteri adı girin')
        return
      }

      processing.value = true
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) throw new Error('Oturum bulunamadı')

        // Müşteri kaydetmeyi dene ama hata alırsa devam et
        let customer = { name: customerName.value.trim() }
        try {
          const savedCustomer = await saveCustomer(customerName.value.trim())
          if (savedCustomer) {
            customer = savedCustomer
          }
        } catch (error) {
          console.error('Customer save error:', error)
          // Müşteri kaydedilemese bile satışa devam et
        }

        // 1. Satış kaydı oluştur
        const { data: sale, error: saleError } = await supabase
          .from('sales')
          .insert({
            user_id: session.user.id,
            sale_type: cart.value.some(item => item.type === 'package') ? 'package' : 'product',
            status: 'pending',
            total_amount: Number(total.value),
            customer_id: customer.id
          })
          .select()
          .single()

        if (saleError) throw saleError

        // 2. Satış detaylarını kaydet
        const saleDetails = cart.value.map(item => ({
          sale_id: sale.id,
          product_id: item.type === 'product' ? item.id : null,
          package_id: item.type === 'package' ? item.id : null,
          quantity: item.quantity,
          unit_price: Number(item.price),
          total_price: Number(item.price * item.quantity)
        }))

        const { error: detailsError } = await supabase
          .from('sale_details')
          .insert(saleDetails)

        if (detailsError) throw detailsError

        // 3. Satış ekstra detaylarını kaydet
        const { error: extraDetailsError } = await supabase
          .from('sale_details_extra')
          .insert({
            sale_id: sale.id,
            customer_name: customer.name,
            tax_rate: Number(taxRate.value),
            discount_rate: Number(discountRate.value),
            notes: saleNotes.value
          })

        if (extraDetailsError) throw extraDetailsError

        // 4. Stokları güncelle
        for (const item of cart.value) {
          if (item.type === 'product') {
            // Önce mevcut stok miktarını al
            const { data: productData, error: getError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.id)
              .single()

            if (getError) throw getError

            // Yeni stok miktarını hesapla
            const newStock = productData.stock - item.quantity

            // Stok güncelleme
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.id)

            if (stockError) throw stockError
          }
        }

        toast.success('Satış kaydı oluşturuldu')
        showSaleModal.value = false
        cart.value = []
        customerName.value = ''
        saleNotes.value = ''
        discountRate.value = 0
        taxRate.value = 18
        
        // Sayfayı yenile
        await Promise.all([
          loadPendingSales(),
          loadProducts(),
          loadRecentSales()
        ])
        
      } catch (error) {
        console.error('Error creating sale:', error)
        toast.error('Satış oluşturulurken bir hata oluştu: ' + error.message)
      } finally {
        processing.value = false
      }
    }

    // Kategori renk fonksiyonları
    const getCategoryBgColor = (categoryId) => {
      const colors = {
        1: 'bg-red-100',
        2: 'bg-blue-100',
        3: 'bg-green-100',
        4: 'bg-yellow-100',
        5: 'bg-purple-100',
        6: 'bg-pink-100',
        7: 'bg-indigo-100',
        8: 'bg-orange-100'
      }
      return colors[categoryId] || 'bg-gray-100'
    }

    const getCategoryTextColor = (categoryId) => {
      const colors = {
        1: 'text-red-600',
        2: 'text-blue-600',
        3: 'text-green-600',
        4: 'text-yellow-600',
        5: 'text-purple-600',
        6: 'text-pink-600',
        7: 'text-indigo-600',
        8: 'text-orange-600'
      }
      return colors[categoryId] || 'text-gray-600'
    }

    const closeSaleModal = () => {
      showSaleModal.value = false
      selectedSale.value = null
      isViewingSaleDetails.value = false
      customerName.value = ''
      saleNotes.value = ''
    }

    // Müşterileri yükle
    const loadCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name')

        if (error) throw error
        customers.value = data
      } catch (error) {
        console.error('Error loading customers:', error)
        toast.error('Müşteriler yüklenirken bir hata oluştu')
      }
    }

    // Müşteri ara
    const searchCustomers = () => {
      if (!customerName.value) {
        filteredCustomers.value = []
        showCustomerSuggestions.value = false
        return
      }
      
      filteredCustomers.value = customers.value.filter(customer => 
        customer.name.toLowerCase().includes(customerName.value.toLowerCase())
      )
      showCustomerSuggestions.value = true
    }

    // Müşteri seç
    const selectCustomer = (customer) => {
      customerName.value = customer.name
      showCustomerSuggestions.value = false
      filteredCustomers.value = []
    }

    // Müşteri kaydet
    const saveCustomer = async (name) => {
      try {
        // Müşteri zaten var mı kontrol et
        const { data: existingCustomers, error: searchError } = await supabase
          .from('customers')
          .select('*')
          .ilike('name', name)
          .single()

        if (!searchError && existingCustomers) {
          return existingCustomers
        }

        // Yeni müşteri ekle
        const { data, error } = await supabase
          .from('customers')
          .insert([{ 
            name: name,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) {
          console.error('Error saving customer:', error)
          // Müşteri tablosu yoksa veya hata alındıysa, satışı müşteri olmadan devam ettir
          return { name: name }
        }
        
        return data
        } catch (error) {
        console.error('Error in saveCustomer:', error)
        // Hata durumunda satışı müşteri olmadan devam ettir
        return { name: name }
      }
    }

    const toggleMenu = () => {
      isMenuCollapsed.value = !isMenuCollapsed.value
    }

    // Sayfa yüklendiğinde verileri çek
    onMounted(async () => {
      await Promise.all([
        loadProducts(),
        loadPackages(),
        loadRecentSales(),
        loadPendingSales(),
        loadCustomers(),
        loadAllSales() // Tüm satışları da yükle
      ])
    })

    return {
      searchQuery,
      currentView,
      showBarcodeScanner,
      products,
      packages,
      cart,
      loading,
      filteredProducts,
      searchProducts,
      addToCart,
      addPackageToCart,
      removeFromCart,
      incrementQuantity,
      decrementQuantity,
      clearCart,
      subtotal,
      tax,
      total,
      toggleView,
      formatPrice,
      calculatePackageOriginalPrice,
      calculateDiscountPercentage,
      onBarcodeScanned,
      taxRate,
      discountRate,
      processing,
      showSaleModal,
      customerName,
      saleNotes,
      totalItems,
      createSale,
      formatDate,
      recentSales,
      loadingSales,
      getCategoryBgColor,
      getCategoryTextColor,
      confirmSale,
      closeSaleModal,
      pendingSales,
      completeSale,
      cancelSale,
      customers,
      filteredCustomers,
      showCustomerSuggestions,
      searchCustomers,
      selectCustomer,
      handleSaleClick,
      isViewingSaleDetails,
      selectedSale,
      showingAllSales,
      currentPage,
      totalPages,
      totalSalesCount,
      salesSearchQuery,
      sortBy,
      allSales,
      loadingAllSales,
      loadAllSales,
      nextPage,
      prevPage,
      paginatedSales,
      filteredSales,
      isMenuCollapsed,
      toggleMenu,
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--background-light);
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.menu-collapsed .sidebar {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.menu-collapsed .logo-text {
  display: none;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 1rem;
}

.nav-item:hover, .nav-item.active {
  background: var(--background-light);
  color: var(--primary-color);
}

.nav-item i {
  font-size: 1.25rem;
  width: 24px;
}

.menu-collapsed .nav-item span {
  display: none;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: fixed;
    bottom: 0;
    z-index: 100;
    border-top: 1px solid var(--border-color);
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-nav {
    display: flex;
    justify-content: space-around;
    padding: 0.5rem;
  }

  .nav-item {
    flex-direction: column;
    padding: 0.5rem;
    text-align: center;
    gap: 0.25rem;
  }

  .nav-item span {
    font-size: 0.75rem;
  }

  .main-content {
    padding: 1rem;
    margin-bottom: 60px;
  }
}
</style> 