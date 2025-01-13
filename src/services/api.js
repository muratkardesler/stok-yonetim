import axios from 'axios';

// Production ve development için base URL'i belirle
const baseURL = process.env.NODE_ENV === 'production'
  ? 'http://flowbridge.us-e2.cloudhub.io/api'
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  // Client ID ve secret'ı query parametresi olarak ekle
  const params = new URLSearchParams(config.params || {});
  params.append('client_id', '6f0b2e5229c7455091966ef898fd6f68');
  params.append('client_secret', '8041a365CDfb448c88a7780b7699A6aC');
  config.params = params;
  
  // Production ortamında CORS header'larını ekle
  if (process.env.NODE_ENV === 'production') {
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
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
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authService = {
  login: (credentials) => api.post('/login', {
    email: credentials.email,
    password: credentials.password
  }),
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