const express = require('express');
const cors = require('cors');
const path = require('path');
const apiMiddleware = require('./api-middleware');

const app = express();

// CORS ayarları
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'dist')));

// API middleware'i kullan
app.use('/api', apiMiddleware);

// SPA için catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 