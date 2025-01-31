const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS ayarları
app.use(cors({
    origin: ['http://localhost:8081', 'https://test-stok-yonetim.onrender.com', 'https://stok-yonetim.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    preflightContinue: true,
    optionsSuccessStatus: 204
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları servis et
const distPath = path.join(__dirname, 'dist');
console.log('📂 Dist klasörü yolu:', distPath);
app.use(express.static(distPath));

// İstek logları
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method !== 'GET') {
        console.log('Body:', req.body);
    }
    next();
});

// API middleware
const apiMiddleware = require('./api-middleware');
app.use('/api', apiMiddleware);

// Tüm GET isteklerini index.html'e yönlendir (Vue Router için)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    console.log('📄 index.html yolu:', indexPath);
    
    // index.html dosyasının varlığını kontrol et
    if (!require('fs').existsSync(indexPath)) {
        console.error('❌ index.html bulunamadı!');
        return res.status(404).send('index.html not found');
    }
    
    res.sendFile(indexPath);
});

// Hata yakalama
app.use((err, req, res, next) => {
    console.error('❌ Sunucu hatası:', err);
    res.status(500).json({
        error: 'Sunucu hatası',
        message: err.message
    });
});

// Sunucuyu başlat
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Express sunucusu ${port} portunda çalışıyor`);
    console.log('📁 Çalışma dizini:', __dirname);
}); 