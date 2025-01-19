import axios from '@/plugins/axios';

const state = {
  products: [],
  loading: false,
  error: null,
  selectedProduct: null
};

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products || [];
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_SELECTED_PRODUCT(state, product) {
    state.selectedProduct = product;
  },
  ADD_PRODUCT(state, product) {
    state.products.push(product);
  },
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex(p => p.ProductId === updatedProduct.ProductId);
    if (index !== -1) {
      state.products.splice(index, 1, updatedProduct);
    }
  },
  DELETE_PRODUCT(state, productId) {
    state.products = state.products.filter(p => p.ProductId !== productId);
  },
  DELETE_PRODUCTS_BY_CATEGORY(state, categoryId) {
    state.products = state.products.filter(product => String(product.CategoryId) !== String(categoryId));
  }
};

const actions = {
  async fetchProducts({ commit }, { companyId, categoryId }) {
    commit('SET_LOADING', true);
    try {
      const url = categoryId 
        ? `/products?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}&CategoryId=${categoryId}`
        : `/products?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}`;
      
      const response = await axios.get(url);
      console.log('Products response:', response.data); // Debug log
      
      commit('SET_PRODUCTS', response.data || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async addProduct({ commit }, { product, companyId }) {
    try {
      const response = await axios.post(`/products?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
        CompanyId: companyId,
        CategoryId: String(product.categoryId),
        Name: product.name,
        Description: product.description,
        Price: parseFloat(product.price),
        StockQuantity: parseInt(product.stockQuantity)
      });

      if (response.data) {
        commit('ADD_PRODUCT', response.data);
        return {
          success: true,
          message: 'Ürün başarıyla eklendi!',
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async updateProduct({ commit }, { product, companyId }) {
    try {
      const response = await axios.put(`/products/${product.ProductId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}&CategoryId=${product.CategoryId}`, {
        ProductId: String(product.ProductId),
        Name: product.Name,
        Description: product.Description,
        Price: parseFloat(product.Price),
        StockQuantity: parseInt(product.StockQuantity),
        CategoryId: String(product.CategoryId),
        CompanyId: String(companyId),
        CreatedAt: product.CreatedAt
      });

      if (response.data) {
        commit('UPDATE_PRODUCT', response.data);
        return {
          success: true,
          message: 'Ürün başarıyla güncellendi!'
        };
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct({ commit }, { productId, companyId, categoryId }) {
    try {
      const response = await axios.delete(`/products/${productId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId}&CategoryId=${categoryId}`);

      if (response.data) {
        commit('DELETE_PRODUCT', productId);
        return {
          success: true,
          message: 'Ürün başarıyla silindi!'
        };
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

const getters = {
  getProducts: state => state.products,
  getLoading: state => state.loading,
  getError: state => state.error,
  getSelectedProduct: state => state.selectedProduct,
  getProductsByCategory: state => categoryId => {
    return state.products.filter(product => product.CategoryId === categoryId);
  },
  getProductCountByCategory: (state) => (categoryId) => {
    return state.products.filter(product => String(product.CategoryId) === String(categoryId)).length;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 