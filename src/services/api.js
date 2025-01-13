import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  // Client ID ve secret'ı query parametresi olarak ekle
  const params = new URLSearchParams(config.params || {});
  params.append('client_id', process.env.VUE_APP_CLIENT_ID);
  params.append('client_secret', process.env.VUE_APP_CLIENT_SECRET);
  config.params = params;
  
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