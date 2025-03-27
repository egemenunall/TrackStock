const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Yeni ürün ekleme
router.post('/', async (req, res) => {
    try {
        const { name, stock, price } = req.body;
        
        // Basit doğrulama
        if (!name || !stock || !price) {
            return res.status(400).json({ message: "Ürün adı, stok ve fiyat alanları zorunludur." });
        }

        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("Ürün eklenirken hata oluştu:", error);
        res.status(500).json({ message: "Ürün eklenirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
});

// Tüm ürünleri getirme
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Ürünler getirilirken hata oluştu:", error);
        res.status(500).json({ message: "Ürünler getirilirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
});

// Belirli bir ürünü getirme
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: `ID ${req.params.id} ile ilgili ürün bulunamadı` });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Ürün getirilirken hata oluştu:", error);
        res.status(500).json({ message: "Ürün getirilirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
});

// Ürünü güncelleme
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: `ID ${req.params.id} ile ilgili ürün bulunamadı` });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Ürün güncellenirken hata oluştu:", error);
        res.status(500).json({ message: "Ürün güncellenirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
});

// Ürünü silme
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: `ID ${req.params.id} ile ilgili ürün bulunamadı` });
        }
        res.status(200).json({ message: "Ürün başarıyla silindi" });
    } catch (error) {
        console.error("Ürün silinirken hata oluştu:", error);
        res.status(500).json({ message: "Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
});

// Barkod ile ürün arama
router.get('/barcode/:barcode', async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (!product) {
            return res.status(404).json({ message: `Barkod ${req.params.barcode} ile ilgili ürün bulunamadı` });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Ürün aranırken hata oluştu:", error);
        res.status(500).json({ message: "Ürün aranırken bir hata oluştu. Lütfen tekrar deneyin." });
    }
});

module.exports = router;
