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
            <i class="fas fa-shopping-cart"></i>
          </div>
          <span class="ml-2 font-medium">Satışlar</span>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Sales Statistics -->
      <SalesStats />

      <!-- Header Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- Left Side -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-shopping-cart text-primary-500 mr-3"></i>
              Satışlar
            </h1>
            <p class="mt-1 text-gray-600">
              Satışları yönetin ve takip edin
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
              @click="showNewSaleModal = true" 
              class="btn-primary flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              Yeni Satış
            </button>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="mt-6 flex flex-col sm:flex-row gap-4">
          <!-- Search Bar -->
          <div class="flex-1">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Sipariş ara..." 
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="sm:w-48">
            <select
              v-model="statusFilter"
              class="w-full appearance-none rounded-lg border border-gray-200 py-2 pl-4 pr-10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="">Tüm Durumlar</option>
              <option value="Completed">Tamamlandı</option>
              <option value="Pending">Beklemede</option>
              <option value="Cancelled">İptal Edildi</option>
              <option value="Refunded">İade Edildi</option>
            </select>
          </div>

          <!-- Date Filter -->
          <div class="sm:w-64">
            <div class="relative">
              <input 
                type="date" 
                v-model="dateFilter"
                class="w-full appearance-none rounded-lg border border-gray-200 py-2 pl-4 pr-10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.OrderId" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">#{{ order.OrderId }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500">
                    {{ formatDate(order.OrderDate) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ order.CustomerName || 'Genel Müşteri' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatPrice(order.TotalAmount) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(order.Status)">
                    {{ getStatusText(order.Status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500">
                    {{ getPaymentMethodText(order.PaymentMethod) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    @click="viewOrderDetails(order)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Detayları Görüntüle"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    v-if="order.Status === 'Pending'"
                    @click="editOrder(order)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Düzenle"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="order.Status !== 'Cancelled'"
                    @click="confirmCancelOrder(order)"
                    class="text-red-600 hover:text-red-900"
                    title="İptal Et"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  Henüz satış bulunmamaktadır.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- New Sale Modal -->
    <TransitionRoot appear :show="showNewSaleModal" as="template">
      <Dialog as="div" @close="closeNewSaleModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Yeni Satış
                </DialogTitle>

                <!-- Product Search and Add Section -->
                <div class="mb-6">
                  <!-- Customer Selection -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Müşteri Seç
                    </label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="customerSearch"
                        @input="searchCustomers"
                        placeholder="Müşteri ara..."
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <div v-if="filteredCustomers.length > 0" class="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <ul class="max-h-60 overflow-auto rounded-md py-1 text-base">
                          <li
                            v-for="customer in filteredCustomers"
                            :key="customer.CustomerId"
                            @click="selectCustomer(customer)"
                            class="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100"
                          >
                            <div>
                              <span class="font-medium">{{ customer.Name }}</span>
                              <p class="text-sm text-gray-500">{{ customer.Phone }}</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div v-if="selectedCustomer" class="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="font-medium">{{ selectedCustomer.Name }}</h4>
                          <p class="text-sm text-gray-500">{{ selectedCustomer.Phone }}</p>
                          <p class="text-sm text-gray-500">{{ selectedCustomer.Email }}</p>
                        </div>
                        <button
                          @click="selectedCustomer = null"
                          class="text-gray-400 hover:text-gray-600"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Ara
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      v-model="productSearch"
                      @input="searchProducts"
                      placeholder="Ürün adı ile ara..."
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                    <div v-if="filteredProducts.length > 0" class="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                      <ul class="max-h-60 overflow-auto rounded-md py-1 text-base">
                        <li
                          v-for="product in filteredProducts"
                          :key="product.ProductId"
                          @click="addToCart(product)"
                          class="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100"
                        >
                          <div class="flex items-center justify-between">
                            <div>
                              <span class="font-medium">{{ product.Name }}</span>
                              <p class="text-sm text-gray-500">Stok: {{ product.StockQuantity }}</p>
                            </div>
                            <span class="text-primary-600 font-medium">
                              {{ formatPrice(product.Price) }}
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Shopping Cart -->
                <div class="mb-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Sepet</h4>
                  <div class="border rounded-lg divide-y">
                    <div v-if="cart.length === 0" class="p-4 text-center text-gray-500">
                      Sepet boş
                    </div>
                    <div v-for="item in cart" :key="item.ProductId" class="p-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <h5 class="font-medium">{{ item.Name }}</h5>
                          <p class="text-sm text-gray-500">
                            {{ formatPrice(item.Price) }} x {{ item.quantity }}
                          </p>
                        </div>
                        <div class="flex items-center space-x-4">
                          <div class="flex items-center space-x-2">
                            <button
                              @click="decreaseQuantity(item)"
                              class="text-gray-500 hover:text-gray-700"
                              :disabled="item.quantity <= 1"
                            >
                              <i class="fas fa-minus"></i>
                            </button>
                            <span class="w-8 text-center">{{ item.quantity }}</span>
                            <button
                              @click="increaseQuantity(item)"
                              class="text-gray-500 hover:text-gray-700"
                              :disabled="item.quantity >= item.StockQuantity"
                            >
                              <i class="fas fa-plus"></i>
                            </button>
                          </div>
                          <button
                            @click="removeFromCart(item)"
                            class="text-red-500 hover:text-red-700"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payment Details -->
                <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Yöntemi
                    </label>
                    <select
                      v-model="paymentMethod"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Cash">Nakit</option>
                      <option value="CreditCard">Kredi Kartı</option>
                      <option value="BankTransfer">Banka Havalesi</option>
                      <option value="Other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <input
                      type="text"
                      v-model="notes"
                      placeholder="Sipariş notları..."
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <!-- Total and Actions -->
                <div class="flex items-center justify-between">
                  <div class="text-lg font-medium">
                    Toplam: {{ formatPrice(cartTotal) }}
                  </div>
                  <div class="space-x-3">
                    <button
                      @click="closeNewSaleModal"
                      class="btn-secondary"
                    >
                      İptal
                    </button>
                    <button
                      @click="completeSale"
                      class="btn-primary"
                      :disabled="cart.length === 0 || processing"
                    >
                      {{ processing ? 'İşleniyor...' : 'Satışı Tamamla' }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Order Details Modal -->
    <TransitionRoot appear :show="showOrderDetailsModal" as="template">
      <Dialog as="div" @close="closeOrderDetailsModal" class="relative z-10">
        <div class="fixed inset-0 bg-black bg-opacity-25" />
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Sipariş Detayları (#{{ selectedOrder?.OrderId }})
              </DialogTitle>

              <div class="mt-4">
                <!-- Sipariş Bilgileri -->
                <div class="mb-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Tarih: {{ new Date(selectedOrder?.OrderDate).toLocaleString() }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Durum: {{ selectedOrder?.Status }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Ödeme Yöntemi: {{ selectedOrder?.PaymentMethod }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Notlar: {{ selectedOrder?.Notes }}
                  </p>
                </div>

                <!-- Ürün Listesi -->
                <div class="mt-4">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Ürün</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Miktar</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Birim Fiyat</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">İndirim</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">KDV</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Toplam</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="detail in orderDetails" :key="detail.OrderDetailId">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ detail.ProductName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ detail.Quantity }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ formatPrice(detail.UnitPrice) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          %{{ detail.Discount }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          %{{ detail.Tax }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ formatPrice(calculateDetailTotal(detail)) }}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="5" class="px-6 py-4 text-right font-medium">Genel Toplam:</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ₺{{ selectedOrder?.TotalAmount.toFixed(2) }}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div class="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  @click="confirmCancelOrder"
                  v-if="selectedOrder?.Status !== 'Cancelled'"
                >
                  Siparişi İptal Et
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="closeOrderDetailsModal"
                >
                  Kapat
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Cancel Order Confirmation Modal -->
    <TransitionRoot appear :show="showCancelOrderModal" as="template">
      <Dialog as="div" @close="closeCancelOrderModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Siparişi İptal Et
                </DialogTitle>

                <div class="mb-6">
                  <p class="text-sm text-gray-500">
                    #{{ orderToCancel?.OrderId }} numaralı siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </p>
                </div>

                <div class="flex justify-end space-x-3">
                  <button
                    @click="closeCancelOrderModal"
                    class="btn-secondary"
                  >
                    Vazgeç
                  </button>
                  <button
                    @click="cancelOrder"
                    class="btn-danger"
                    :disabled="cancellingOrder"
                  >
                    {{ cancellingOrder ? 'İptal Ediliyor...' : 'Siparişi İptal Et' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Edit Order Modal -->
    <TransitionRoot appear :show="showEditOrderModal" as="template">
      <Dialog as="div" @close="closeEditOrderModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Sipariş Düzenle #{{ editingOrder?.OrderId }}
                </DialogTitle>

                <!-- Order Details -->
                <div class="mb-6">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Ödeme Yöntemi
                      </label>
                      <select
                        v-model="editingOrder.PaymentMethod"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="Cash">Nakit</option>
                        <option value="CreditCard">Kredi Kartı</option>
                        <option value="BankTransfer">Banka Havalesi</option>
                        <option value="Other">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Durum
                      </label>
                      <select
                        v-model="editingOrder.Status"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="Completed">Tamamlandı</option>
                        <option value="Pending">Beklemede</option>
                        <option value="Refunded">İade Edildi</option>
                      </select>
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Notlar
                      </label>
                      <textarea
                        v-model="editingOrder.Notes"
                        rows="3"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Sipariş notları..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="mb-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Ürünler</h4>
                  <div class="border rounded-lg divide-y">
                    <div v-for="detail in editingOrderDetails" :key="detail.OrderDetailId" class="p-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <h5 class="font-medium">{{ detail.ProductName }}</h5>
                          <p class="text-sm text-gray-500">
                            {{ formatPrice(detail.UnitPrice) }} x {{ detail.Quantity }}
                          </p>
                        </div>
                        <div class="flex items-center space-x-4">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              İndirim (%)
                            </label>
                            <input
                              type="number"
                              v-model.number="detail.Discount"
                              min="0"
                              max="100"
                              class="w-20 rounded-lg border border-gray-300 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              KDV (%)
                            </label>
                            <input
                              type="number"
                              v-model.number="detail.Tax"
                              min="0"
                              max="100"
                              class="w-20 rounded-lg border border-gray-300 px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total and Actions -->
                <div class="flex items-center justify-between">
                  <div class="text-lg font-medium">
                    Toplam: {{ formatPrice(calculateEditingOrderTotal()) }}
                  </div>
                  <div class="space-x-3">
                    <button
                      @click="closeEditOrderModal"
                      class="btn-secondary"
                    >
                      İptal
                    </button>
                    <button
                      @click="saveOrderChanges"
                      class="btn-primary"
                      :disabled="savingOrder"
                    >
                      {{ savingOrder ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import BarcodeScanner from '@/components/BarcodeScanner.vue';
import SalesStats from '@/components/SalesStats.vue';
import axios from 'axios';

export default {
  name: 'Sales',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    BarcodeScanner,
    SalesStats,
  },
  setup() {
    const store = useStore();
    const toast = useToast();
    
    // State
    const companyId = ref(localStorage.getItem('companyIdva'));
    const searchQuery = ref('');
    const statusFilter = ref('');
    const dateFilter = ref('');
    const showNewSaleModal = ref(false);
    const loading = ref(false);
    const processing = ref(false);

    // New Sale Modal State
    const productSearch = ref('');
    const filteredProducts = ref([]);
    const cart = ref([]);
    const paymentMethod = ref('Cash');
    const notes = ref('');

    // Order Details Modal State
    const showOrderDetailsModal = ref(false);
    const selectedOrder = ref(null);
    const orderDetails = ref([]);

    // Cancel Order Modal State
    const showCancelOrderModal = ref(false);
    const orderToCancel = ref(null);
    const cancellingOrder = ref(false);

    // Edit Order Modal State
    const showEditOrderModal = ref(false);
    const editingOrder = ref(null);
    const editingOrderDetails = ref([]);
    const savingOrder = ref(false);

    // Customer Selection State
    const customerSearch = ref('');
    const filteredCustomers = ref([]);
    const selectedCustomer = ref(null);

    // Computed Properties
    const orders = computed(() => store.getters['sales/getOrders']);

    const filteredOrders = computed(() => {
      let result = [...orders.value];
      
      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(order => 
          order.OrderId.toString().includes(query) ||
          (order.CustomerName && order.CustomerName.toLowerCase().includes(query))
        );
      }
      
      // Status filter
      if (statusFilter.value) {
        result = result.filter(order => order.Status === statusFilter.value);
      }
      
      // Date filter
      if (dateFilter.value) {
        const filterDate = new Date(dateFilter.value).toDateString();
        result = result.filter(order => 
          new Date(order.OrderDate).toDateString() === filterDate
        );
      }
      
      return result;
    });

    const cartTotal = computed(() => {
      return cart.value.reduce((total, item) => {
        return total + (item.Price * item.quantity);
      }, 0);
    });

    // Methods
    const fetchData = async () => {
      loading.value = true;
      try {
        await store.dispatch('sales/fetchOrders', companyId.value);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Siparişler yüklenirken bir hata oluştu!');
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    };

    const getStatusBadgeClass = (status) => {
      const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
      switch (status) {
        case 'Completed':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'Pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'Cancelled':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'Refunded':
          return `${baseClasses} bg-purple-100 text-purple-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'Completed':
          return 'Tamamlandı';
        case 'Pending':
          return 'Beklemede';
        case 'Cancelled':
          return 'İptal Edildi';
        case 'Refunded':
          return 'İade Edildi';
        default:
          return status;
      }
    };

    const getPaymentMethodText = (method) => {
      switch (method) {
        case 'Cash':
          return 'Nakit';
        case 'CreditCard':
          return 'Kredi Kartı';
        case 'BankTransfer':
          return 'Banka Havalesi';
        case 'Other':
          return 'Diğer';
        default:
          return method;
      }
    };

    const viewOrderDetails = async (order) => {
      selectedOrder.value = order;
      showOrderDetailsModal.value = true;
      
      try {
        const details = await store.dispatch('sales/fetchOrderDetails', {
          orderId: order.OrderId,
          companyId: companyId.value
        });
        orderDetails.value = details || [];
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Sipariş detayları yüklenirken bir hata oluştu!');
      }
    };

    const editOrder = async (order) => {
      try {
        // Modal'ı aç ve siparişi ayarla
        editingOrder.value = { 
          ...order,
          OrderId: order.OrderId,
          PaymentMethod: order.PaymentMethod || 'Cash',
          Status: order.Status || 'Pending',
          Notes: order.Notes || '',
          TotalAmount: Number(order.TotalAmount || 0)
        };
        showEditOrderModal.value = true;

        // Sipariş detaylarını yükle
        const details = await store.dispatch('sales/fetchOrderDetails', {
          orderId: order.OrderId,
          companyId: companyId.value
        });
        
        console.log('Fetched order details:', details);
        
        if (!details || !Array.isArray(details)) {
          console.error('Invalid order details response:', details);
          toast.error('Sipariş detayları yüklenemedi!');
          return;
        }

        // Detayları işle ve gerekli alanları ekle
        editingOrderDetails.value = details.map(detail => ({
          ...detail,
          OrderDetailId: detail.OrderDetailId,
          ProductId: detail.ProductId,
          ProductName: detail.ProductName,
          Quantity: Number(detail.Quantity || 0),
          UnitPrice: Number(detail.UnitPrice || 0),
          Discount: Number(detail.Discount || 0),
          Tax: Number(detail.Tax || 0)
        }));

        console.log('Processed order details:', editingOrderDetails.value);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Sipariş detayları yüklenirken bir hata oluştu!');
      }
    };

    const confirmCancelOrder = (order) => {
      orderToCancel.value = order;
      showCancelOrderModal.value = true;
      showOrderDetailsModal.value = false; // Close details modal if open
    };

    // Methods for New Sale Modal
    const searchProducts = async () => {
      if (!productSearch.value) {
        filteredProducts.value = [];
        return;
      }

      try {
        const response = await store.dispatch('product/searchProducts', {
          query: productSearch.value,
          companyId: companyId.value
        });

        // Stokta olan ürünleri filtrele
        filteredProducts.value = response.filter(product => product.StockQuantity > 0);

        if (filteredProducts.value.length === 0 && response.length > 0) {
          toast.warning('Bulunan ürünlerin stokta mevcut değil!');
        }
      } catch (error) {
        console.error('Error searching products:', error);
        toast.error('Ürünler aranırken bir hata oluştu!');
        filteredProducts.value = [];
      }
    };

    const addToCart = (product) => {
      const existingItem = cart.value.find(item => item.ProductId === product.ProductId);
      
      if (existingItem) {
        if (existingItem.quantity < product.StockQuantity) {
          existingItem.quantity++;
        } else {
          toast.warning('Yeterli stok yok!');
        }
      } else {
        cart.value.push({
          ...product,
          quantity: 1
        });
      }
      
      productSearch.value = '';
      filteredProducts.value = [];
    };

    const removeFromCart = (item) => {
      cart.value = cart.value.filter(cartItem => cartItem.ProductId !== item.ProductId);
    };

    const increaseQuantity = (item) => {
      if (item.quantity < item.StockQuantity) {
        item.quantity++;
      } else {
        toast.warning('Yeterli stok yok!');
      }
    };

    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        item.quantity--;
      }
    };

    const closeNewSaleModal = () => {
      showNewSaleModal.value = false;
      cart.value = [];
      paymentMethod.value = 'Cash';
      notes.value = '';
      productSearch.value = '';
      filteredProducts.value = [];
      customerSearch.value = '';
      filteredCustomers.value = [];
      selectedCustomer.value = null;
    };

    const completeSale = async () => {
      if (cart.value.length === 0) return;

      processing.value = true;
      try {
        // Siparişi oluştur
        const response = await axios.post(
          `https://flowbridge.us-e2.cloudhub.io/api/orders?client_id=6f0b2e5229c7455091966ef898fd6f68&client_secret=8041a365CDfb448c88a7780b7699A6aC`,
          {
            CompanyId: companyId.value.toString(), // string olarak gönder
            CustomerId: (selectedCustomer.value?.CustomerId || "1").toString(), // string olarak gönder
            TotalAmount: cartTotal.value,
            PaymentMethod: paymentMethod.value,
            Notes: notes.value,
            Status: 'Pending',
            OrderDetails: cart.value.map(item => ({
              ProductId: item.ProductId,
              Quantity: item.quantity,
              UnitPrice: item.Price,
              Discount: 0.00,
              Tax: 5.00 // Varsayılan KDV
            }))
          }
        );

        if (response.data.success) {
          toast.success('Satış başarıyla tamamlandı!');
          closeNewSaleModal();
          fetchData();
        } else {
          throw new Error(response.data.message || 'Sipariş oluşturulamadı');
        }
      } catch (error) {
        console.error('Error completing sale:', error);
        toast.error(error.message || 'Satış tamamlanırken bir hata oluştu!');
      } finally {
        processing.value = false;
      }
    };

    // Methods for Order Details Modal
    const closeOrderDetailsModal = () => {
      showOrderDetailsModal.value = false;
      selectedOrder.value = null;
      orderDetails.value = [];
    };

    const calculateDetailTotal = (detail) => {
      const subtotal = detail.Quantity * detail.UnitPrice;
      const discount = subtotal * (detail.Discount / 100);
      const tax = (subtotal - discount) * (detail.Tax / 100);
      return subtotal - discount + tax;
    };

    // Methods for Cancel Order Modal
    const closeCancelOrderModal = () => {
      showCancelOrderModal.value = false;
      orderToCancel.value = null;
    };

    const cancelOrder = async () => {
      if (!orderToCancel.value) return;

      cancellingOrder.value = true;
      try {
        // Yeni MuleSoft API'sini kullan
        const response = await axios.post(
          `https://flowbridge.us-e2.cloudhub.io/api/orders/cancel/${orderToCancel.value.OrderId}?client_id=6f0b2e5229c7455091966ef898fd6f68&client_secret=8041a365CDfb448c88a7780b7699A6aC`,
          {
            companyId: companyId.value
          }
        );

        if (response.data.success) {
          toast.success('Sipariş başarıyla iptal edildi!');
          closeCancelOrderModal();
          fetchData();
        } else {
          throw new Error(response.data.message || 'Sipariş iptal edilemedi');
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        toast.error(error.message || 'Sipariş iptal edilirken bir hata oluştu!');
      } finally {
        cancellingOrder.value = false;
      }
    };

    // Methods for Edit Order Modal
    const closeEditOrderModal = async () => {
      try {
        // Bekleyen işlemlerin tamamlanmasını bekle
        await Promise.resolve();
        
        // Önce modal'ı kapat
        showEditOrderModal.value = false;
        
        // Sonra state'i temizle
        setTimeout(() => {
          editingOrder.value = null;
          editingOrderDetails.value = [];
        }, 300); // Modal kapanma animasyonunun tamamlanmasını bekle
      } catch (error) {
        console.error('Error closing modal:', error);
      }
    };

    const calculateEditingOrderTotal = () => {
      console.log('Calculating total for:', editingOrderDetails.value);
      
      if (!editingOrderDetails.value || !Array.isArray(editingOrderDetails.value) || editingOrderDetails.value.length === 0) {
        console.log('No details to calculate total');
        return editingOrder.value?.TotalAmount || 0;
      }

      const total = editingOrderDetails.value.reduce((total, detail) => {
        if (!detail) {
          console.log('Skipping null detail');
          return total;
        }
        
        const quantity = Number(detail.Quantity || 0);
        const unitPrice = Number(detail.UnitPrice || 0);
        const discount = Number(detail.Discount || 0);
        const tax = Number(detail.Tax || 0);

        console.log('Calculating for item:', {
          name: detail.ProductName,
          quantity,
          unitPrice,
          discount,
          tax
        });

        const subtotal = quantity * unitPrice;
        console.log('Subtotal:', subtotal);
        
        const discountAmount = subtotal * (discount / 100);
        console.log('Discount amount:', discountAmount);
        
        const taxAmount = (subtotal - discountAmount) * (tax / 100);
        console.log('Tax amount:', taxAmount);
        
        const itemTotal = subtotal - discountAmount + taxAmount;
        console.log('Item total:', itemTotal);
        
        return total + itemTotal;
      }, 0);

      console.log('Final total:', total);
      return total;
    };

    const saveOrderChanges = async () => {
      if (!editingOrder.value) return;

      savingOrder.value = true;
      try {
        // Toplam tutarı tekrar hesapla
        const totalAmount = calculateEditingOrderTotal();
        console.log('Saving with total amount:', totalAmount);

        // Önce sipariş detaylarını güncelle
        for (const detail of editingOrderDetails.value) {
          console.log('Updating detail:', detail);
          await store.dispatch('sales/updateOrderDetail', {
            orderId: editingOrder.value.OrderId,
            orderDetailId: detail.OrderDetailId,
            orderDetail: {
              ProductId: detail.ProductId.toString(),
              Quantity: Number(detail.Quantity),
              UnitPrice: Number(detail.UnitPrice),
              Discount: Number(detail.Discount),
              Tax: Number(detail.Tax)
            }
          });
        }

        // Sonra siparişi güncelle
        const orderResponse = await store.dispatch('sales/updateOrder', {
          order: {
            OrderId: editingOrder.value.OrderId,
            TotalAmount: totalAmount,
            PaymentMethod: editingOrder.value.PaymentMethod,
            Status: editingOrder.value.Status,
            Notes: editingOrder.value.Notes
          },
          companyId: companyId.value
        });

        if (orderResponse.success) {
          toast.success('Sipariş başarıyla güncellendi!');
          closeEditOrderModal();
          fetchData();
        }
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error('Sipariş güncellenirken bir hata oluştu!');
      } finally {
        savingOrder.value = false;
      }
    };

    // Methods for Customer Selection
    const searchCustomers = async () => {
      if (!customerSearch.value) {
        filteredCustomers.value = [];
        return;
      }

      try {
        const response = await store.dispatch('customer/searchCustomers', {
          query: customerSearch.value,
          companyId: companyId.value
        });
        filteredCustomers.value = response || [];
      } catch (error) {
        console.error('Error searching customers:', error);
        toast.error('Müşteriler aranırken bir hata oluştu!');
      }
    };

    const selectCustomer = (customer) => {
      selectedCustomer.value = customer;
      customerSearch.value = '';
      filteredCustomers.value = [];
    };

    // Methods for Barcode Scanner
    const handleBarcodeScan = async (code) => {
      try {
        const response = await store.dispatch('product/searchProducts', {
          query: code,
          companyId: companyId.value
        });
        
        if (response && response.length > 0) {
          const product = response[0];
          addToCart(product);
          toast.success('Ürün sepete eklendi!');
        } else {
          toast.warning('Ürün bulunamadı!');
        }
      } catch (error) {
        console.error('Error searching product by barcode:', error);
        toast.error('Ürün aranırken bir hata oluştu!');
      }
    };

    // Lifecycle Hooks
    onMounted(() => {
      fetchData();
    });

    return {
      // State
      searchQuery,
      statusFilter,
      dateFilter,
      showNewSaleModal,
      loading,
      processing,
      productSearch,
      filteredProducts,
      cart,
      paymentMethod,
      notes,
      showOrderDetailsModal,
      selectedOrder,
      orderDetails,
      showCancelOrderModal,
      orderToCancel,
      cancellingOrder,
      showEditOrderModal,
      editingOrder,
      editingOrderDetails,
      savingOrder,
      customerSearch,
      filteredCustomers,
      selectedCustomer,

      // Computed
      filteredOrders,
      cartTotal,

      // Methods
      fetchData,
      formatDate,
      formatPrice,
      getStatusBadgeClass,
      getStatusText,
      getPaymentMethodText,
      viewOrderDetails,
      editOrder,
      confirmCancelOrder,
      searchProducts,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      closeNewSaleModal,
      completeSale,
      closeOrderDetailsModal,
      calculateDetailTotal,
      closeCancelOrderModal,
      cancelOrder,
      closeEditOrderModal,
      calculateEditingOrderTotal,
      saveOrderChanges,
      handleBarcodeScan,
      searchCustomers,
      selectCustomer,
    };
  }
};
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.btn-icon {
  @apply inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.btn-danger {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}
</style> 