<template>
  <div>
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <i class="fas fa-images text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Ürün Medya</h2>
              <p class="text-sm text-gray-500 mt-0.5">Ürün görselleri ve medya dosyalarını yönetin</p>
            </div>
          </div>
          <button @click="showUploadModal = true" 
                  class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group">
            <i class="fas fa-upload mr-2 group-hover:scale-110 transition-transform"></i>
            <span>Medya Yükle</span>
          </button>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="p-4 border-b border-gray-100 bg-gray-50/50">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Ürün adı ile ara..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div class="sm:w-64">
            <select 
              v-model="statusFilter"
              class="w-full py-2 pl-3 pr-10 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="matched">Eşleşmiş</option>
              <option value="unmatched">Eşleşmemiş</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Media Grid -->
      <div class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <!-- Skeleton Loading -->
          <template v-if="loading">
            <div v-for="n in 8" :key="n"
                 class="bg-white rounded-xl border border-gray-200 shadow-sm p-3 animate-pulse">
              <div class="aspect-square rounded-lg bg-gray-100 mb-3">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-wave"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </template>

          <!-- Actual Product Cards -->
          <template v-else>
            <div v-for="product in groupedImages" :key="product.name"
                 class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
              <!-- Main Image Section -->
              <div class="relative aspect-square cursor-pointer group"
                   @click="openLightbox(product.images[currentImageIndexes[product.name] || 0])">
                <img :src="product.images[currentImageIndexes[product.name] || 0].image_url" 
                     :alt="product.name"
                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                
                <!-- Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div class="absolute top-2 right-2">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      product.status === 'matched' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    ]">
                      {{ product.status === 'matched' ? 'Eşleşti' : 'Eşleşmedi' }}
                    </span>
                  </div>
                </div>

                <!-- Primary Badge -->
                <div v-if="product.images[currentImageIndexes[product.name] || 0].is_primary"
                     class="absolute top-2 left-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full border border-indigo-200">
                  Ana Görsel
                </div>
              </div>

              <!-- Thumbnails Section -->
              <div class="p-4">
                <h3 class="font-medium text-gray-900 mb-2">{{ product.name }}</h3>
                
                <!-- Thumbnail Navigation -->
                <div class="flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-hide">
                  <div v-for="(image, index) in product.images" 
                       :key="image.id"
                       @click="currentImageIndexes[product.name] = index"
                       class="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200"
                       :class="currentImageIndexes[product.name] === index ? 'border-indigo-500' : 'border-transparent'">
                    <img :src="image.image_url" 
                         :alt="product.name"
                         class="w-full h-full object-cover">
                    
                    <!-- Primary Indicator -->
                    <div v-if="image.is_primary"
                         class="absolute bottom-0 inset-x-0 bg-indigo-500 py-0.5">
                      <div class="text-[10px] text-white text-center">Ana Görsel</div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end space-x-2 mt-3 border-t pt-3">
                  <button @click="editImage(product.images[currentImageIndexes[product.name] || 0])"
                          class="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="togglePrimary(product.images[currentImageIndexes[product.name] || 0])"
                          class="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                    <i class="fas fa-star" :class="product.images[currentImageIndexes[product.name] || 0].is_primary ? 'text-yellow-400' : ''"></i>
                  </button>
                  <button @click="deleteImage(product.images[currentImageIndexes[product.name] || 0])"
                          class="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload Card -->
            <div @click="showUploadModal = true"
                 class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all duration-300">
              <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-upload text-3xl text-indigo-600"></i>
              </div>
              <div class="text-center">
                <p class="text-xl font-semibold text-gray-900">Yeni Medya</p>
                <p class="text-sm text-gray-500 mt-2">PNG, JPG, WEBP</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Modal v-if="showUploadModal" @close="closeUploadModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-upload text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Medya Yükle</h3>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="uploadImages" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
            <input
              type="text"
              v-model="uploadForm.product_name"
              required
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Ürün adını girin">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              v-model="uploadForm.description"
              rows="2"
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Açıklama girin (opsiyonel)"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dosya</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl"
                 :class="isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'">
              <div class="space-y-1 text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Dosya Seç</span>
                    <input id="file-upload" 
                           type="file" 
                           class="sr-only"
                           accept="image/*"
                           @change="handleFileSelect"
                           multiple>
                  </label>
                  <p class="pl-1">veya sürükleyip bırakın</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, WEBP (max. 2MB)</p>
              </div>
            </div>
          </div>

          <div v-if="selectedFiles.length > 0" class="space-y-2">
            <div v-for="(file, index) in selectedFiles" :key="index"
                 class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <i class="fas fa-image text-gray-400"></i>
                <span class="text-sm text-gray-900">{{ file.name }}</span>
                <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
              </div>
              <button type="button" @click="removeFile(index)"
                      class="p-1 text-gray-400 hover:text-red-500">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeUploadModal" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            İptal
          </button>
          <button @click="uploadImages" 
                  :disabled="!canUpload"
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Yükle
          </button>
        </div>
      </template>
    </Modal>

    <!-- Edit Modal -->
    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-edit text-white text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Medya Düzenle</h3>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="saveEdit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
            <input
              type="text"
              v-model="editForm.product_name"
              required
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Ürün adını girin">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              v-model="editForm.description"
              rows="2"
              class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Açıklama girin (opsiyonel)"></textarea>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="editForm.is_primary"
              id="is_primary"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            <label for="is_primary" class="ml-2 text-sm text-gray-700">Ana görsel olarak ayarla</label>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeEditModal" 
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            İptal
          </button>
          <button @click="saveEdit" 
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-colors">
            Kaydet
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
          <h3 class="text-xl font-bold text-gray-900">Medya Sil</h3>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">
            <span class="font-medium text-gray-900">"{{ itemToDelete?.product_name }}"</span> ürününe ait görseli silmek istediğinizden emin misiniz?
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

    <!-- Lightbox Modal -->
    <Modal v-if="showLightbox" @close="closeLightbox" :fullscreen="true">
      <template #body>
        <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button @click="closeLightbox" 
                  class="absolute top-4 right-4 text-white/70 hover:text-white p-2">
            <i class="fas fa-times text-xl"></i>
          </button>
          
          <div class="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <!-- Navigation Buttons -->
            <button v-if="currentImageIndex > 0"
                    @click.stop="previousImage" 
                    class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 text-white/70 hover:text-white">
              <i class="fas fa-chevron-left text-2xl"></i>
            </button>
            
            <button v-if="currentImageIndex < filteredImages.length - 1"
                    @click.stop="nextImage" 
                    class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 text-white/70 hover:text-white">
              <i class="fas fa-chevron-right text-2xl"></i>
            </button>

            <!-- Image -->
            <img :src="currentImage?.image_url" 
                 :alt="currentImage?.product_name"
                 class="w-full h-full object-contain">

            <!-- Image Info -->
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h3 class="text-white font-medium">{{ currentImage?.product_name }}</h3>
              <p class="text-white/70 text-sm mt-1">{{ currentImage?.description }}</p>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Modal from '@/components/Modal.vue'
import { useToast } from 'vue-toastification'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'ProductMedia',
  components: {
    Modal
  },
  setup() {
    const toast = useToast()
    const images = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const showUploadModal = ref(false)
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)
    const itemToDelete = ref(null)
    const isDragging = ref(false)
    const selectedFiles = ref([])

    const uploadForm = ref({
      product_name: '',
      description: '',
      files: []
    })

    const editForm = ref({
      id: null,
      product_name: '',
      description: '',
      is_primary: false
    })

    // Loading state
    const loading = ref(true)

    // Lightbox state
    const showLightbox = ref(false)
    const currentImage = ref(null)
    const currentImageIndex = ref(0)

    // Add new refs
    const currentImageIndexes = ref({})
    
    // Add computed property for grouped images
    const groupedImages = computed(() => {
      const groups = {}
      
      filteredImages.value.forEach(image => {
        if (!groups[image.product_name]) {
          groups[image.product_name] = {
            name: image.product_name,
            status: image.status,
            images: []
          }
        }
        groups[image.product_name].images.push(image)
      })
      
      return Object.values(groups)
    })

    // Load data
    const loadImages = async () => {
      loading.value = true
      try {
        // Önce kullanıcı ve şirket bilgilerini al
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        // Tüm görselleri çek
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false })
        
        if (imageError) throw imageError

        // Tüm ürünleri çek
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('company_id', profile.company_id)

        if (productsError) throw productsError

        // Her görsel için eşleşme durumunu kontrol et
        const processedImages = imageData.map(image => {
          const matchingProduct = products.find(p => p.name === image.product_name)
          return {
            ...image,
            status: matchingProduct ? 'matched' : 'unmatched',
            matched_product: matchingProduct || null
          }
        })

        // Her ürün için primary image kontrolü yap
        for (const product of products) {
          // Ürünün eşleşen görsellerini bul
          const matchingImages = processedImages.filter(img => 
            img.product_name === product.name && img.status === 'matched'
          )

          if (matchingImages.length > 0) {
            // Primary olan görseli bul
            const primaryImage = matchingImages.find(img => img.is_primary)

            if (!primaryImage) {
              // Primary görsel yoksa ilk görseli primary yap
              const firstImage = matchingImages[0]
              await supabase
                .from('product_images')
                .update({ is_primary: true })
                .eq('id', firstImage.id)
                .eq('company_id', profile.company_id)

              // Ürünü güncelle
              await supabase
                .from('products')
                .update({ primary_image: firstImage.image_url })
                .eq('id', product.id)
                .eq('company_id', profile.company_id)

              firstImage.is_primary = true
            }
          }
        }

        // Tüm işlenmiş görselleri doğrudan ata
        images.value = processedImages

      } catch (error) {
        console.error('Error loading images:', error)
        toast.error('Görseller yüklenirken bir hata oluştu')
      } finally {
        loading.value = false
      }
    }

    // Computed properties
    const filteredImages = computed(() => {
      let filtered = images.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(image => 
          image.product_name.toLowerCase().includes(query)
        )
      }

      if (statusFilter.value) {
        filtered = filtered.filter(image => 
          image.status === statusFilter.value
        )
      }

      return filtered
    })

    const canUpload = computed(() => {
      return uploadForm.value.product_name && selectedFiles.value.length > 0
    })

    // Helper functions
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      selectedFiles.value.push(...files)
    }

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
    }

    const copyImageUrl = async (image) => {
      try {
        await navigator.clipboard.writeText(image.image_url)
        toast.success('URL kopyalandı')
      } catch (error) {
        console.error('Error copying URL:', error)
        toast.error('URL kopyalanırken bir hata oluştu')
      }
    }

    // Modal operations
    const closeUploadModal = () => {
      showUploadModal.value = false
      uploadForm.value = {
        product_name: '',
        description: '',
        files: []
      }
      selectedFiles.value = []
    }

    const editImage = (image) => {
      editForm.value = {
        id: image.id,
        product_name: image.product_name,
        description: image.description,
        is_primary: image.is_primary
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editForm.value = {
        id: null,
        product_name: '',
        description: '',
        is_primary: false
      }
    }

    const deleteImage = (image) => {
      itemToDelete.value = image
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      itemToDelete.value = null
    }

    // Toggle primary image
    const togglePrimary = async (image) => {
      try {
        // Önce ürünü bul
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('name', image.product_name)
          .eq('company_id', image.company_id)
          .single()

        if (productError) {
          toast.error('Ürün bulunamadı')
          return
        }

        if (!image.is_primary) {
          // Önce diğer görsellerin primary durumunu false yap
          await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_name', image.product_name)
            .eq('company_id', image.company_id)

          // Sonra seçili görseli primary yap
          await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', image.id)
            .eq('company_id', image.company_id)

          // En son ürünün primary_image'ini güncelle
          await supabase
            .from('products')
            .update({ primary_image: image.image_url })
            .eq('id', product.id)
            .eq('company_id', image.company_id)

          toast.success('Ana görsel olarak ayarlandı')
        } else {
          // Primary durumunu kaldır
          await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('id', image.id)
            .eq('company_id', image.company_id)

          // Ürünün primary_image'ini null yap
          await supabase
            .from('products')
            .update({ primary_image: null })
            .eq('id', product.id)
            .eq('company_id', image.company_id)

          toast.success('Ana görsel kaldırıldı')
        }

        // Görselleri yeniden yükle
        await loadImages()
      } catch (error) {
        console.error('Error toggling primary:', error)
        toast.error('İşlem sırasında bir hata oluştu')
        await loadImages()
      }
    }

    // Save operations
    const saveEdit = async () => {
      try {
        // If setting as primary, first remove primary from all other images of the same product
        if (editForm.value.is_primary) {
          const { error: updateError } = await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_name', editForm.value.product_name)
            .eq('company_id', editForm.value.company_id)
            .eq('is_primary', true)

          if (updateError) throw updateError
        }

        // Update the image
        const { data: image, error } = await supabase
          .from('product_images')
          .update({
            product_name: editForm.value.product_name,
            description: editForm.value.description,
            is_primary: editForm.value.is_primary
          })
          .eq('id', editForm.value.id)
          .eq('company_id', editForm.value.company_id)
          .select()
          .single()

        if (error) throw error

        // Find the product
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('name', editForm.value.product_name)
          .eq('company_id', editForm.value.company_id)
          .limit(1)

        if (productError) throw productError

        // Update product's primary image if exists
        if (products && products.length > 0) {
          const productId = products[0].id

          if (editForm.value.is_primary) {
            // Setting as primary, update product
            await supabase
              .from('products')
              .update({ primary_image: image.image_url })
              .eq('id', productId)
              .eq('company_id', editForm.value.company_id)
          } else {
            // If removing primary status, find another image
            const { data: otherImages } = await supabase
              .from('product_images')
              .select('*')
              .eq('product_name', editForm.value.product_name)
              .eq('company_id', editForm.value.company_id)
              .eq('is_primary', true)
              .limit(1)

            if (otherImages && otherImages.length > 0) {
              await supabase
                .from('products')
                .update({ primary_image: otherImages[0].image_url })
                .eq('id', productId)
                .eq('company_id', editForm.value.company_id)
            } else {
              // If no primary images, set to null
              await supabase
                .from('products')
                .update({ primary_image: null })
                .eq('id', productId)
                .eq('company_id', editForm.value.company_id)
            }
          }
        }
        
        toast.success('Görsel güncellendi')
        closeEditModal()
        loadImages()
      } catch (error) {
        console.error('Error saving image:', error)
        toast.error('Görsel kaydedilirken bir hata oluştu')
      }
    }

    // Delete operations
    const confirmDelete = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        
        // Get file path from URL
        const urlParts = itemToDelete.value.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `${profile.company_id}/${fileName}`

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove([filePath])

        if (storageError) {
          console.error('Storage delete error:', storageError)
          // Storage'dan silme hatası olsa bile veritabanından silmeye devam et
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('product_images')
          .delete()
          .eq('id', itemToDelete.value.id)
          .eq('company_id', profile.company_id) // Güvenlik için company kontrolü

        if (dbError) throw dbError
        
        toast.success('Görsel başarıyla silindi')
        loadImages()
        closeDeleteModal()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Görsel silinirken bir hata oluştu')
      }
    }

    const uploadImages = async () => {
      try {
        // Önce kullanıcı ve şirket bilgilerini al
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Kullanıcı bilgisi alınamadı')

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        if (!profile?.company_id) throw new Error('Şirket bilgisi bulunamadı')

        // Seçilen ürünü kontrol et
        let matchingProduct = null
        if (uploadForm.value.product_name) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('name', uploadForm.value.product_name)
            .eq('company_id', profile.company_id)
            .single()

          if (!productError) {
            matchingProduct = product
          }
        }

        let firstUploadedImage = null
        let shouldSetPrimary = true

        for (const file of selectedFiles.value) {
          try {
            // Dosya adını oluştur
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.company_id}/${uuidv4()}.${fileExt}`

            // Storage'a yükle
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) throw uploadError

            // Public URL al
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName)

            // Veritabanına kaydet
            const { data: savedImage, error: dbError } = await supabase
              .from('product_images')
              .insert({
                product_name: uploadForm.value.product_name,
                description: uploadForm.value.description,
                image_url: publicUrl,
                file_name: fileName,
                file_size: file.size,
                file_type: file.type,
                status: matchingProduct ? 'matched' : 'unmatched',
                is_primary: shouldSetPrimary,
                company_id: profile.company_id
              })
              .select()
              .single()

            if (dbError) throw dbError

            if (!firstUploadedImage) {
              firstUploadedImage = savedImage
            }

            // Eğer bu ilk görsel ise ve ürün varsa, primary_image'i güncelle
            if (shouldSetPrimary && matchingProduct && firstUploadedImage) {
              const { error: productError } = await supabase
                .from('products')
                .update({ primary_image: firstUploadedImage.image_url })
                .eq('id', matchingProduct.id)
                .eq('company_id', profile.company_id)

              if (productError) throw productError
              
              // Bir kere primary image atandıktan sonra diğer görseller için false yap
              shouldSetPrimary = false
            }

          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error)
            toast.error(`${file.name} yüklenirken hata oluştu: ${error.message}`)
            continue
          }
        }

        toast.success('Görseller başarıyla yüklendi')
        closeUploadModal()
        loadImages()
      } catch (error) {
        console.error('Error in upload process:', error)
        toast.error(`İşlem sırasında bir hata oluştu: ${error.message}`)
      }
    }

    // Lightbox functions
    const openLightbox = (image) => {
      currentImage.value = image
      currentImageIndex.value = filteredImages.value.findIndex(img => img.id === image.id)
      showLightbox.value = true
    }

    const closeLightbox = () => {
      showLightbox.value = false
      currentImage.value = null
    }

    const previousImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--
        currentImage.value = filteredImages.value[currentImageIndex.value]
      }
    }

    const nextImage = () => {
      if (currentImageIndex.value < filteredImages.value.length - 1) {
        currentImageIndex.value++
        currentImage.value = filteredImages.value[currentImageIndex.value]
      }
    }

    onMounted(() => {
      loadImages()
    })

    return {
      images,
      searchQuery,
      statusFilter,
      showUploadModal,
      showEditModal,
      showDeleteModal,
      itemToDelete,
      isDragging,
      selectedFiles,
      uploadForm,
      editForm,
      filteredImages,
      canUpload,
      formatFileSize,
      handleFileSelect,
      removeFile,
      copyImageUrl,
      closeUploadModal,
      editImage,
      closeEditModal,
      deleteImage,
      closeDeleteModal,
      togglePrimary,
      uploadImages,
      saveEdit,
      confirmDelete,
      loading,
      showLightbox,
      currentImage,
      currentImageIndex,
      openLightbox,
      closeLightbox,
      previousImage,
      nextImage,
      currentImageIndexes,
      groupedImages
    }
  }
}
</script>

<style scoped>
.skeleton-wave {
  animation: wave 1.5s infinite;
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  50%, 100% {
    transform: translateX(100%);
  }
}

/* Add styles for horizontal scrollbar hiding */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style> 