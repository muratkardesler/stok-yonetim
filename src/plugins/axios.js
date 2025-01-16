import axios from 'axios';
import store from '@/store';
import router from '@/router';

const instance = axios.create({
  baseURL: 'https://flowbridge.us-e2.cloudhub.io/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    if (error.response?.status === 401) {
      router.push('/login');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 