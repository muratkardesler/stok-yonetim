import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api'
});

// Request interceptor - token eklemek için
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor ekleyelim
api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response?.status === 401) {
    // Token geçersiz veya süresi dolmuş
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout')
};

export const stockService = {
  getProducts: () => api.get('/products', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }),
  addProduct: (product) => api.post('/products', product, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }),
  updateProduct: (id, product) => api.put(`/products/${id}`, product, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
}; 