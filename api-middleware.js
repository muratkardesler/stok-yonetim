const express = require('express');
const axios = require('axios');
const router = express.Router();

const MULESOFT_API = 'http://flowbridge.us-e2.cloudhub.io/api';
const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

// İstek logları
router.use((req, res, next) => {
    console.log(`📨 API İsteği: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', { ...req.body, password: '***' });
    next();
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('👤 Login isteği alındı:', {
            body: { ...req.body, password: '***' }
        });

        // İstek verilerini hazırla
        const data = {
            email: req.body.email,
            password: req.body.password
        };

        console.log('MuleSoft\'a gönderilen veri:', {
            ...data,
            password: '***'
        });

        // İsteği gönder
        const response = await axios({
            method: 'post',
            url: `${MULESOFT_API}/login`,
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: data
        });

        console.log('MuleSoft yanıtı:', response.data);

        if (response.data.Status === 'Failed') {
            throw new Error(response.data.Message || 'Login failed');
        }

        // Yanıtı standartlaştır
        const standardResponse = {
            status: 'success',
            data: {
                token: response.data.Token,
                user: {
                    email: response.data.Email?.[0],
                    username: response.data.Username?.[0],
                    created: response.data.Created?.[0]
                },
                message: response.data.Message
            }
        };

        console.log('✅ Login başarılı:', standardResponse);
        res.json(standardResponse);
    } catch (error) {
        console.error('❌ Login hatası:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // MuleSoft'tan gelen hata mesajını kullan
        const errorMessage = error.response?.data?.Message || 
                           error.message || 
                           'Giriş sırasında bir hata oluştu';

        res.status(error.response?.status || 500).json({
            status: 'error',
            message: errorMessage
        });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        console.log('👥 Signup isteği alındı:', {
            body: { ...req.body, password: '***' }
        });

        // İstek verilerini hazırla
        const data = {
            username: req.body.username,
            passwordHash: req.body.passwordHash,
            email: req.body.email,
            companyName: req.body.companyName,
            contactInfo: req.body.contactInfo?.replace(/\D/g, ''),
            role: req.body.role || 'User',
            address: req.body.address || 'Turkey'
        };

        console.log('MuleSoft\'a gönderilen veri:', {
            ...data,
            passwordHash: '***'
        });

        // İsteği gönder
        const response = await axios({
            method: 'post',
            url: `${MULESOFT_API}/addUser`,
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: data
        });

        console.log('MuleSoft yanıtı:', response.data);

        if (response.data.Status === 'Failed') {
            throw new Error(response.data.Message || 'Signup failed');
        }

        // Yanıtı standartlaştır
        const standardResponse = {
            status: 'success',
            data: {
                token: response.data.Token,
                user: {
                    email: data.Email,
                    username: data.Username,
                    company: data.CompanyName,
                    role: data.Role
                },
                message: response.data.Message
            }
        };

        console.log('✅ Signup başarılı:', standardResponse);
        res.json(standardResponse);
    } catch (error) {
        console.error('❌ Signup hatası:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // MuleSoft'tan gelen hata mesajını kullan
        const errorMessage = error.response?.data?.Message || 
                           error.message || 
                           'Kayıt sırasında bir hata oluştu';

        res.status(error.response?.status || 500).json({
            status: 'error',
            message: errorMessage
        });
    }
});

// API endpoint'leri buraya eklenecek
router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = router; 