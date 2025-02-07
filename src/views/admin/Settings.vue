<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
      <p class="mt-1 text-sm text-gray-500">Uygulama ayarlarını ve sistem tercihlerini yönetin</p>
    </div>

    <!-- Ayarlar Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Lisans Ayarları -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          <i class="fas fa-key text-blue-600 mr-2"></i>
          Lisans Ayarları
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Varsayılan Deneme Süresi (Gün)
            </label>
            <input
              type="number"
              v-model="settings.defaultTrialDays"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="365"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Otomatik Lisans Yenileme
            </label>
            <div class="flex items-center">
              <input
                type="checkbox"
                v-model="settings.autoRenewLicense"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <span class="ml-2 text-sm text-gray-600">
                Süresi dolan lisansları otomatik yenile
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Ayarları -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          <i class="fas fa-envelope text-blue-600 mr-2"></i>
          Email Ayarları
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email Bildirimleri
            </label>
            <div class="space-y-2">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="settings.emailNotifications.newUser"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-600">
                  Yeni kullanıcı kaydında bildirim
                </span>
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="settings.emailNotifications.licenseExpiry"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-600">
                  Lisans süresi dolmadan önce bildirim
                </span>
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="settings.emailNotifications.systemAlerts"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-600">
                  Sistem uyarıları ve hatalar
                </span>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bildirim Email Adresi
            </label>
            <input
              type="email"
              v-model="settings.notificationEmail"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
            >
          </div>
        </div>
      </div>

      <!-- Güvenlik Ayarları -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          <i class="fas fa-shield-alt text-blue-600 mr-2"></i>
          Güvenlik Ayarları
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              İki Faktörlü Doğrulama
            </label>
            <div class="flex items-center">
              <input
                type="checkbox"
                v-model="settings.require2FA"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <span class="ml-2 text-sm text-gray-600">
                Tüm admin kullanıcıları için 2FA zorunlu
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Oturum Süresi (Dakika)
            </label>
            <input
              type="number"
              v-model="settings.sessionTimeout"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              min="5"
              max="1440"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Maksimum Başarısız Giriş Denemesi
            </label>
            <input
              type="number"
              v-model="settings.maxLoginAttempts"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              min="3"
              max="10"
            >
          </div>
        </div>
      </div>

      <!-- Yedekleme Ayarları -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          <i class="fas fa-database text-blue-600 mr-2"></i>
          Yedekleme Ayarları
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Otomatik Yedekleme
            </label>
            <div class="flex items-center">
              <input
                type="checkbox"
                v-model="settings.autoBackup"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <span class="ml-2 text-sm text-gray-600">
                Günlük otomatik yedekleme
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Yedekleme Saati
            </label>
            <input
              type="time"
              v-model="settings.backupTime"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Yedekleme Saklama Süresi (Gün)
            </label>
            <input
              type="number"
              v-model="settings.backupRetentionDays"
              class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="365"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Kaydet Butonu -->
    <div class="mt-6 flex justify-end">
      <button
        @click="saveSettings"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        :disabled="isSaving"
      >
        <i class="fas fa-save mr-2"></i>
        {{ isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'

export default {
  name: 'AdminSettings',
  setup() {
    const toast = useToast()
    const isSaving = ref(false)

    const settings = ref({
      defaultTrialDays: 30,
      autoRenewLicense: false,
      emailNotifications: {
        newUser: true,
        licenseExpiry: true,
        systemAlerts: true
      },
      notificationEmail: '',
      require2FA: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      autoBackup: true,
      backupTime: '02:00',
      backupRetentionDays: 30
    })

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .single()

        if (error) throw error

        if (data) {
          settings.value = {
            ...settings.value,
            ...data.settings
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Ayarlar yüklenirken bir hata oluştu')
      }
    }

    const saveSettings = async () => {
      try {
        isSaving.value = true

        const { error } = await supabase
          .from('system_settings')
          .upsert({
            id: 1,
            settings: settings.value,
            updated_at: new Date().toISOString()
          })

        if (error) throw error

        toast.success('Ayarlar başarıyla kaydedildi')
      } catch (error) {
        console.error('Error saving settings:', error)
        toast.error('Ayarlar kaydedilirken bir hata oluştu')
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      settings,
      isSaving,
      saveSettings
    }
  }
}
</script> 