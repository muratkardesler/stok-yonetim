<template>
  <div class="px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Packages Grid -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Paket Satışı</h2>
          <p class="mt-1 text-sm text-gray-500">Hazır paketlerden seçim yapın veya yeni paket oluşturun</p>
        </div>
        <button @click="openNewPackageModal" 
                class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
          <i class="fas fa-plus mr-2"></i>
          Yeni Paket
        </button>
      </div>

      <!-- Package Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="pkg in packages" 
             :key="pkg.id" 
             class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">{{ pkg.name }}</h3>
              <div class="flex items-center space-x-2">
                <button @click="editPackage(pkg)" 
                        class="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deletePackage(pkg)" 
                        class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Package Description -->
            <p v-if="pkg.description" class="text-sm text-gray-500 mb-4">
              {{ pkg.description }}
            </p>

            <!-- Package Products -->
            <div class="space-y-3">
              <div v-for="item in pkg.items" 
                   :key="item.id"
                   class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img v-if="item.product.media?.[0]?.url" 
                         :src="item.product.media[0].url" 
                         :alt="item.product.name"
                         class="w-full h-full object-cover rounded-lg" />
                    <i v-else class="fas fa-box text-gray-400"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.product.name }}</p>
                    <p class="text-xs text-gray-500">{{ item.quantity }} adet</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ formatPrice(item.product.price * item.quantity) }}</p>
                  <p v-if="pkg.price && pkg.price < calculatePackageTotal(pkg)" class="text-xs text-green-600">
                    İndirimli Fiyat
                  </p>
                </div>
              </div>
            </div>

            <!-- Package Summary -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Toplam Ürün</span>
                <span class="font-medium">{{ pkg.items.length }} ürün</span>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-gray-600">Paket Tutarı</span>
                <div class="text-right">
                  <span v-if="pkg.discount_rate > 0" 
                        class="text-sm line-through text-gray-400 block">
                    {{ formatPrice(calculatePackageTotal(pkg)) }}
                  </span>
                  <span class="text-lg font-bold text-gray-900">
                    {{ formatPrice(pkg.price || calculatePackageTotal(pkg)) }}
                  </span>
                </div>
              </div>
              <div v-if="pkg.discount_rate > 0" 
                   class="flex items-center justify-between mt-1">
                <span class="text-sm text-green-600">İndirim Oranı</span>
                <span class="text-sm font-medium text-green-600">
                  %{{ pkg.discount_rate }}
                </span>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <button @click="addPackageToCart(pkg)"
                    class="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              <i class="fas fa-shopping-cart mr-2"></i>
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New/Edit Package Modal -->
    <Modal v-if="showPackageModal" @close="closePackageModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-box-open text-indigo-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingPackage ? 'Paketi Düzenle' : 'Yeni Paket' }}
          </h3>
        </div>
      </template>

      <template #body>
        <form @submit.prevent="savePackage" class="space-y-6">
          <!-- Package Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Paket Adı
            </label>
            <input type="text"
                   v-model="packageForm.name"
                   class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <!-- Package Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              v-model="packageForm.description"
              rows="3"
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Paket açıklaması..."></textarea>
          </div>

          <!-- Package Price -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Paket Fiyatı (TL)
            </label>
            <div class="relative">
              <input type="number"
                     v-model="packageForm.price"
                     min="0"
                     step="0.01"
                     class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">TL</span>
              </div>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Boş bırakırsanız ürünlerin toplam fiyatı kullanılacaktır
            </p>
            <div v-if="showDiscountInfo" class="mt-2 p-3 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm text-green-700">Ürünlerin Toplam Fiyatı:</span>
                <span class="font-medium text-green-700">{{ formatPrice(calculateFormTotal()) }}</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-sm text-green-700">İndirim Oranı:</span>
                <span class="font-medium text-green-700">%{{ calculatedDiscountRate }}</span>
              </div>
            </div>
          </div>

          <!-- Product Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ürünler
            </label>
            <div class="relative">
              <input type="text"
                     v-model="productSearch"
                     placeholder="Ürün ara..."
                     class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              
              <!-- Product Suggestions -->
              <div v-if="filteredProducts.length > 0"
                   class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                <div class="py-1">
                  <button v-for="product in filteredProducts"
                          :key="product.id"
                          @click="addProductToPackage(product)"
                          class="w-full px-4 py-2 text-left hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img v-if="product.media?.[0]?.url" 
                             :src="product.media[0].url" 
                             :alt="product.name"
                             class="w-full h-full object-cover rounded-lg" />
                        <i v-else class="fas fa-box text-gray-400"></i>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ product.name }}</div>
                        <div class="text-sm text-gray-500">
                          Stok: {{ product.stock }} • {{ formatPrice(product.price) }}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Products -->
          <div v-if="packageForm.items.length > 0" class="space-y-3">
            <div v-for="(item, index) in packageForm.items" 
                 :key="item.product.id"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img v-if="item.product.media?.[0]?.url" 
                       :src="item.product.media[0].url" 
                       :alt="item.product.name"
                       class="w-full h-full object-cover rounded-lg" />
                  <i v-else class="fas fa-box text-gray-400"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ item.product.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatPrice(item.product.price) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                  <button type="button"
                          @click="decrementItemQuantity(index)"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                    <i class="fas fa-minus text-gray-600 text-sm"></i>
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button type="button"
                          @click="incrementItemQuantity(index)"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                    <i class="fas fa-plus text-gray-600 text-sm"></i>
                  </button>
                </div>
                <button type="button"
                        @click="removeItemFromPackage(index)"
                        class="text-red-600 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Package Total -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Toplam Tutar</span>
                <div class="text-right">
                  <span v-if="packageForm.discount_rate > 0" 
                        class="text-sm line-through text-gray-400 block">
                    {{ formatPrice(calculateFormTotal()) }}
                  </span>
                  <span class="text-lg font-bold text-gray-900">
                    {{ formatPrice(calculateFormDiscountedTotal()) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button type="button"
                  @click="closePackageModal"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
            İptal
          </button>
          <button type="button"
                  @click="savePackage"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            {{ editingPackage ? 'Güncelle' : 'Kaydet' }}
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
          <h3 class="text-xl font-bold text-gray-900">Paketi Sil</h3>
        </div>
      </template>

      <template #body>
        <p class="text-gray-600">
          <span class="font-medium text-gray-900">"{{ packageToDelete?.name }}"</span> paketini silmek istediğinizden emin misiniz?
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button type="button"
                  @click="closeDeleteModal"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
            İptal
          </button>
          <button type="button"
                  @click="confirmDelete"
                  class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
            Sil
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'

const store = useStore()
const toast = useToast()

// State
const packages = ref([])
const showPackageModal = ref(false)
const showDeleteModal = ref(false)
const editingPackage = ref(null)
const packageToDelete = ref(null)
const productSearch = ref('')
const products = ref([])

// Package Form
const packageForm = ref({
  name: '',
  description: '',
  price: null,
  items: []
})

// Computed
const filteredProducts = computed(() => {
  if (!productSearch.value) return []
  return products.value.filter(product => 
    product.name.toLowerCase().includes(productSearch.value.toLowerCase()) &&
    !packageForm.value.items.some(item => item.product.id === product.id)
  )
})

// Computed property for showing discount info
const showDiscountInfo = computed(() => {
  const total = calculateFormTotal()
  return packageForm.value.price && packageForm.value.price < total && total > 0
})

// Computed property for calculated discount rate
const calculatedDiscountRate = computed(() => {
  const total = calculateFormTotal()
  if (packageForm.value.price && packageForm.value.price < total && total > 0) {
    return Math.round(((total - packageForm.value.price) / total) * 100)
  }
  return 0
})

// Methods
const loadPackages = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        items:package_products (
          id,
          quantity,
          product:products (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    packages.value = data
  } catch (error) {
    console.error('Error loading packages:', error)
    toast.error('Paketler yüklenirken bir hata oluştu')
  }
}

const loadProducts = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        media:product_images(*)
      `)
      .eq('user_id', user.id)
      .gt('stock', 0)
      .order('name')

    if (error) throw error
    products.value = data
  } catch (error) {
    console.error('Error loading products:', error)
    toast.error('Ürünler yüklenirken bir hata oluştu')
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const calculatePackageTotal = (pkg) => {
  return pkg.price || pkg.items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  )
}

const calculateDiscountedTotal = (pkg) => {
  const total = pkg.items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  )
  return pkg.price || total // Eğer paket fiyatı varsa onu kullan, yoksa toplam fiyatı kullan
}

const calculateFormTotal = () => {
  return packageForm.value.items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  )
}

const calculateFormDiscountedTotal = () => {
  return packageForm.value.price || calculateFormTotal() // Eğer paket fiyatı varsa onu kullan, yoksa toplam fiyatı kullan
}

const calculateDiscountPercentage = (pkg) => {
  const total = calculatePackageTotal(pkg)
  if (pkg.price && pkg.price < total) {
    return Math.round(((total - pkg.price) / total) * 100)
  }
  return 0
}

const openNewPackageModal = () => {
  editingPackage.value = null
  packageForm.value = {
    name: '',
    description: '',
    price: null,
    items: []
  }
  showPackageModal.value = true
}

const editPackage = (pkg) => {
  editingPackage.value = pkg
  packageForm.value = {
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    items: [...pkg.items]
  }
  showPackageModal.value = true
}

const closePackageModal = () => {
  showPackageModal.value = false
  editingPackage.value = null
  packageForm.value = {
    name: '',
    description: '',
    price: null,
    items: []
  }
  productSearch.value = ''
}

const addProductToPackage = (product) => {
  packageForm.value.items.push({
    product,
    quantity: 1
  })
  productSearch.value = ''
}

const removeItemFromPackage = (index) => {
  packageForm.value.items.splice(index, 1)
}

const incrementItemQuantity = (index) => {
  const item = packageForm.value.items[index]
  if (item.quantity < item.product.stock) {
    item.quantity++
  }
}

const decrementItemQuantity = (index) => {
  const item = packageForm.value.items[index]
  if (item.quantity > 1) {
    item.quantity--
  }
}

const savePackage = async () => {
  try {
    if (!packageForm.value.name) {
      toast.warning('Lütfen paket adı girin')
      return
    }

    if (packageForm.value.items.length === 0) {
      toast.warning('Lütfen pakete ürün ekleyin')
      return
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    // Ürünlerin toplam fiyatını hesapla
    const totalProductsPrice = calculateFormTotal()

    // İndirim oranını hesapla
    const discountRate = calculatedDiscountRate.value

    if (editingPackage.value) {
      // Update package
      const { error: packageError } = await supabase
        .from('packages')
        .update({
          name: packageForm.value.name,
          description: packageForm.value.description,
          price: packageForm.value.price || totalProductsPrice,
          discount_rate: discountRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPackage.value.id)

      if (packageError) throw packageError

      // Delete old items
      const { error: deleteError } = await supabase
        .from('package_products')
        .delete()
        .eq('package_id', editingPackage.value.id)

      if (deleteError) throw deleteError
    } else {
      // Create new package
      const { data: newPackage, error: packageError } = await supabase
        .from('packages')
        .insert({
          user_id: user.id,
          name: packageForm.value.name,
          description: packageForm.value.description,
          price: packageForm.value.price || totalProductsPrice,
          discount_rate: discountRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (packageError) throw packageError

      editingPackage.value = newPackage
    }

    // Insert package items
    const { error: itemsError } = await supabase
      .from('package_products')
      .insert(
        packageForm.value.items.map(item => ({
          package_id: editingPackage.value.id,
          product_id: item.product.id,
          quantity: item.quantity
        }))
      )

    if (itemsError) throw itemsError

    toast.success(editingPackage.value ? 'Paket güncellendi' : 'Paket oluşturuldu')
    closePackageModal()
    loadPackages()
  } catch (error) {
    console.error('Error saving package:', error)
    toast.error('Paket kaydedilirken bir hata oluştu')
  }
}

const deletePackage = (pkg) => {
  packageToDelete.value = pkg
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  packageToDelete.value = null
}

const confirmDelete = async () => {
  try {
    // Önce paket ürünlerini sil
    const { error: productsError } = await supabase
      .from('package_products')
      .delete()
      .eq('package_id', packageToDelete.value.id)

    if (productsError) throw productsError

    // Sonra paketi sil
    const { error: packageError } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageToDelete.value.id)

    if (packageError) throw packageError

    toast.success('Paket silindi')
    closeDeleteModal()
    loadPackages()
  } catch (error) {
    console.error('Error deleting package:', error)
    toast.error('Paket silinirken bir hata oluştu')
  }
}

const addPackageToCart = async (pkg) => {
  try {
    // Check stock availability
    for (const item of pkg.items) {
      if (item.quantity > item.product.stock) {
        toast.error(`${item.product.name} için yeterli stok yok`)
        return
      }
    }

    // Paketi tek bir ürün olarak sepete ekle
    store.dispatch('cart/addToCart', {
      type: 'package',
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      quantity: 1,
      package: pkg,
      items: pkg.items.map(item => ({
        ...item,
        original_price: item.product.price,
        product: item.product
      }))
    })

    toast.success('Paket sepete eklendi')
  } catch (error) {
    console.error('Error adding package to cart:', error)
    toast.error('Paket sepete eklenirken bir hata oluştu')
  }
}

// Load initial data
loadPackages()
loadProducts()
</script> 