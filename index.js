const express = require("express");
const userRoutes = require("./routes/userRoutes.js");

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use("/api", userRoutes);

app.get("/test", (req, res) => {
    res.json({ message: "API çalışıyor!" });
});

app.listen(3000, () => {
    console.log("Sunucu http://localhost:3000 adresinde çalışıyor");
});