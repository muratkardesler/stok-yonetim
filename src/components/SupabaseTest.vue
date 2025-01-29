<template>
  <div class="supabase-test">
    <h2 class="test-title">Supabase Bağlantı Testi</h2>
    <button 
      @click="testConnection" 
      class="test-button"
      :disabled="loading"
    >
      {{ loading ? 'Test Ediliyor...' : 'Bağlantıyı Test Et' }}
    </button>
    <div v-if="result" class="test-result">
      <div :class="['result-box', result.status]">
        <p class="status">{{ result.status === 'success' ? '✅ Başarılı' : '❌ Hata' }}</p>
        <p class="message">{{ result.message }}</p>
        <pre v-if="result.data" class="data">{{ JSON.stringify(result.data, null, 2) }}</pre>
        <pre v-if="result.error" class="data error">{{ JSON.stringify(result.error, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'SupabaseTest',
  setup() {
    const loading = ref(false)
    const result = ref(null)

    const testConnection = async () => {
      loading.value = true
      try {
        console.log('Supabase URL:', supabase.supabaseUrl)
        const { data, error } = await supabase
          .from('test')
          .select('*')
        
        if (error) {
          console.error('Supabase error:', error)
          result.value = {
            status: 'error',
            message: error.message,
            error: error
          }
        } else {
          console.log('Supabase data:', data)
          result.value = {
            status: 'success',
            message: 'Bağlantı başarılı!',
            data
          }
        }
      } catch (error) {
        console.error('Catch error:', error)
        result.value = {
          status: 'error',
          message: error.message,
          error: error
        }
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      result,
      testConnection
    }
  }
}
</script>

<style scoped>
.supabase-test {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
  max-width: 500px;
}

.test-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.test-button {
  background: #4F46E5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-button:hover:not(:disabled) {
  background: #4338CA;
}

.test-button:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.test-result {
  margin-top: 1rem;
}

.result-box {
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.result-box.success {
  background: #ECFDF5;
  border: 1px solid #10B981;
}

.result-box.error {
  background: #FEF2F2;
  border: 1px solid #EF4444;
}

.status {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.message {
  color: #4B5563;
  margin-bottom: 0.5rem;
}

.data {
  background: rgba(0,0,0,0.05);
  padding: 0.75rem;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.75rem;
}

.data.error {
  background: rgba(239,68,68,0.05);
}
</style> 