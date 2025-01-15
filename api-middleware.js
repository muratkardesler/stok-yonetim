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
            data: JSON.stringify(data)  // JSON string'e çevir
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
                    email: req.body.email,
                    username: response.data.Username?.[0],
                    company: response.data.CompanyName?.[0],
                    role: response.data.Role?.[0]
                }
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

        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
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
            password: req.body.password,
            email: req.body.email,
            companyName: req.body.company,
            contactInfo: req.body.phone?.replace(/\D/g, ''),
            role: 'User',
            address: 'Turkey'
        };

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
            data: JSON.stringify(data)  // JSON string'e çevir
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
                    email: req.body.email,
                    username: req.body.username,
                    company: req.body.company,
                    role: 'User'
                }
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

        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

module.exports = router; 