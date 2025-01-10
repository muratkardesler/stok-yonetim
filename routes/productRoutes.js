const express = require("express");
const router = express.Router();

// Ürün işlemleri için controller'ı oluşturacağız
const { 
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct 
} = require("../controllers/ProductController.js");

// Ürün rotaları
router.post("/products", createProduct);        // Yeni ürün ekleme
router.get("/products", getProducts);           // Tüm ürünleri listeleme
router.get("/products/:id", getProductById);    // Tek bir ürünü getirme
router.put("/products/:id", updateProduct);     // Ürün güncelleme
router.delete("/products/:id", deleteProduct);  // Ürün silme

module.exports = router;
