const express = require("express");
const path = require("path");

const app = express();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static dosyalar
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  etag: true
}));

// API Routes
const userController = require('./controllers/UserController');
app.use('/api/auth', userController);

// Vue router için catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});