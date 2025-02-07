<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Admin Girişi</h2>
        <p class="mt-2 text-sm text-gray-600">Yönetici paneline erişim için giriş yapın</p>
      </div>

      <!-- Giriş Formu -->
      <form @submit.prevent="handleLogin" class="space-y-6" v-if="!showTwoFactor">
        <div>
          <label class="block text-sm font-medium text-gray-700">E-posta</label>
          <input
            type="email"
            v-model="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Şifre</label>
          <input
            type="password"
            v-model="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="loading" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>

      <!-- 2FA Doğrulama -->
      <div v-if="showTwoFactor" class="space-y-6">
        <div v-if="setupMode">
          <div class="text-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Google Authenticator Kurulumu</h3>
            <p class="mt-1 text-sm text-gray-600">
              Lütfen Google Authenticator uygulamasını açın ve QR kodu okutun
            </p>
          </div>
          
          <div class="flex justify-center mb-4">
            <img :src="qrCodeUrl" alt="QR Code" class="w-48 h-48" v-if="qrCodeUrl" />
            <div v-else class="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>

          <div class="text-center text-sm text-gray-600 mb-4">
            <p>Manuel giriş için kod:</p>
            <code class="bg-gray-100 px-2 py-1 rounded">{{ setupSecret }}</code>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Doğrulama Kodu</label>
          <input
            type="text"
            v-model="totpCode"
            maxlength="6"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="000000"
          />
        </div>

        <button
          @click="verifyCode"
          :disabled="verifying"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="verifying" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          {{ verifying ? 'Doğrulanıyor...' : 'Doğrula' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'vue-toastification'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const toast = useToast()
    
    // Form state
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    
    // 2FA state
    const showTwoFactor = ref(false)
    const setupMode = ref(false)
    const setupSecret = ref('')
    const qrCodeUrl = ref('')
    const totpCode = ref('')
    const verifying = ref(false)

    // Check if user is already logged in
    onMounted(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profileError) throw profileError

          if (profile.role === 'admin') {
            router.push('/admin/dashboard')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      }
    })

    // 2FA kurulum fonksiyonu
    const setupTwoFactor = async (userId) => {
      try {
        // Yeni bir secret oluştur
        const secret = authenticator.generateSecret()
        setupSecret.value = secret

        // QR kod için gerekli bilgileri hazırla
        const otpauth = authenticator.keyuri(email.value, 'FlowBridge Admin', secret)
        
        // QR kod oluştur
        const qrCode = await QRCode.toDataURL(otpauth)
        qrCodeUrl.value = qrCode

        // Secret'ı veritabanına kaydet
        const { error } = await supabase
          .from('profiles')
          .update({ 
            totp_secret: secret,
            requires_2fa: true 
          })
          .eq('id', userId)

        if (error) throw error

        setupMode.value = true
        showTwoFactor.value = true
      } catch (error) {
        console.error('2FA setup error:', error)
        toast.error('2FA kurulumu sırasında bir hata oluştu')
        throw error
      }
    }

    // Giriş işlemi
    const handleLogin = async () => {
      if (!email.value || !password.value) {
        toast.error('Lütfen tüm alanları doldurun')
        return
      }

      try {
        loading.value = true
        console.log('Giriş yapılıyor...')

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        })

        if (authError) throw authError

        console.log('Auth data:', authData)

        // Kullanıcının admin olup olmadığını kontrol et
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, totp_secret, requires_2fa')
          .eq('id', authData.user.id)
          .single()

        if (profileError) throw profileError

        console.log('Profile data:', profile)

        // Admin değilse giriş yapmasına izin verme
        if (profile.role !== 'admin') {
          await supabase.auth.signOut()
          throw new Error('Bu sayfaya erişim yetkiniz yok')
        }

        // 2FA kontrolü
        if (!profile.totp_secret) {
          // İlk kez giriş yapıyorsa 2FA kurulumu yap
          await setupTwoFactor(authData.user.id)
        } else {
          // 2FA doğrulaması iste
          showTwoFactor.value = true
        }
        
      } catch (error) {
        console.error('Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Geçersiz e-posta veya şifre')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('E-posta adresiniz henüz doğrulanmamış')
        } else {
          toast.error(error.message || 'Giriş yapılırken bir hata oluştu')
        }
        
        await supabase.auth.signOut()
      } finally {
        loading.value = false
      }
    }

    // 2FA doğrulama
    const verifyCode = async () => {
      if (!totpCode.value || totpCode.value.length !== 6) {
        toast.error('Lütfen geçerli bir doğrulama kodu girin')
        return
      }

      try {
        verifying.value = true

        // Kullanıcı bilgilerini al
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        // Profil bilgilerini al
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('totp_secret')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        // Kodu doğrula
        const isValid = authenticator.verify({
          token: totpCode.value,
          secret: profile.totp_secret
        })

        if (!isValid) {
          throw new Error('Geçersiz doğrulama kodu')
        }

        // Kurulum modundaysa kurulumu tamamla
        if (setupMode.value) {
          setupMode.value = false
          toast.success('2FA kurulumu başarıyla tamamlandı')
        }

        // Admin paneline yönlendir
        router.push('/admin/dashboard')
      } catch (error) {
        console.error('Verification error:', error)
        toast.error(error.message || 'Doğrulama sırasında bir hata oluştu')
      } finally {
        verifying.value = false
      }
    }

    return {
      email,
      password,
      loading,
      showTwoFactor,
      setupMode,
      setupSecret,
      qrCodeUrl,
      totpCode,
      verifying,
      handleLogin,
      verifyCode
    }
  }
}
</script> 