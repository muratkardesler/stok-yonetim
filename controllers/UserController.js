const express = require('express');
const jwt = require('jsonwebtoken');

// Express Router oluştur
const router = express.Router();

// Test kullanıcıları
const users = [
  {
    id: 1,
    email: 'test@test.com',
    password: '123456',
    company: 'Test Şirketi'
  }
];

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          company: user.company
        }
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Email veya şifre hatalı'
    });
  }
});

// Signup endpoint
router.post('/signup', (req, res) => {
  const { email, password, company } = req.body;
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Bu email adresi zaten kullanımda'
    });
  }
  
  const newUser = {
    id: users.length + 1,
    email,
    password,
    company
  };
  
  users.push(newUser);
  
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        company: newUser.company
      }
    }
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// Router'ı export et
module.exports = router;