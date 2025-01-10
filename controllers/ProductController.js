const Product = require("../models/productModel.js");

// Yeni ürün oluşturma
const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({
            message: "Ürün başarıyla oluşturuldu",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            error: "Ürün oluşturulamadı",
            message: error.message
        });
    }
};

// Tüm ürünleri listeleme
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            error: "Ürünler getirilemedi",
            message: error.message
        });
    }
};

// ID'ye göre ürün getirme
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                error: "Ürün bulunamadı"
            });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            error: "Ürün getirilemedi",
            message: error.message
        });
    }
};

// Ürün güncelleme
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({
                error: "Güncellenecek ürün bulunamadı"
            });
        }
        res.status(200).json({
            message: "Ürün başarıyla güncellendi",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            error: "Ürün güncellenemedi",
            message: error.message
        });
    }
};

// Ürün silme
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                error: "Silinecek ürün bulunamadı"
            });
        }
        res.status(200).json({
            message: "Ürün başarıyla silindi",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            error: "Ürün silinemedi",
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}; 