<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Başlık -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Ayarlar</h1>
      <p class="mt-1 text-sm text-gray-500">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
    </div>

    <!-- Ana İçerik -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sol Taraf: Menü -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <nav class="space-y-1 p-4">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                currentTab === tab.id
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              ]"
            >
              <i :class="['fas fa-fw text-lg mr-3', tab.icon]"></i>
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Sağ Taraf: İçerik -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Profil Bilgileri -->
        <div v-if="currentTab === 'profile'" class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">Profil Bilgileri</h2>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  v-model="profile.firstName"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input
                  type="text"
                  v-model="profile.lastName"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                v-model="profile.email"
                disabled
                class="w-full rounded-lg border-gray-300 bg-gray-50 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-gray-500">E-posta adresinizi değiştirmek için lütfen destek ekibiyle iletişime geçin.</p>
            </div>

            <div class="pt-4">
              <button
                @click="updateProfile"
                :disabled="updating"
                class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-save mr-2"></i>
                {{ updating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Güvenlik -->
        <div v-if="currentTab === 'security'" class="space-y-6">
          <!-- Şifre Değiştirme -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">Şifre Değiştirme</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                <input
                  type="password"
                  v-model="passwordForm.currentPassword"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  v-model="passwordForm.newPassword"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  v-model="passwordForm.confirmPassword"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div class="pt-4">
                <button
                  @click="changePassword"
                  :disabled="changingPassword"
                  class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-key mr-2"></i>
                  {{ changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Aktif Oturumlar -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">Aktif Oturumlar</h2>
            
            <div class="space-y-4">
              <div v-if="loadingSessions" class="flex items-center justify-center py-8">
                <i class="fas fa-spinner fa-spin text-primary-500 text-2xl"></i>
              </div>
              
              <div v-else-if="sessions.length === 0" class="text-center py-8">
                <div class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-desktop text-gray-400"></i>
                </div>
                <p class="mt-2 text-sm text-gray-500">Aktif oturum bulunamadı</p>
              </div>
              
              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="py-4 first:pt-0 last:pb-0"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-desktop text-gray-500"></i>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ session.device_info?.browser || 'Bilinmeyen Tarayıcı' }}</p>
                        <p class="text-xs text-gray-500">{{ session.ip_address }}</p>
                        <p class="text-xs text-gray-500">Son giriş: {{ formatDate(session.login_date) }}</p>
                      </div>
                    </div>
                    <button
                      v-if="session.is_active"
                      @click="terminateSession(session.id)"
                      class="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none"
                    >
                      Oturumu Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sistem -->
        <div v-if="currentTab === 'system'" class="space-y-6">
          <!-- Sistem Ayarları -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">Sistem Ayarları</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Varsayılan KDV Oranı (%)</label>
                <select
                  v-model="settings.defaultTaxRate"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="0">0%</option>
                  <option value="1">1%</option>
                  <option value="8">8%</option>
                  <option value="18">18%</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                <select
                  v-model="settings.currency"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tarih Formatı</label>
                <select
                  v-model="settings.dateFormat"
                  class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="DD.MM.YYYY">31.12.2023</option>
                  <option value="MM/DD/YYYY">12/31/2023</option>
                  <option value="YYYY-MM-DD">2023-12-31</option>
                </select>
              </div>

              <div class="pt-4">
                <button
                  @click="updateSettings"
                  :disabled="updatingSettings"
                  class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-save mr-2"></i>
                  {{ updatingSettings ? 'Kaydediliyor...' : 'Ayarları Kaydet' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Deneme Süresi -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">Hesap Durumu</h2>
            
            <div v-if="profile.trial_end_date" class="space-y-4">
              <div :class="[
                'p-4 rounded-lg',
                isTrialExpired ? 'bg-red-50' : 'bg-amber-50'
              ]">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i :class="[
                      'fas fa-clock text-2xl',
                      isTrialExpired ? 'text-red-600' : 'text-amber-600'
                    ]"></i>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium" :class="[
                      isTrialExpired ? 'text-red-800' : 'text-amber-800'
                    ]">
                      {{ isTrialExpired ? 'Deneme Süreniz Doldu' : 'Deneme Süresi' }}
                    </h3>
                    <div class="mt-2 text-sm" :class="[
                      isTrialExpired ? 'text-red-700' : 'text-amber-700'
                    ]">
                      <p v-if="isTrialExpired">
                        Deneme süreniz {{ formatDate(profile.trial_end_date) }} tarihinde sona erdi.
                        Hizmetlerimizi kullanmaya devam etmek için lütfen destek ekibimizle iletişime geçin.
                      </p>
                      <p v-else>
                        Deneme sürenizin bitmesine {{ remainingDays }} gün kaldı.
                        Bitiş tarihi: {{ formatDate(profile.trial_end_date) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i class="fas fa-info-circle text-2xl text-blue-600"></i>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">Son Aktivite Bilgileri</h3>
                    <div class="mt-2 text-sm text-blue-700 space-y-1">
                      <p>Son giriş tarihi: {{ formatDate(lastLoginDate) }}</p>
                      <p>Son giriş IP adresi: {{ profile.last_login_ip || 'Bilgi yok' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bildirimler -->
        <div v-if="currentTab === 'notifications'" class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">Bildirim Tercihleri</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b">
              <div>
                <h3 class="text-sm font-medium text-gray-900">E-posta Bildirimleri</h3>
                <p class="text-sm text-gray-500">Önemli güncellemeler ve bildirimler için e-posta alın</p>
              </div>
              <button
                type="button"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                ]"
                role="switch"
                @click="settings.emailNotifications = !settings.emailNotifications"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between py-3 border-b">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Düşük Stok Bildirimleri</h3>
                <p class="text-sm text-gray-500">Ürünler kritik stok seviyesine düştüğünde bildirim alın</p>
              </div>
              <button
                type="button"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  settings.stockNotifications ? 'bg-primary-600' : 'bg-gray-200'
                ]"
                role="switch"
                @click="settings.stockNotifications = !settings.stockNotifications"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    settings.stockNotifications ? 'translate-x-5' : 'translate-x-0'
                  ]"
                />
              </button>
            </div>

            <div class="flex items-center justify-between py-3 border-b">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Yeni Sipariş Bildirimleri</h3>
                <p class="text-sm text-gray-500">Yeni bir sipariş geldiğinde bildirim alın</p>
              </div>
              <button
                type="button"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  settings.orderNotifications ? 'bg-primary-600' : 'bg-gray-200'
                ]"
                role="switch"
                @click="settings.orderNotifications = !settings.orderNotifications"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    settings.orderNotifications ? 'translate-x-5' : 'translate-x-0'
                  ]"
                />
              </button>
            </div>

            <div class="pt-4">
              <button
                @click="updateSettings"
                :disabled="updatingSettings"
                class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-save mr-2"></i>
                {{ updatingSettings ? 'Kaydediliyor...' : 'Tercihleri Kaydet' }}
              </button>
            </div>
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
import { format, differenceInDays } from 'date-fns'
import { tr } from 'date-fns/locale'

export default {
  name: 'Settings',
  setup() {
    const toast = useToast()
    const currentTab = ref('profile')
    const updating = ref(false)
    const changingPassword = ref(false)
    const loadingSessions = ref(true)
    const updatingSettings = ref(false)

    // Profil bilgileri
    const profile = ref({
      firstName: '',
      lastName: '',
      email: '',
      trial_end_date: null,
      last_login_ip: null
    })

    // Şifre değiştirme formu
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // Oturumlar
    const sessions = ref([])

    // Sistem ayarları
    const settings = ref({
      defaultTaxRate: 18,
      currency: 'TRY',
      dateFormat: 'DD.MM.YYYY',
      emailNotifications: true,
      stockNotifications: true,
      orderNotifications: true
    })

    // Sekmeler
    const tabs = [
      { id: 'profile', name: 'Profil Bilgileri', icon: 'fa-user' },
      { id: 'security', name: 'Güvenlik', icon: 'fa-shield-alt' },
      { id: 'system', name: 'Sistem', icon: 'fa-cog' },
      { id: 'notifications', name: 'Bildirimler', icon: 'fa-bell' }
    ]

    // Hesaplanan değerler
    const isTrialExpired = computed(() => {
      if (!profile.value.trial_end_date) return false
      return new Date(profile.value.trial_end_date) < new Date()
    })

    const remainingDays = computed(() => {
      if (!profile.value.trial_end_date) return 0
      return Math.max(0, differenceInDays(
        new Date(profile.value.trial_end_date),
        new Date()
      ))
    })

    const lastLoginDate = ref(null)

    // Profil bilgilerini yükle
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        profile.value = {
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: user.email,
          trial_end_date: data.trial_end_date,
          last_login_ip: data.last_login_ip
        }

        // Ayarları yükle
        if (data.settings) {
          settings.value = { ...settings.value, ...data.settings }
        }

        // Son giriş tarihini al
        const { data: sessions } = await supabase
          .from('user_sessions')
          .select('login_date')
          .eq('user_id', user.id)
          .order('login_date', { ascending: false })
          .limit(1)

        if (sessions?.[0]) {
          lastLoginDate.value = sessions[0].login_date
        }

      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Profil bilgileri yüklenirken bir hata oluştu')
      }
    }

    // Profil güncelleme
    const updateProfile = async () => {
      try {
        updating.value = true
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: profile.value.firstName,
            last_name: profile.value.lastName
          })
          .eq('id', user.id)

        if (error) throw error

        toast.success('Profil bilgileri güncellendi')
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('Profil güncellenirken bir hata oluştu')
      } finally {
        updating.value = false
      }
    }

    // Şifre değiştirme
    const changePassword = async () => {
      try {
        if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
          toast.error('Yeni şifreler eşleşmiyor')
          return
        }

        changingPassword.value = true
        const { error } = await supabase.auth.updateUser({
          password: passwordForm.value.newPassword
        })

        if (error) throw error

        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }

        toast.success('Şifreniz başarıyla değiştirildi')
      } catch (error) {
        console.error('Error changing password:', error)
        toast.error('Şifre değiştirilirken bir hata oluştu')
      } finally {
        changingPassword.value = false
      }
    }

    // Oturumları yükle
    const loadSessions = async () => {
      try {
        loadingSessions.value = true
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('login_date', { ascending: false })

        if (error) throw error
        sessions.value = data
      } catch (error) {
        console.error('Error loading sessions:', error)
        toast.error('Oturumlar yüklenirken bir hata oluştu')
      } finally {
        loadingSessions.value = false
      }
    }

    // Oturum sonlandırma
    const terminateSession = async (sessionId) => {
      try {
        const { error } = await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', sessionId)

        if (error) throw error

        await loadSessions()
        toast.success('Oturum sonlandırıldı')
      } catch (error) {
        console.error('Error terminating session:', error)
        toast.error('Oturum sonlandırılırken bir hata oluştu')
      }
    }

    // Ayarları güncelle
    const updateSettings = async () => {
      try {
        updatingSettings.value = true
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { error } = await supabase
          .from('profiles')
          .update({
            settings: settings.value
          })
          .eq('id', user.id)

        if (error) throw error

        toast.success('Ayarlar güncellendi')
      } catch (error) {
        console.error('Error updating settings:', error)
        toast.error('Ayarlar güncellenirken bir hata oluştu')
      } finally {
        updatingSettings.value = false
      }
    }

    // Tarih formatla
    const formatDate = (date) => {
      if (!date) return ''
      return format(new Date(date), settings.value.dateFormat, { locale: tr })
    }

    onMounted(() => {
      loadProfile()
      loadSessions()
    })

    return {
      currentTab,
      tabs,
      profile,
      updating,
      updateProfile,
      passwordForm,
      changingPassword,
      changePassword,
      sessions,
      loadingSessions,
      terminateSession,
      settings,
      updatingSettings,
      updateSettings,
      formatDate,
      isTrialExpired,
      remainingDays,
      lastLoginDate
    }
  }
}
</script> 