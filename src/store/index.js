import { createStore } from 'vuex';

export default createStore({
  state: {
    loading: false,
    error: null,
    user: null,
    products: []
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_PRODUCTS(state, products) {
      state.products = products;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true);
      try {
        const response = await authService.login(credentials);
        commit('SET_USER', response.data.user);
        localStorage.setItem('token', response.data.token);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Giriş başarısız');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
    // Other actions...
  }
}); 