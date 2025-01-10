const axios = require("axios");

const createUser = async (req, res) => {
    console.log("------- YENİ KAYIT İSTEĞİ -------");
    console.log("Gelen veri:", req.body);

    const userData = req.body;

    // Veri doğrulama
    if (!userData || Object.keys(userData).length === 0) {
        return res.status(400).send({
            error: "Invalid input data",
            message: "Veri gönderilmedi"
        });
    }

    if (!userData.username || !userData.passwordHash || !userData.email || !userData.company || !userData.phone) {
        return res.status(400).send({
            error: "Invalid input data",
            message: "Tüm alanların doldurulması zorunludur."
        });
    }

    try {
        // MuleSoft API'si için veri formatını dönüştür
        const muleSoftData = {
            username: userData.username,
            passwordHash: userData.passwordHash,
            companyName: userData.company,    // company -> companyName
            contactInfo: userData.phone,      // phone -> contactInfo
            address: "Türkiye",              // Sabit değer veya formdan alabiliriz
            role: "User",                    // Varsayılan rol
            email: userData.email
        };

        console.log("MuleSoft'a gönderilen veri:", muleSoftData);
        
        const response = await axios.post(
            "http://flowbridge.us-e2.cloudhub.io/api/addUser?client_id=6f0b2e5229c7455091966ef898fd6f68&client_secret=8041a365CDfb448c88a7780b7699A6aC",
            muleSoftData,
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        console.log("MuleSoft yanıtı:", response.data);

        res.status(201).send({
            message: "Kullanıcı başarıyla oluşturuldu",
            data: response.data
        });

    } catch (error) {
        console.error("MuleSoft API Hatası:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        res.status(error.response?.status || 500).send({
            error: "API Hatası",
            message: error.response?.data?.message || "Kullanıcı oluşturulurken bir hata oluştu"
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.post(
            "http://flowbridge.us-e2.cloudhub.io/api/login?client_id=6f0b2e5229c7455091966ef898fd6f68&client_secret=8041a365CDfb448c88a7780b7699A6aC",
            {
                email,
                password
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            Message: "Giriş başarısız",
            Status: "Failed"
        });
    }
};

module.exports = {
    createUser,
    loginUser
};