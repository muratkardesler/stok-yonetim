import axios from '@/plugins/axios';
import router from '@/router';

const state = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  companyId: state => state.user?.companyId,
  loading: state => state.loading,
  error: state => state.error
};

const actions = {
  async login({ commit }, credentials) {
    try {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      // Mulesoft endpoint yapısına uygun istek
      const response = await axios.post(`/login?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
        email: credentials.email,
        password: credentials.password
      });

      if (response.data.Status === 'Success') {
        const userData = {
          email: response.data.Email?.[0],
          username: response.data.Username?.[0],
          companyId: response.data.CompanyId?.[0],
          created: response.data.Created?.[0]
        };

        // Kullanıcı bilgilerini sakla
        if (credentials.remember) {
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          sessionStorage.setItem('userData', JSON.stringify(userData));
          sessionStorage.setItem('isLoggedIn', 'true');
        }

        commit('SET_USER', userData);
        commit('SET_AUTHENTICATED', true);
        return true;
      }
      
      throw new Error(response.data.Message || 'Giriş başarısız');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.Message || error.message || 'Giriş yapılırken bir hata oluştu';
      commit('SET_ERROR', errorMessage);
      throw new Error(errorMessage);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async logout({ commit }) {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('isLoggedIn');
      commit('CLEAR_USER');
      commit('SET_AUTHENTICATED', false);
      router.push('/login');
    }
  },

  async checkAuth({ commit }) {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';

      if (isLoggedIn && userData.companyId) {
        commit('SET_USER', userData);
        commit('SET_AUTHENTICATED', true);
        return true;
      }

      return false;
    } catch (error) {
      commit('CLEAR_USER');
      commit('SET_AUTHENTICATED', false);
      return false;
    }
  }
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_AUTHENTICATED(state, value) {
    state.isAuthenticated = value;
  },
  SET_LOADING(state, value) {
    state.loading = value;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  CLEAR_ERROR(state) {
    state.error = null;
  },
  CLEAR_USER(state) {
    state.user = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 