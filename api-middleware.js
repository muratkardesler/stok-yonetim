const axios = require('axios');
const express = require('express');
const router = express.Router();

const MULESOFT_API = process.env.MULESOFT_API || 'https://flowbridge.us-e2.cloudhub.io/api';
const CLIENT_ID = process.env.CLIENT_ID || '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '8041a365CDfb448c88a7780b7699A6aC';

// Debug log
console.log('API Configuration:', {
    MULESOFT_API,
    CLIENT_ID: CLIENT_ID.substring(0, 8) + '...',
    NODE_ENV: process.env.NODE_ENV
});

// MuleSoft API'ye istek gönderen fonksiyon
async function makeRequest(method, endpoint, data = null) {
    const url = `${MULESOFT_API}${endpoint}`;
    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    };

    console.log(`Making ${method} request to: ${url}`);

    try {
        const response = await axios({
            method,
            url,
            data,
            params,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://flowbridge.us-e2.cloudhub.io'
            },
            validateStatus: false // Tüm HTTP durum kodlarını kabul et
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.status >= 400) {
            throw {
                response: {
                    status: response.status,
                    data: response.data
                }
            };
        }

        return response.data;
    } catch (error) {
        console.error('MuleSoft API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
}

// Login endpoint
router.post('/login', async (req, res) => {
    console.log('Login request received:', {
        email: req.body.email,
        hasPassword: !!req.body.password
    });

    try {
        const result = await makeRequest('POST', '/login', {
            email: req.body.email,
            password: req.body.password
        });
        
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
    } catch (error) {
        console.error('Login failed:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Internal server error'
        });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
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
        });
    }
});

// Products endpoints
router.get('/products', async (req, res) => {
    try {
        const result = await makeRequest('GET', '/products');
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Internal server error'
        });
    }
});

router.post('/products', async (req, res) => {
    try {
        const result = await makeRequest('POST', '/products', req.body);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Internal server error'
        });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const result = await makeRequest('PUT', `/products/${req.params.id}`, req.body);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Internal server error'
        });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const result = await makeRequest('DELETE', `/products/${req.params.id}`);
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Internal server error'
        });
    }
});

module.exports = router; 