const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api', require('./routes/userRoutes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});