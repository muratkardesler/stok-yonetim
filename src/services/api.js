import axios from 'axios';

const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

// Development'da proxy kullan, production'da direkt MuleSoft'a bağlan
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://flowbridge.us-e2.cloudhub.io'
  : '/api'; // Proxy üzerinden yönlendirme

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Client ID ve Secret'ı URL parametresi olarak ekle
  const url = new URL(config.url, API_BASE_URL);
  url.searchParams.append('client_id', CLIENT_ID);
  url.searchParams.append('client_secret', CLIENT_SECRET);
  config.url = url.pathname + url.search;
  return config;
});

export const authService = {
  login: async (credentials) => {
    try {
      console.log('Login credentials:', credentials);
      
      // MuleSoft'un beklediği formatta veriyi hazırla
      const requestData = {
        Username: credentials.email.split('@')[0],
        Password: credentials.password,
        Email: credentials.email
      };

      console.log('Login request data:', requestData);
      
      const response = await api.post('/login', requestData);
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
      const requestData = {
        Username: userData.username,
        Password: userData.password,
        Email: userData.email,
        CompanyName: userData.company,
        ContactInfo: userData.phone?.replace(/\D/g, ''),
        Role: userData.role || 'User',
        Address: userData.address || 'Turkey'
      };

      const response = await api.post('/signup', requestData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/logout');
      localStorage.clear();
      sessionStorage.clear();
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

export const stockService = {
  getProducts: () => api.get('/products'),
  addProduct: (product) => api.post('/products', product),
  updateProduct: (id, product) => api.put(`/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export default api; 