import axios from 'axios';

const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

// API URL'ini ortama göre ayarla
const API_BASE_URL = 'https://flowbridge.us-e2.cloudhub.io';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://flowbridge.us-e2.cloudhub.io'
  }
});

export const authService = {
  login: async (credentials) => {
    try {
      console.log('Login credentials:', credentials);
      
      const url = `/api/login?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
      
      // MuleSoft'un beklediği formatta veriyi hazırla
      const requestData = {
        Username: credentials.email.split('@')[0],
        Password: credentials.password,
        Email: credentials.email
      };

      console.log('Login request data:', requestData);
      
      const response = await api.post(url, requestData);
      console.log('Login response:', response);

      if (response.data && response.data.Status === 'Success') {
        // Kullanıcı bilgilerini sakla
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data));

        return {
          status: 'success',
          data: response.data
        };
      } else {
        throw new Error(response.data?.Message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const url = `/api/signup?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
      
      // MuleSoft'un beklediği formatta veriyi hazırla
      const requestData = {
        Username: userData.username,
        Password: userData.password,
        Email: userData.email,
        CompanyName: userData.company,
        ContactInfo: userData.phone?.replace(/\D/g, ''),
        Role: userData.role || 'User',
        Address: userData.address || 'Turkey'
      };

      const response = await api.post(url, requestData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const url = `/api/logout?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
      const response = await api.post(url);
      
      // Local storage'ı temizle
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

export const stockService = {
  getProducts: () => api.get('/api/products'),
  addProduct: (product) => api.post('/api/products', product),
  updateProduct: (id, product) => api.put(`/api/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/api/products/${id}`)
};

export default api; 