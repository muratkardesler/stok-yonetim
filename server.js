const express = require('express');
const cors = require('cors');
const app = express();

// CORS ayarları
app.use(cors({
    origin: 'http://localhost:8081',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    preflightContinue: true,
    optionsSuccessStatus: 204
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// İstek logları
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// API middleware
const apiMiddleware = require('./api-middleware');
app.use('/api', apiMiddleware);

// Hata yakalama
app.use((err, req, res, next) => {
    console.error('❌ Sunucu hatası:', err);
    res.status(500).json({
        error: 'Sunucu hatası',
        message: err.message
    });
});

// Sunucuyu başlat
const port = 3000;
app.listen(port, () => {
    console.log(`🚀 Express sunucusu http://localhost:${port} adresinde çalışıyor`);
}); 