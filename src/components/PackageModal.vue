<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                Yeni Paket Oluştur
              </DialogTitle>

              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Paket Adı -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Paket Adı
                  </label>
                  <input 
                    type="text"
                    v-model="form.name"
                    required
                    placeholder="Paket adını giriniz"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <!-- Açıklama -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea 
                    v-model="form.description"
                    required
                    rows="3"
                    placeholder="Paket açıklamasını giriniz"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  ></textarea>
                </div>

                <!-- Fiyat -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat
                  </label>
                  <div class="relative rounded-lg shadow-sm">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span class="text-gray-500 sm:text-sm">₺</span>
                    </div>
                    <input 
                      type="number"
                      v-model="form.price"
                      step="0.01"
                      required
                      placeholder="0.00"
                      class="w-full rounded-lg border-gray-300 pl-8 pr-12 focus:border-primary-500 focus:ring-primary-500"
                    />
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span class="text-gray-500 sm:text-sm">TRY</span>
                    </div>
                  </div>
                </div>

                <!-- Ürünler -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Ürünler
                  </label>
                  
                  <!-- Ürün Listesi -->
                  <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    <div 
                      v-for="(product, index) in form.products" 
                      :key="index"
                      class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-primary-300 transition-all"
                    >
                      <!-- Ürün Başlık -->
                      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 class="font-medium text-gray-900">{{ index + 1 }}. Ürün</h4>
                      </div>
                      
                      <!-- Ürün İçerik -->
                      <div class="p-4 space-y-4">
                        <!-- Ürün Seçimi -->
                        <div class="w-full">
                          <Combobox v-model="product.productId">
                            <div class="relative">
                              <div class="relative w-full">
                                <ComboboxInput
                                  class="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-10 text-sm font-medium text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  :displayValue="(productId) => getProductName(productId)"
                                  @change="productSearch = $event.target.value"
                                  placeholder="Ürün seçin veya arayın..."
                                />
                                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                                  <i class="fas fa-chevron-down h-5 w-5 text-gray-400" aria-hidden="true" />
                                </ComboboxButton>
                              </div>
                              <TransitionRoot
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                                @after-leave="productSearch = ''"
                              >
                                <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                  <div v-if="filteredProducts.length === 0" class="relative cursor-default select-none px-4 py-2 text-gray-700">
                                    Ürün bulunamadı.
                                  </div>
                                  <ComboboxOption
                                    v-for="item in filteredProducts"
                                    :key="item.ProductId"
                                    :value="item.ProductId"
                                    v-slot="{ selected, active }"
                                    as="template"
                                  >
                                    <li
                                      class="relative cursor-default select-none px-4 py-3"
                                      :class="{
                                        'bg-primary-600 text-white': active,
                                        'text-gray-900': !active,
                                        'bg-primary-50': selected && !active
                                      }"
                                    >
                                      <div class="flex flex-col">
                                        <span class="block font-medium truncate">
                                          {{ item.Name }}
                                        </span>
                                        <span 
                                          class="block text-sm truncate mt-0.5" 
                                          :class="{ 'text-white': active, 'text-primary-600 font-medium': !active }"
                                        >
                                          {{ formatPrice(item.Price) }}
                                        </span>
                                      </div>
                                      <span
                                        v-if="selected"
                                        class="absolute inset-y-0 left-0 flex items-center pl-3"
                                        :class="{ 'text-white': active, 'text-primary-600': !active }"
                                      >
                                        <i class="fas fa-check h-5 w-5" aria-hidden="true" />
                                      </span>
                                    </li>
                                  </ComboboxOption>
                                </ComboboxOptions>
                              </TransitionRoot>
                            </div>
                          </Combobox>
                        </div>

                        <!-- Alt Kısım: Miktar ve Silme -->
                        <div class="flex items-center gap-3">
                          <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-600 mb-1">Miktar</label>
                            <div class="flex items-center">
                              <button 
                                type="button"
                                @click="decrementQuantity(index)"
                                class="p-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 transition-colors"
                                :disabled="product.quantity <= 1"
                                :class="{ 'opacity-50 cursor-not-allowed': product.quantity <= 1 }"
                              >
                                <i class="fas fa-minus text-sm"></i>
                              </button>
                              <input 
                                v-model="product.quantity"
                                type="number"
                                min="1"
                                required
                                placeholder="Adet"
                                class="w-20 text-center border-y border-gray-300 py-2 focus:ring-0 focus:border-primary-500"
                                @change="validateQuantity(index)"
                              />
                              <button 
                                type="button"
                                @click="incrementQuantity(index)"
                                class="p-2 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 transition-colors"
                              >
                                <i class="fas fa-plus text-sm"></i>
                              </button>
                            </div>
                          </div>
                          <div class="pt-6">
                            <button 
                              type="button" 
                              @click="removeProduct(index)"
                              class="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              :disabled="form.products.length === 1"
                              :class="{ 'opacity-50 cursor-not-allowed': form.products.length === 1 }"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Ürün Ekle Butonu -->
                  <button 
                    type="button" 
                    @click="addProduct"
                    class="mt-4 w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-primary-700 bg-primary-50 rounded-xl border-2 border-primary-100 hover:bg-primary-100 hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    Yeni Ürün Ekle
                  </button>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isLoading ? 'Kaydediliyor...' : 'Kaydet' }}
                  </button>
                </div>
              </form>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

export default {
  name: 'PackageModal',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    availableProducts: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    const toast = useToast();
    const companyId = localStorage.getItem('companyIdva');
    return { toast, companyId }
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        price: '',
        products: [{ productId: '', quantity: 1 }]
      },
      productSearch: '',
      isLoading: false
    }
  },
  computed: {
    filteredProducts() {
      if (!this.productSearch) return this.availableProducts;
      
      const searchTerm = this.productSearch.toLowerCase();
      return this.availableProducts.filter(product => 
        product.Name.toLowerCase().includes(searchTerm)
      );
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    },
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },
    addProduct() {
      this.form.products.push({ productId: '', quantity: 1 });
    },
    removeProduct(index) {
      if (this.form.products.length > 1) {
        this.form.products.splice(index, 1);
      }
    },
    resetForm() {
      this.form = {
        name: '',
        description: '',
        price: '',
        products: [{ productId: '', quantity: 1 }]
      };
      this.productSearch = '';
    },
    async handleSubmit() {
      try {
        this.isLoading = true;
        
        const payload = {
          CompanyId: this.companyId,
          Name: this.form.name,
          Description: this.form.description,
          Price: parseFloat(this.form.price),
          Products: this.form.products.map(p => ({
            ProductId: parseInt(p.productId),
            Quantity: parseInt(p.quantity)
          }))
        };

        const response = await axios.post(
          'https://flowbridge.us-e2.cloudhub.io/api/orders/cretePackages',
          payload,
          {
            params: {
              client_id: '6f0b2e5229c7455091966ef898fd6f68',
              client_secret: '8041a365CDfb448c88a7780b7699A6aC'
            },
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          this.$emit('package-created');
          this.closeModal();
          this.toast.success(response.data.message || 'Paket başarıyla oluşturuldu');
        }
      } catch (err) {
        console.error('Paket oluşturulurken hata:', err);
        this.toast.error(err.response?.data?.message || 'Paket oluşturulurken bir hata oluştu');
      } finally {
        this.isLoading = false;
      }
    },
    getProductName(productId) {
      const product = this.availableProducts.find(p => p.ProductId === productId);
      return product ? `${product.Name} - ${this.formatPrice(product.Price)}` : '';
    },
    incrementQuantity(index) {
      this.form.products[index].quantity++;
    },
    decrementQuantity(index) {
      if (this.form.products[index].quantity > 1) {
        this.form.products[index].quantity--;
      }
    },
    validateQuantity(index) {
      let quantity = parseInt(this.form.products[index].quantity);
      if (isNaN(quantity) || quantity < 1) {
        this.form.products[index].quantity = 1;
      } else {
        this.form.products[index].quantity = quantity;
      }
    },
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.product-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

.add-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.product-search {
  margin-bottom: 1rem;
}

.products-container {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
}

.products-container::-webkit-scrollbar {
  width: 6px;
}

.products-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.products-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.products-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.select-container {
  position: relative;
  width: 100%;
}

.quantity-input {
  width: 100px;
}
</style> 