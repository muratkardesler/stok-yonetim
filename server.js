const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// CORS ayarları
app.use(cors());

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy middleware
app.use('/api', createProxyMiddleware({
  target: 'http://flowbridge.us-e2.cloudhub.io',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyReq: (proxyReq, req, res) => {
    // MuleSoft için gerekli headerları ekle
    proxyReq.setHeader('Origin', 'http://flowbridge.us-e2.cloudhub.io');
  }
}));

// SPA için catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 