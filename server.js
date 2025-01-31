const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS ayarları
const allowedOrigins = [
    'http://localhost:8085',
    'https://test-stok-yonetim.onrender.com',
    'https://stok-yonetim.onrender.com'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
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
    if (req.method !== 'GET') {
        console.log('Body:', req.body);
    }
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Tüm GET isteklerini index.html'e yönlendir (Vue Router için)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    console.log('📄 Serving:', indexPath);
    
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
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Express sunucusu ${port} portunda çalışıyor`);
    console.log('📁 Çalışma dizini:', __dirname);
    console.log('🌍 Node environment:', process.env.NODE_ENV);
}); 