<template>
  <div class="px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Package Sales Section -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Paket Satış</h2>
        <button v-if="cartItems.length > 0" 
                @click="clearCart" 
                class="text-red-600 hover:text-red-700 text-sm font-medium">
          <i class="fas fa-trash mr-1"></i>
          Sepeti Temizle
        </button>
      </div>

      <!-- Empty Cart Message -->
      <div v-if="cartItems.length === 0" 
           class="flex flex-col items-center justify-center py-16 px-4">
        <div class="w-48 h-48 mb-8 relative">
          <div class="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
          <div class="absolute inset-4 bg-indigo-50 rounded-full"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="fas fa-box-open text-6xl text-indigo-600 opacity-80"></i>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h3>
        <p class="text-gray-500 text-center max-w-md mb-8">
          Sepetinize henüz paket eklemediniz. Hemen alışverişe başlayın ve paketlerinizi sepete ekleyin.
        </p>
        <router-link to="/stok/paketler"
                     class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <i class="fas fa-box-open mr-2"></i>
          Paketleri Görüntüle
        </router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="space-y-4">
        <div v-for="item in cartItems" 
             :key="item.id"
             class="flex items-center justify-between py-4 border-b border-gray-100">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 flex-shrink-0">
              <div class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <i class="fas fa-box-open text-indigo-600"></i>
              </div>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ item.package.name }}</h3>
              <p class="text-sm text-gray-500">{{ formatPrice(item.package.price) }} × {{ item.quantity }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <button @click="decreaseQuantity(item)"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <i class="fas fa-minus text-gray-600 text-sm"></i>
              </button>
              <span class="w-8 text-center">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <i class="fas fa-plus text-gray-600 text-sm"></i>
              </button>
            </div>
            <div class="w-24 text-right font-medium">
              {{ formatPrice(item.package.price * item.quantity) }}
            </div>
            <button @click="removeFromCart(item)" 
                    class="text-red-600 hover:text-red-700">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div v-if="cartItems.length > 0" class="mt-6 space-y-3">
        <!-- KDV Select -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600">KDV Oranı (%)</span>
          <select v-model="taxRate" 
                  class="rounded-lg border-gray-300 w-32 text-right">
            <option value="0">0%</option>
            <option value="1">1%</option>
            <option value="8">8%</option>
            <option value="18">18%</option>
          </select>
        </div>

        <!-- Discount Input -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600">İndirim Oranı (%)</span>
          <input type="number" 
                 v-model="discountRate"
                 min="0"
                 max="100"
                 class="rounded-lg border-gray-300 w-32 text-right" />
        </div>

        <div class="border-t border-gray-200 pt-4 space-y-2">
          <div class="flex justify-between text-gray-600">
            <span>Ara Toplam</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>KDV ({{ taxRate }}%)</span>
            <span>{{ formatPrice(taxAmount) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>İndirim ({{ discountRate }}%)</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="flex justify-between font-medium text-lg text-gray-900">
            <span>Toplam</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>

        <button @click="openCustomerModal"
                class="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          <i class="fas fa-check mr-2"></i>
          Satış Yap
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabaseClient'

const store = useStore()
const toast = useToast()
const taxRate = ref(18)
const discountRate = ref(0)

// Format price function
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Computed
const cartItems = computed(() => store.getters['cart/cartItems'].filter(item => item.type === 'package'))

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.package.price * item.quantity)
  }, 0)
})

const taxAmount = computed(() => {
  return subtotal.value * (taxRate.value / 100)
})

const discountAmount = computed(() => {
  const afterTax = subtotal.value + taxAmount.value
  return afterTax * (discountRate.value / 100)
})

const total = computed(() => {
  return subtotal.value + taxAmount.value - discountAmount.value
})

// Methods
const increaseQuantity = (item) => {
  store.dispatch('cart/incrementQuantity', { type: 'package', id: item.id })
}

const decreaseQuantity = (item) => {
  if (item.quantity <= 1) {
    removeFromCart(item)
    return
  }
  store.dispatch('cart/decrementQuantity', { type: 'package', id: item.id })
}

const removeFromCart = (item) => {
  store.dispatch('cart/removeFromCart', { type: 'package', id: item.id })
  toast.success('Paket sepetten kaldırıldı')
}

const clearCart = () => {
  store.dispatch('cart/clearCart')
  toast.success('Sepet temizlendi')
}

const openCustomerModal = () => {
  if (cartItems.value.length === 0) {
    toast.warning('Sepetiniz boş')
    return
  }
  // TODO: Implement customer modal for package sales
  toast.info('Paket satış özelliği yakında eklenecek')
}
</script> 