import axios from 'axios';

const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

// Development'da local proxy'yi, production'da HTTPS ile MuleSoft'u kullan
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://flowbridge.us-e2.cloudhub.io'
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
      console.log('Login credentials:', credentials);
      
      // URL'ye client_id ve client_secret ekle
      const url = `/api/login?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
      
      // Request body'yi signup ile aynı formatta gönder
      const requestData = {
        Username: credentials.email.split('@')[0], // Email'den @ öncesini al
        Password: credentials.password,
        Email: credentials.email
      };

      console.log('Login request data:', requestData);
      
      const response = await api.post(url, requestData);

      console.log('Raw login response:', response);
      console.log('Login response data:', response.data);

      if (response.data && (response.data.Status === 'Success' || response.data.status === 'success')) {
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data));

        return {
          status: 'success',
          data: response.data
        };
      } else {
        console.error('Login failed:', response.data);
        throw new Error(response.data?.Message || response.data?.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data) {
        throw new Error(error.response.data.Message || error.response.data.message || 'API yanıt hatası');
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