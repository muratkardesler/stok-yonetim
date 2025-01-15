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
            data: data
        });
<<<<<<< HEAD
        
        // Ensure consistent response format
        const response = {
            status: 'success',
            data: {
                token: result.token || result.Token,
                user: {
                    email: req.body.email,
                    ...result.user
                }
            }
        };
        
        console.log('Login successful');
        res.json(response);
=======

        console.log('✅ MuleSoft yanıtı:', {
            status: response.status,
            data: response.data
        });

        res.json(response.data);
>>>>>>> stok-murat-main
    } catch (error) {
        console.error('❌ Login hatası:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(error.response?.status || 500).json({
            error: 'Login hatası',
            message: error.response?.data?.message || error.message
        });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
<<<<<<< HEAD
        const result = await makeRequest('POST', '/signup', req.body);
        
        // Ensure consistent response format
        const response = {
            status: 'success',
            data: {
                token: result.token || result.Token,
                user: {
                    email: req.body.email,
                    ...result.user
                }
            }
        };
        
        res.json(response);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Internal server error'
=======
        console.log('👥 Signup isteği alındı:', {
            body: { ...req.body, password: '***' }
>>>>>>> stok-murat-main
        });

        // İstek verilerini hazırla
        const data = {
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
            company: req.body.company,
            phone: req.body.phone?.replace(/\D/g, ''),
            role: req.body.role || 'User',
            address: req.body.address || 'Turkey'
        };

        // İsteği gönder
        const response = await axios({
            method: 'post',
            url: `${MULESOFT_API}/signup`,
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

        console.log('✅ MuleSoft yanıtı:', {
            status: response.status,
            data: response.data
        });

        res.json(response.data);
    } catch (error) {
        console.error('❌ Signup hatası:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(error.response?.status || 500).json({
            error: 'Signup hatası',
            message: error.response?.data?.message || error.message
        });
    }
});

module.exports = router; 