const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // OPTIONS isteklerini hemen yanıtla
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy middleware yapılandırması
const proxyOptions = {
  target: 'http://flowbridge.us-e2.cloudhub.io',
  changeOrigin: true,
  secure: false,
  onProxyReq: (proxyReq, req, res) => {
    // URL'deki query parametrelerini koru
    const url = new URL(proxyReq.path, 'http://dummy.com');
    
    // Eğer query parametreleri yoksa ekle
    if (!url.searchParams.has('client_id')) {
      url.searchParams.append('client_id', '6f0b2e5229c7455091966ef898fd6f68');
    }
    if (!url.searchParams.has('client_secret')) {
      url.searchParams.append('client_secret', '8041a365CDfb448c88a7780b7699A6aC');
    }
    
    proxyReq.path = url.pathname + url.search;
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
};

// Proxy middleware'i uygula
app.use('/api', createProxyMiddleware(proxyOptions));

// Tüm route'ları Vue uygulamasına yönlendir
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 