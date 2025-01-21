import axios from '@/plugins/axios';

const state = {
  customers: [],
  loading: false,
  error: null
};

const mutations = {
  SET_CUSTOMERS(state, customers) {
    state.customers = customers;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  ADD_CUSTOMER(state, customer) {
    state.customers.unshift(customer);
  },
  UPDATE_CUSTOMER(state, updatedCustomer) {
    const index = state.customers.findIndex(c => c.CustomerId === updatedCustomer.CustomerId);
    if (index !== -1) {
      state.customers.splice(index, 1, updatedCustomer);
    }
  },
  DELETE_CUSTOMER(state, customerId) {
    state.customers = state.customers.filter(c => c.CustomerId !== customerId);
  }
};

const actions = {
  // Tüm müşterileri getir
  async fetchCustomers({ commit }, companyId) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get(`/customers?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}`);
      commit('SET_CUSTOMERS', response.data || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Yeni müşteri ekle
  async createCustomer({ commit }, { customer, companyId }) {
    try {
      const response = await axios.post(`/customers?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
        CompanyId: companyId,
        Name: customer.Name,
        Phone: customer.Phone,
        Email: customer.Email,
        Address: customer.Address,
        Notes: customer.Notes
      });

      if (response.data) {
        commit('ADD_CUSTOMER', response.data);
        return {
          success: true,
          message: 'Müşteri başarıyla eklendi!',
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Müşteri güncelle
  async updateCustomer({ commit }, { customer, companyId }) {
    try {
      const response = await axios.put(`/customers/${customer.CustomerId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}`, customer);

      if (response.data) {
        commit('UPDATE_CUSTOMER', response.data);
        return {
          success: true,
          message: 'Müşteri başarıyla güncellendi!'
        };
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Müşteri sil
  async deleteCustomer({ commit }, { customerId, companyId }) {
    try {
      const response = await axios.delete(`/customers/${customerId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}`);

      if (response.data) {
        commit('DELETE_CUSTOMER', customerId);
        return {
          success: true,
          message: 'Müşteri başarıyla silindi!'
        };
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Müşteri ara
  async searchCustomers({ commit }, { query, companyId }) {
    try {
      const response = await axios.get(`/customers/search?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}&query=${query}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
};

const getters = {
  getCustomers: state => state.customers,
  getLoading: state => state.loading,
  getError: state => state.error,
  
  // Müşteri ID'sine göre müşteri getir
  getCustomerById: (state) => (customerId) => {
    return state.customers.find(customer => customer.CustomerId === customerId);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 