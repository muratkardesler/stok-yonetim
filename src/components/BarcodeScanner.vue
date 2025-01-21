<template>
  <div>
    <div class="relative">
      <div class="flex items-center space-x-2">
        <input
          type="text"
          v-model="barcodeInput"
          ref="barcodeInputRef"
          @keydown.enter="handleBarcodeInput"
          placeholder="Barkod okutun veya girin..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          :disabled="scanning"
        />
        <button
          @click="toggleScanner"
          class="btn-icon relative"
          :class="{ 'text-primary-600': scanning }"
          :title="scanning ? 'Kamerayı Kapat' : 'Kamera ile Tara'"
        >
          <i class="fas fa-camera"></i>
          <span v-if="scanning" class="absolute -top-1 -right-1 h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
          </span>
        </button>
      </div>

      <!-- Camera Preview -->
      <div
        v-if="scanning"
        class="absolute z-10 top-full left-0 right-0 mt-2"
      >
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="relative">
            <video
              ref="video"
              class="w-full h-64 object-cover"
            ></video>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-64 h-48 border-2 border-primary-500 rounded-lg"></div>
            </div>
          </div>
          <div class="p-4 bg-gray-50 border-t">
            <p class="text-sm text-gray-600 text-center">
              Barkodu tarama alanının içine getirin
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import Quagga from '@ericblade/quagga2';

export default {
  name: 'BarcodeScanner',
  props: {
    onScan: {
      type: Function,
      required: true
    }
  },
  emits: ['scan'],
  setup(props) {
    const barcodeInput = ref('');
    const scanning = ref(false);
    const video = ref(null);
    const barcodeInputRef = ref(null);

    // Quagga configuration
    const initQuagga = () => {
      if (!video.value) return;

      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: video.value,
          constraints: {
            facingMode: "environment"
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader"
          ]
        }
      }, (err) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        handleBarcode(code);
      });
    };

    const toggleScanner = async () => {
      scanning.value = !scanning.value;
      
      if (scanning.value) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          initQuagga();
        } catch (error) {
          console.error('Error accessing camera:', error);
          scanning.value = false;
        }
      } else {
        Quagga.stop();
      }
    };

    const handleBarcode = (code) => {
      barcodeInput.value = code;
      props.onScan(code);
      scanning.value = false;
      Quagga.stop();
    };

    const handleBarcodeInput = () => {
      if (barcodeInput.value) {
        props.onScan(barcodeInput.value);
        barcodeInput.value = '';
      }
    };

    onUnmounted(() => {
      if (scanning.value) {
        Quagga.stop();
      }
    });

    return {
      barcodeInput,
      scanning,
      video,
      barcodeInputRef,
      toggleScanner,
      handleBarcodeInput
    };
  }
};
</script>

<style scoped>
.btn-icon {
  @apply inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style> 