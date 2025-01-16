import { stockService } from '@/services/api';

const AUTO_SAVE_PRODUCT_COUNT = 5; // 5 üründe bir otomatik kaydet
const AUTO_SAVE_INTERVAL = 30000; // 30 saniye

// CompanyId'yi storage'dan al
const getCompanyId = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    return userData.companyId;
};

export default {
    namespaced: true,

    state: {
        categories: [],
        products: [],
        unsavedProducts: [],
        lastSaveTime: Date.now(),
        isLoading: false,
        error: null,
        companyId: null
    },

    mutations: {
        SET_CATEGORIES(state, categories) {
            state.categories = categories;
        },
        ADD_CATEGORY(state, category) {
            state.categories.push(category);
        },
        SET_PRODUCTS(state, products) {
            state.products = products;
        },
        ADD_PRODUCT(state, product) {
            state.products.push(product);
            state.unsavedProducts.push(product);
        },
        CLEAR_UNSAVED_PRODUCTS(state) {
            state.unsavedProducts = [];
            state.lastSaveTime = Date.now();
        },
        SET_LOADING(state, isLoading) {
            state.isLoading = isLoading;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        UPDATE_PRODUCT_IDS(state, { tempId, permanentId }) {
            const product = state.products.find(p => p.tempId === tempId);
            if (product) {
                product.id = permanentId;
                delete product.tempId;
            }
        },
        SET_COMPANY_ID(state, companyId) {
            state.companyId = companyId;
        }
    },

    actions: {
        // Kategori işlemleri
        async fetchCategories({ commit }, companyId) {
            try {
                commit('SET_LOADING', true);
                const categories = await stockService.getCategories(companyId);
                commit('SET_CATEGORIES', categories);
            } catch (error) {
                console.error('Kategoriler yüklenirken hata:', error);
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async addCategory({ commit }, category) {
            try {
                commit('SET_LOADING', true);
                const companyId = getCompanyId();
                const categoryWithCompany = {
                    ...category,
                    companyId
                };
                const response = await stockService.addCategory(categoryWithCompany);
                const savedCategory = { ...categoryWithCompany, id: response.categoryId };
                commit('ADD_CATEGORY', savedCategory);
                return savedCategory;
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        // Ürün işlemleri
        async fetchProducts({ commit }, categoryId = null) {
            try {
                commit('SET_LOADING', true);
                const companyId = getCompanyId();
                const products = await stockService.getProducts(categoryId, companyId);
                commit('SET_PRODUCTS', products);
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async addProduct({ commit, dispatch, state }, product) {
            const companyId = getCompanyId();
            // Geçici ID ata
            const productWithTempId = { 
                ...product, 
                tempId: Date.now(),
                companyId
            };
            commit('ADD_PRODUCT', productWithTempId);

            // Otomatik kaydetme koşullarını kontrol et
            if (state.unsavedProducts.length >= AUTO_SAVE_PRODUCT_COUNT || 
                (Date.now() - state.lastSaveTime) > AUTO_SAVE_INTERVAL) {
                await dispatch('saveProducts');
            }

            return productWithTempId;
        },

        async saveProducts({ commit, state }) {
            if (state.unsavedProducts.length === 0) return;

            try {
                commit('SET_LOADING', true);
                const companyId = getCompanyId();
                // Her ürüne companyId ekle
                const productsWithCompany = state.unsavedProducts.map(product => ({
                    ...product,
                    companyId
                }));
                
                const response = await stockService.addProducts(productsWithCompany);

                // Backend'den gelen kalıcı ID'leri güncelle
                response.products.forEach(p => {
                    commit('UPDATE_PRODUCT_IDS', {
                        tempId: p.tempId,
                        permanentId: p.id
                    });
                });

                commit('CLEAR_UNSAVED_PRODUCTS');
            } catch (error) {
                commit('SET_ERROR', error.message);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        }
    },

    getters: {
        getCategoryById: state => id => {
            return state.categories.find(c => c.id === id);
        },
        getProductsByCategory: state => categoryId => {
            return state.products.filter(p => p.categoryId === categoryId);
        },
        hasUnsavedChanges: state => {
            return state.unsavedProducts.length > 0;
        },
        nextAutoSaveTime: state => {
            const timeSinceLastSave = Date.now() - state.lastSaveTime;
            return Math.max(0, AUTO_SAVE_INTERVAL - timeSinceLastSave);
        }
    }
}; 