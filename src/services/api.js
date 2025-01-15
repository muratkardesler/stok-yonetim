import axios from 'axios';

const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

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
                url: `/api/login?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            });

            console.log('✅ Yanıt alındı:', {
                status: response.status,
                data: response.data
            });

            if (response.data.status === 'success') {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Giriş başarısız');
            }
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
                Username: userData.username,
                Password: userData.password,
                Email: userData.email,
                CompanyName: userData.company,
                ContactInfo: userData.phone?.replace(/\D/g, ''),
                Role: 'User',
                Address: 'Turkey'
            };

            // İsteği gönder
            const response = await axios({
                method: 'post',
                url: `/api/register?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            });

            console.log('✅ Yanıt alındı:', {
                status: response.status,
                data: response.data
            });

            if (response.data.status === 'success') {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Kayıt başarısız');
            }
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
