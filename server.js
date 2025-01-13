const express = require('express');
const cors = require('cors');
const path = require('path');
const apiMiddleware = require('./api-middleware');

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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'dist')));

// API middleware'i kullan
app.use('/api', apiMiddleware);

// SPA için catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
}); 