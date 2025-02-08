<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ürün Görselleri</h1>
        <p class="mt-1 text-sm text-gray-500">Ürün görsellerini yükleyin ve yönetin</p>
      </div>
      <button
        @click="showUploadModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <i class="fas fa-upload mr-2"></i>
        Görsel Yükle
      </button>
    </div>

    <!-- Filtreler -->
    <div class="mb-6 bg-white rounded-xl shadow-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Arama
          </label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Ürün adı ara..."
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            v-model="filters.status"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tümü</option>
            <option value="matched">Eşleşmiş</option>
            <option value="unmatched">Eşleşmemiş</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sıralama
          </label>
          <select
            v-model="filters.sort"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="name">Ürün Adı</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Görsel Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="image in filteredImages" :key="image.id" 
           class="bg-white rounded-xl shadow-lg overflow-hidden group">
        <!-- Görsel Önizleme -->
        <div class="relative aspect-w-4 aspect-h-3">
          <img 
            :src="image.image_url" 
            :alt="image.product_name"
            class="object-cover w-full h-full"
          >
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                @click="editImage(image)"
                class="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 mx-1"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click="deleteImage(image)"
                class="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 mx-1"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Görsel Bilgileri -->
        <div class="p-4">
          <h3 class="text-sm font-medium text-gray-900 truncate">
            {{ image.product_name }}
          </h3>
          <div class="mt-1 flex items-center">
            <span :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              image.status === 'matched' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            ]">
              {{ image.status === 'matched' ? 'Eşleşmiş' : 'Eşleşmemiş' }}
            </span>
            <span v-if="image.is_primary" 
                  class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              Ana Görsel
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Yükleme Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <div class="absolute top-4 right-4">
            <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <h3 class="text-lg font-medium text-gray-900 mb-4">Görsel Yükle</h3>
          
          <!-- Dosya Yükleme Alanı -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Görseller
            </label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div class="space-y-1 text-center">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label
                    class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Dosya Seç</span>
                    <input 
                      type="file" 
                      class="sr-only" 
                      multiple 
                      accept="image/*"
                      @change="handleFileUpload"
                    >
                  </label>
                  <p class="pl-1">veya sürükle bırak</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF max 10MB</p>
              </div>
            </div>
          </div>

          <!-- Seçilen Dosyalar -->
          <div v-if="selectedFiles.length > 0" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Seçilen Dosyalar</h4>
            <ul class="space-y-2">
              <li v-for="(file, index) in selectedFiles" :key="index" 
                  class="flex items-center justify-between text-sm">
                <span class="truncate">{{ file.name }}</span>
                <button @click="removeFile(index)" class="text-red-600 hover:text-red-700">
                  <i class="fas fa-times"></i>
                </button>
              </li>
            </ul>
          </div>

          <!-- Ürün Adı -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ürün Adı
            </label>
            <input
              type="text"
              v-model="uploadForm.productName"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ürün adını girin"
            >
            <p class="mt-1 text-xs text-gray-500">
              Bu isim, ürünlerle otomatik eşleştirme için kullanılacak
            </p>
          </div>

          <!-- Açıklama -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              v-model="uploadForm.description"
              rows="3"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Görsel hakkında açıklama girin"
            ></textarea>
          </div>

          <!-- Butonlar -->
          <div class="flex justify-end space-x-3">
            <button
              @click="showUploadModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              @click="uploadImages"
              :disabled="isUploading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <i v-if="isUploading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isUploading ? 'Yükleniyor...' : 'Yükle' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'

export default {
  name: 'ProductImages',
  setup() {
    const toast = useToast()
    const showUploadModal = ref(false)
    const isUploading = ref(false)
    const images = ref([])
    const selectedFiles = ref([])
    
    const filters = ref({
      search: '',
      status: '',
      sort: 'newest'
    })

    const uploadForm = ref({
      productName: '',
      description: ''
    })

    // Filtrelenmiş görseller
    const filteredImages = computed(() => {
      let filtered = [...images.value]

      // Arama filtresi
      if (filters.value.search) {
        filtered = filtered.filter(image => 
          image.product_name.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }

      // Durum filtresi
      if (filters.value.status) {
        filtered = filtered.filter(image => image.status === filters.value.status)
      }

      // Sıralama
      switch (filters.value.sort) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'oldest':
          filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'name':
          filtered.sort((a, b) => a.product_name.localeCompare(b.product_name))
          break
      }

      return filtered
    })

    // Görselleri yükle
    const loadImages = async () => {
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        images.value = data
      } catch (error) {
        console.error('Error loading images:', error)
        toast.error('Görseller yüklenirken bir hata oluştu')
      }
    }

    // Dosya seçimi
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      selectedFiles.value = files
    }

    // Dosya kaldır
    const removeFile = (index) => {
      selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
    }

    // Görselleri yükle
    const uploadImages = async () => {
      if (!uploadForm.value.productName) {
        toast.error('Lütfen ürün adı girin')
        return
      }

      if (selectedFiles.value.length === 0) {
        toast.error('Lütfen görsel seçin')
        return
      }

      try {
        isUploading.value = true

        for (const file of selectedFiles.value) {
          // Dosya adını unique yap
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `product-images/${fileName}`

          // Storage'a yükle
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          // URL al
          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath)

          // Veritabanına kaydet
          const { error: dbError } = await supabase
            .from('product_images')
            .insert({
              product_name: uploadForm.value.productName,
              image_url: publicUrl,
              description: uploadForm.value.description,
              status: 'unmatched'
            })

          if (dbError) throw dbError
        }

        toast.success('Görseller başarıyla yüklendi')
        showUploadModal.value = false
        uploadForm.value = { productName: '', description: '' }
        selectedFiles.value = []
        loadImages()
      } catch (error) {
        console.error('Error uploading images:', error)
        toast.error('Görseller yüklenirken bir hata oluştu')
      } finally {
        isUploading.value = false
      }
    }

    // Görsel düzenle
    const editImage = async (image) => {
      // TODO: Düzenleme modalı eklenecek
    }

    // Görsel sil
    const deleteImage = async (image) => {
      if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) return

      try {
        // Önce storage'dan sil
        const imagePath = image.image_url.split('/').pop()
        const { error: storageError } = await supabase.storage
          .from('products')
          .remove([`product-images/${imagePath}`])

        if (storageError) throw storageError

        // Veritabanından sil
        const { error: dbError } = await supabase
          .from('product_images')
          .delete()
          .eq('id', image.id)

        if (dbError) throw dbError

        toast.success('Görsel başarıyla silindi')
        loadImages()
      } catch (error) {
        console.error('Error deleting image:', error)
        toast.error('Görsel silinirken bir hata oluştu')
      }
    }

    onMounted(() => {
      loadImages()
    })

    return {
      showUploadModal,
      isUploading,
      filters,
      uploadForm,
      selectedFiles,
      filteredImages,
      handleFileUpload,
      removeFile,
      uploadImages,
      editImage,
      deleteImage
    }
  }
}
</script>

<style scoped>
.aspect-w-4 {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
}

.aspect-h-3 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style> 