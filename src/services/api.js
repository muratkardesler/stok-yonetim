import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://flowbridge.us-e2.cloudhub.io/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  // Add client_id and client_secret as query parameters
  const params = {
    client_id: '6f0b2e5229c7455091966ef898fd6f68',
    client_secret: '8041a365CDfb448c88a7780b7699A6aC',
    ...(config.params || {})
  };
  
  config.params = params;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => {
    const url = '/login';
    const data = {
      email: credentials.email,
      password: credentials.password
    };
    return api.post(url, data);
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