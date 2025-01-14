import axios from 'axios';

const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

// Development'da local proxy'yi, production'da doğrudan MuleSoft'u kullan
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://flowbridge.us-e2.cloudhub.io'
  : 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const authService = {
  login: async (credentials) => {
    try {
      // URL'ye client_id ve client_secret ekle
      const url = `/api/login?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
      
      const response = await api.post(url, {
        email: credentials.email,
        password: credentials.password
      });

      console.log('Login response:', response.data);

      if (response.data.Status === 'Success') {
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data));

        return {
          status: 'success',
          data: response.data
        };
      } else {
        throw new Error(response.data.Message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        throw new Error(error.response.data?.Message || 'API yanıt hatası');
      }
      throw error;
    }
  },
  signup: async (userData) => {
    const url = `/api/signup?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    return api.post(url, userData);
  },
  logout: async () => {
    const url = `/api/logout?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    return api.post(url);
  }
};

export const stockService = {
  getProducts: () => api.get('/api/products'),
  addProduct: (product) => api.post('/api/products', product),
  updateProduct: (id, product) => api.put(`/api/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/api/products/${id}`)
};

export default api; 