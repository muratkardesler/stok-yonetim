const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// CORS ayarları
app.use(cors());

// JSON body parser
app.use(express.json());

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'dist')));

// Tüm route'ları index.html'e yönlendir (Vue router için)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Port ayarı
const port = process.env.PORT || 3000;

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 