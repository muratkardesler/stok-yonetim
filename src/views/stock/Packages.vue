<template>
  <div>
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
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

      <!-- Packages Grid -->
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

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Paket Sil</h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">
            <span class="font-medium text-gray-900">"{{ itemToDelete?.name }}"</span> paketini silmek istediğinizden emin misiniz?
            <br>
            <span class="text-red-600 text-sm mt-2 block">
              Bu işlem geri alınamaz.
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
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Packages',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const packages = ref([])
    const categories = ref([])
    const products = ref([])
    const showAddPackageModal = ref(false)
    const editingPackage = ref(null)
    const showDeleteModal = ref(false)
    const itemToDelete = ref(null)

    const packageForm = ref({
      name: '',
      description: '',
      price: 0,
      products: []
    })

    // Load data
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

    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        
        if (error) throw error
        categories.value = data
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Kategoriler yüklenirken bir hata oluştu')
      }
    }

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

    // Computed properties
    const mainCategories = computed(() => {
      return categories.value.filter(cat => !cat.parent_id)
    })

    // Helper functions
    const getSubCategories = (parentId) => {
      return categories.value.filter(cat => cat.parent_id === parentId)
    }

    const getProductsByCategory = (categoryId) => {
      return products.value.filter(product => product.category_id === categoryId)
    }

    const getCategoryName = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      return category ? category.name : ''
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

    const formatPrice = (price) => {
      return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    // Package operations
    const addProductToPackage = () => {
      packageForm.value.products.push({
        product_id: '',
        quantity: 1
      })
    }

    const removeProductFromPackage = (index) => {
      packageForm.value.products.splice(index, 1)
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

    // Modal operations
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

    const editPackage = (packageItem) => {
      editingPackage.value = packageItem
      packageForm.value = {
        name: packageItem.name,
        description: packageItem.description,
        price: packageItem.price,
        products: packageItem.products.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      }
      showAddPackageModal.value = true
    }

    const deletePackage = (packageItem) => {
      itemToDelete.value = packageItem
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      itemToDelete.value = null
    }

    // Save operations
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

          // Delete old products
          const { error: deleteError } = await supabase
            .from('package_products')
            .delete()
            .eq('package_id', editingPackage.value.id)

          if (deleteError) throw deleteError

          // Insert new products
          const { error: productsError } = await supabase
            .from('package_products')
            .insert(
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

    const confirmDelete = async () => {
      try {
        // Delete package products first
        const { error: productsError } = await supabase
          .from('package_products')
          .delete()
          .eq('package_id', itemToDelete.value.id)

        if (productsError) throw productsError

        // Delete package
        const { error: packageError } = await supabase
          .from('packages')
          .delete()
          .eq('id', itemToDelete.value.id)

        if (packageError) throw packageError
        
        toast.success('Paket başarıyla silindi')
        loadPackages()
        closeDeleteModal()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Paket silinirken bir hata oluştu')
      }
    }

    // Watch total price changes
    watch(
      () => packageForm.value.products,
      () => {
        const totalPrice = packageForm.value.products.reduce((total, item) => {
          const product = products.value.find(p => p.id === item.product_id)
          return total + (product ? product.price * item.quantity : 0)
        }, 0)
        packageForm.value.price = totalPrice
      },
      { deep: true }
    )

    onMounted(() => {
      loadPackages()
      loadCategories()
      loadProducts()
    })

    return {
      packages,
      categories,
      products,
      showAddPackageModal,
      packageForm,
      editingPackage,
      showDeleteModal,
      itemToDelete,
      mainCategories,
      getSubCategories,
      getProductsByCategory,
      getCategoryName,
      getCategoryBgColor,
      getCategoryTextColor,
      formatPrice,
      addProductToPackage,
      removeProductFromPackage,
      calculatePackageOriginalPrice,
      calculateDiscountPercentage,
      closeAddPackageModal,
      editPackage,
      deletePackage,
      closeDeleteModal,
      savePackage,
      confirmDelete
    }
  }
}
</script> 