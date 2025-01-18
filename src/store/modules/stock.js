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
    }
  },

  getters: {
    getCategories: state => state.categories,
    isLoading: state => state.loading,
    getError: state => state.error
  }
}; 