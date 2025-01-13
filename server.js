const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// CORS ayarları
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'https://flowbridge.us-e2.cloudhub.io',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyReq: (proxyReq, req, res) => {
    // MuleSoft için gerekli headerları ekle
    proxyReq.setHeader('Origin', 'https://flowbridge.us-e2.cloudhub.io');
    
    // Query parametrelerini URL'ye ekle
    const url = new URL(proxyReq.path, 'https://flowbridge.us-e2.cloudhub.io');
    url.searchParams.append('client_id', '6f0b2e5229c7455091966ef898fd6f68');
    url.searchParams.append('client_secret', '8041a365CDfb448c88a7780b7699A6aC');
    proxyReq.path = url.pathname + url.search;
  },
  onProxyRes: (proxyRes, req, res) => {
    // CORS headerlarını ekle
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Origin, Accept';
  }
});

// API isteklerini proxy'ye yönlendir
app.use('/api', apiProxy);

// SPA için catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 