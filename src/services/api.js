import axios from 'axios';

// Production ve development için base URL'i belirle
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://flowbridge.us-e2.cloudhub.io/api'
  : 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // CORS için withCredentials'ı false yap
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use(config => {
  // Production ortamında CORS headers ekle
  if (process.env.NODE_ENV === 'production') {
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
  }

  // URL'yi oluştur
  let url = config.url || '';
  if (!url.includes('client_id')) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}client_id=6f0b2e5229c7455091966ef898fd6f68&client_secret=8041a365CDfb448c88a7780b7699A6aC`;
    config.url = url;
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(response => {
  return response;
}, error => {
  console.error('API Error:', error);
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authService = {
  login: (credentials) => {
    const url = `/login?client_id=6f0b2e5229c7455091966ef898fd6f68&client_secret=8041a365CDfb448c88a7780b7699A6aC`;
    return api.post(url, {
      email: credentials.email,
      password: credentials.password
    });
  },
  signup: (userData) => api.post('/signup', userData),
  logout: () => api.post('/logout')
};

export const stockService = {
  getProducts: () => api.get('/products'),
  addProduct: (product) => api.post('/products', product),
  updateProduct: (id, product) => api.put(`/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export default api; 