import axios from '@/plugins/axios';

export default {
  namespaced: true,
  
  state: {
    categories: [],
    loading: false,
    error: null
  },

  mutations: {
    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async addCategory({ commit }, { category, companyId }) {
      try {
        commit('SET_LOADING', true);
        const response = await axios.post(`/categories?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
          CompanyId: companyId,
          Name: category.name,
          Description: category.description
        });

        if (response.data?.Status === 'Success') {
          // Başarılı yanıt durumunda kategoriyi state'e ekle
          commit('ADD_CATEGORY', {
            id: Date.now(), // Geçici bir ID
            ...category
          });
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
    }
  },

  getters: {
    getCategories: state => state.categories,
    isLoading: state => state.loading,
    getError: state => state.error
  }
}; 