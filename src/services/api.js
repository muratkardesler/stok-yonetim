import axios from 'axios';

const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';
const BASE_URL = 'https://flowbridge.us-e2.cloudhub.io';

// Auth servisi
export const authService = {
    async login(credentials) {
        try {
            console.log('👤 Login isteği hazırlanıyor:', {
                email: credentials.email,
                hasPassword: !!credentials.password
            });

            // İstek verilerini hazırla
            const data = {
                email: credentials.email,
                password: credentials.password
            };

            // İsteği gönder
            const response = await axios({
                method: 'post',
                url: `${BASE_URL}/api/login?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            });

            console.log('✅ Yanıt alındı:', response.data);
            
            // Kullanıcı bilgilerini hazırla
            const userData = {
                username: response.data.Username,
                email: response.data.Email,
                CompanyId: response.data.CompanyId,
                created: response.data.Created
            };

            console.log('Kaydedilecek userData:', userData);

            // LocalStorage'a kaydet
            if (credentials.remember) {
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                sessionStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('isLoggedIn', 'true');
            }

            return response.data;
        } catch (error) {
            console.error('❌ Login hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    async signup(userData) {
        try {
            console.log('👥 Signup isteği hazırlanıyor:', {
                ...userData,
                password: '***'
            });

            // İstek verilerini hazırla
            const data = {
                username: userData.username,
                passwordHash: userData.password,
                companyName: userData.company,
                contactInfo: userData.phone?.replace(/\D/g, ''),
                address: userData.address || 'Turkey',
                role: userData.role || 'User',
                email: userData.email
            };

            console.log('MuleSoft\'a gönderilen veri:', {
                ...data,
                passwordHash: '***'
            });

            // İsteği gönder
            const response = await axios({
                method: 'post',
                url: `${BASE_URL}/api/addUser?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            });

            console.log('✅ Yanıt alındı:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Signup hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
};

// Stok servisi
export const stockService = {
    // Kategori işlemleri
    async addCategory(category) {
        try {
            console.log('📁 Kategori ekleme isteği:', category);

            const response = await axios({
                method: 'post',
                url: `${BASE_URL}/api/categories?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    name: category.name,
                    description: category.description,
                    companyId: category.companyId
                }
            });

            console.log('✅ Kategori eklendi:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Kategori ekleme hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    async getCategories(companyId) {
        try {
            if (!companyId) {
                console.warn('⚠️ CompanyId eksik!');
                return [];
            }

            const response = await axios({
                method: 'get',
                url: `${BASE_URL}/api/categories?companyId=${companyId}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📋 Kategoriler alındı:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Kategorileri alma hatası:', error);
            return [];
        }
    },

    // Ürün işlemleri
    async addProducts(products) {
        try {
            console.log('📦 Toplu ürün ekleme isteği:', products);

            const response = await axios({
                method: 'post',
                url: `${BASE_URL}/api/products/batch?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { 
                    products: products.map(product => ({
                        ...product,
                        companyId: product.companyId
                    }))
                }
            });

            console.log('✅ Ürünler eklendi:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Ürün ekleme hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    async getProducts(categoryId = null, companyId) {
        try {
            const url = categoryId 
                ? `${BASE_URL}/api/products/${companyId}?category=${categoryId}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
                : `${BASE_URL}/api/products/${companyId}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

            const response = await axios({
                method: 'get',
                url,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📋 Ürünler alındı:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Ürünleri alma hatası:', error);
            throw error;
        }
    }
};
