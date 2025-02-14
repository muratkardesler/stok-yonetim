<template>
  <div>
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <i class="fas fa-folder-tree text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Kategoriler</h2>
              <p class="text-sm text-gray-500 mt-0.5">Ürün kategorilerinizi buradan yönetin</p>
            </div>
          </div>
          <button @click="showAddCategoryModal = true" 
                  class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group">
            <i class="fas fa-plus mr-2 group-hover:scale-110 transition-transform"></i>
            <span>Yeni Kategori</span>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="p-4 border-b border-gray-100 bg-gray-50/50">
        <div class="relative">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Kategori ara..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        <div v-for="(mainCategory, index) in mainCategories" :key="mainCategory.id" 
             class="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <!-- Category Header -->
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
                <button @click.stop="openAddSubCategory(mainCategory)" 
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

          <!-- Sub Categories -->
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

        <!-- New Category Card -->
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
    </div>

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
        <form @submit.prevent="handleAddCategory" class="space-y-6">
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
          <button @click="handleAddCategory" 
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors">
            {{ editingCategory ? 'Güncelle' : 'Kaydet' }}
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
          <h3 class="text-xl font-bold text-gray-900">Kategori Sil</h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">
            <span class="font-medium text-gray-900">"{{ itemToDelete?.name }}"</span> kategorisini silmek istediğinizden emin misiniz?
            <br>
            <span class="text-red-600 text-sm mt-2 block">
              Bu işlem geri alınamaz ve kategoriye ait tüm ürünler de silinecektir.
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Categories',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const categories = ref([])
    const searchQuery = ref('')
    const showAddCategoryModal = ref(false)
    const editingCategory = ref(null)
    const showDeleteModal = ref(false)
    const itemToDelete = ref(null)
    const expandedCategories = ref({})
    const loading = ref(false)

    const categoryForm = ref({
      name: '',
      parent_id: null
    })

    // Load data
    const loadCategories = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Kullanıcı bulunamadı')

        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (!profile?.company_id) throw new Error('Şirket bilgisi bulunamadı')

        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            products:products(*)
          `)
          .eq('company_id', profile.company_id)
          .order('name')
        
        if (error) throw error
        categories.value = data || []
        
        // Initialize expanded state
        const initialState = {}
        data?.forEach(category => {
          initialState[category.id] = false
        })
        expandedCategories.value = initialState
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Kategoriler yüklenirken bir hata oluştu')
      }
    }

    // Computed properties
    const mainCategories = computed(() => {
      return categories.value.filter(cat => !cat.parent_id)
    })

    // Helper functions
    const toggleCategory = (categoryId) => {
      expandedCategories.value[categoryId] = !expandedCategories.value[categoryId]
    }

    const isExpandedCategory = (categoryId) => {
      return !!expandedCategories.value[categoryId]
    }

    const getCategoryChevronIcon = (categoryId) => {
      return expandedCategories.value[categoryId] ? 'fa-chevron-up' : 'fa-chevron-down'
    }

    const getSubCategories = (parentId) => {
      return categories.value.filter(cat => cat.parent_id === parentId)
    }

    const getCategoryProductCount = (categoryId) => {
      const category = categories.value.find(cat => cat.id === categoryId)
      return category?.products?.length || 0
    }

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

    // Modal operations
    const closeAddCategoryModal = () => {
      showAddCategoryModal.value = false
      editingCategory.value = null
      categoryForm.value = { name: '', parent_id: null }
    }

    const editCategory = (category) => {
      editingCategory.value = category
      categoryForm.value = {
        name: category.name,
        parent_id: category.parent_id
      }
      showAddCategoryModal.value = true
    }

    const openAddSubCategory = (parentCategory) => {
      categoryForm.value.parent_id = parentCategory.id
      showAddCategoryModal.value = true
    }

    const deleteCategory = (category) => {
      itemToDelete.value = category
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      itemToDelete.value = null
    }

    // Save operations
    const handleAddCategory = async () => {
      try {
        loading.value = true

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Kullanıcı bulunamadı')

        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (!profile?.company_id) throw new Error('Şirket bilgisi bulunamadı')

        if (editingCategory.value) {
          // Kategori güncelleme
          const { error } = await supabase
            .from('categories')
            .update({
              name: categoryForm.value.name,
              parent_id: categoryForm.value.parent_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingCategory.value.id)
            .eq('company_id', profile.company_id)

          if (error) throw error
          toast.success('Kategori güncellendi')
        } else {
          // Yeni kategori ekleme
          const { error } = await supabase
            .from('categories')
            .insert([{
              name: categoryForm.value.name,
              parent_id: categoryForm.value.parent_id,
              company_id: profile.company_id
            }])

          if (error) throw error
          toast.success('Kategori eklendi')
        }

        await loadCategories()
        closeAddCategoryModal()
      } catch (error) {
        console.error('Kategori işlemi hatası:', error)
        toast.error('Kategori işlemi sırasında bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    const confirmDelete = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Kullanıcı bulunamadı')

        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (!profile?.company_id) throw new Error('Şirket bilgisi bulunamadı')

        // Önce kategorideki tüm ürünleri sil
        const { error: productsError } = await supabase
          .from('products')
          .delete()
          .eq('category_id', itemToDelete.value.id)
          .eq('company_id', profile.company_id)

        if (productsError) throw productsError

        // Sonra kategoriyi sil
        const { error: categoryError } = await supabase
          .from('categories')
          .delete()
          .eq('id', itemToDelete.value.id)
          .eq('company_id', profile.company_id)

        if (categoryError) throw categoryError
        
        toast.success('Kategori ve ilgili tüm ürünler başarıyla silindi')
        loadCategories()
        closeDeleteModal()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Kategori silinirken bir hata oluştu')
      }
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      categories,
      searchQuery,
      showAddCategoryModal,
      categoryForm,
      editingCategory,
      showDeleteModal,
      itemToDelete,
      expandedCategories,
      mainCategories,
      toggleCategory,
      isExpandedCategory,
      getCategoryChevronIcon,
      getSubCategories,
      getCategoryProductCount,
      getTotalProductCount,
      getCategoryHeaderColor,
      getCategoryBgColor,
      getCategoryTextColor,
      getCategoryButtonStyle,
      closeAddCategoryModal,
      editCategory,
      openAddSubCategory,
      deleteCategory,
      closeDeleteModal,
      handleAddCategory,
      confirmDelete
    }
  }
}
</script> 