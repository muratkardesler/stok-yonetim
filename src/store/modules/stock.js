import axios from '@/plugins/axios';

export default {
  namespaced: true,
  
  state: {
    categories: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    REMOVE_CATEGORY(state, categoryId) {
      state.categories = state.categories.filter(category => category.CategoryId !== categoryId);
    },
    DELETE_CATEGORY(state, categoryId) {
      state.categories = state.categories.filter(category => category.CategoryId !== categoryId);
    }
  },

  actions: {
    async fetchCategories({ commit }, companyId) {
      try {
        commit('SET_LOADING', true);
        console.log('Fetching categories for CompanyId:', companyId);
        
        const url = `/categories?CompanyId=${companyId}&client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`;
        console.log('Request URL:', url);
        
        const response = await axios({
          method: 'get',
          url: url,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Categories response:', response.data);
        
        if (Array.isArray(response.data)) {
          commit('SET_CATEGORIES', response.data);
        } else {
          console.error('Invalid response format:', response.data);
          commit('SET_CATEGORIES', []);
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error config:', error.config);
        commit('SET_ERROR', error.message);
        commit('SET_CATEGORIES', []);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async addCategory({ commit, dispatch }, { category, companyId }) {
      try {
        commit('SET_LOADING', true);
        const response = await axios.post(`/categories?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
          CompanyId: companyId,
          Name: category.name,
          Description: category.description
        });

        if (response.data?.Status === 'Success') {
          // Kategorileri yeniden yükle
          await dispatch('fetchCategories', companyId);
          return response.data;
        } else {
          throw new Error(response.data?.Message || 'Kategori eklenemedi');
        }
      } catch (error) {
        console.error('Kategori eklenirken hata:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteCategory({ commit, rootGetters }, { categoryId, companyId }) {
      try {
        // Önce kategorideki tüm ürünleri bul
        const productsInCategory = rootGetters['product/getProductsByCategory'](categoryId);
        
        // Kategorideki her ürünü veritabanından sil
        for (const product of productsInCategory) {
          await axios.delete(`/products/${product.ProductId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}&CategoryId=${categoryId}`);
        }

        // Sonra kategoriyi sil - URL yapısını düzeltiyoruz
        const response = await axios.delete(`/categories/${companyId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CategoryId=${categoryId}`);
        
        if (response.data) {
          // Kategoriyi state'den kaldır
          commit('DELETE_CATEGORY', categoryId);
          
          // İlgili kategorideki tüm ürünleri state'den kaldır
          commit('product/DELETE_PRODUCTS_BY_CATEGORY', categoryId, { root: true });
          
          return {
            success: true,
            message: 'Kategori ve ilgili tüm ürünler başarıyla silindi!'
          };
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    },

    async updateCategory({ commit, dispatch, state }, { category, companyId }) {
      try {
        // Açıklama uzunluğu kontrolü
        if (category.Description && category.Description.length > 50) {
          throw new Error('Açıklama 50 karakterden uzun olamaz.');
        }

        // Aynı isimde başka kategori var mı kontrolü
        const existingCategory = state.categories.find(
          cat => cat.Name.toLowerCase() === category.Name.toLowerCase() && 
                cat.CategoryId !== category.CategoryId // Kendisi hariç kontrol
        );

        if (existingCategory) {
          throw new Error(`"${category.Name}" isimli başka bir kategori zaten mevcut.`);
        }

        const response = await axios.put(
          `/categories/${companyId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CategoryId=${String(category.CategoryId)}`,
          {
            CategoryId: String(category.CategoryId),
            Name: category.Name,
            Description: category.Description
          }
        );
        
        if (response.data.Status === 'Success') {
          await dispatch('fetchCategories', companyId);
          return { success: true, message: response.data.Message || 'Kategori başarıyla güncellendi.' };
        }
        return { success: false, message: response.data.Message || 'Kategori güncellenirken bir hata oluştu.' };
      } catch (error) {
        console.error('Update category error:', error);
        throw new Error(error.message || 'Kategori güncellenirken bir hata oluştu.');
      }
    }
  },

  getters: {
    getCategories: state => state.categories,
    isLoading: state => state.loading,
    getError: state => state.error
  }
}; 