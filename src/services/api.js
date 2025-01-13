import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
  login: (credentials) => api.post('/login', credentials),
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