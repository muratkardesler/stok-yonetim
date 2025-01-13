const axios = require('axios');
const express = require('express');
const router = express.Router();

const MULESOFT_API = 'https://flowbridge.us-e2.cloudhub.io/api';
const CLIENT_ID = '6f0b2e5229c7455091966ef898fd6f68';
const CLIENT_SECRET = '8041a365CDfb448c88a7780b7699A6aC';

// MuleSoft API'ye istek gönderen fonksiyon
async function makeRequest(method, endpoint, data = null) {
    const url = `${MULESOFT_API}${endpoint}`;
    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    };

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
            }
        });
        return response.data;
    } catch (error) {
        console.error('MuleSoft API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const result = await makeRequest('POST', '/login', {
            email: req.body.email,
            password: req.body.password
        });
        res.json(result);
    } catch (error) {
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
        res.json(result);
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