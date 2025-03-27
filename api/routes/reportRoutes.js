const express = require('express');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const router = express.Router();

// Stok raporunu getir
router.get('/stock', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Stok raporu alınırken hata oluştu:", error);
        res.status(500).json({ message: "Stok raporu alınırken bir hata oluştu" });
    }
});

// Günlük satış raporu
router.get('/sales/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const startDate = date ? new Date(date) : new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        const sales = await Sale.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('product');

        res.status(200).json(sales);
    } catch (error) {
        console.error("Günlük satış raporu alınırken hata oluştu:", error);
        res.status(500).json({ message: "Günlük satış raporu alınırken bir hata oluştu" });
    }
});

// Toplam ciro hesaplama
router.get('/revenue', async (req, res) => {
    try {
        // İptal edilmemiş satışları al ve ciroyu hesapla
        const sales = await Sale.find({ isCancelled: false }).populate('product');
        const totalRevenue = sales.reduce((total, sale) => {
            return total + (sale.product.price * sale.quantity);
        }, 0);

        res.status(200).json({ totalRevenue });
    } catch (error) {
        console.error("Ciro hesaplanırken hata oluştu:", error);
        res.status(500).json({ message: "Ciro hesaplanırken bir hata oluştu" });
    }
});

module.exports = router;
