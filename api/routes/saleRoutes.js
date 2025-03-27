const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const router = express.Router();

// Tüm satışları getirme
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate('product')
            .sort({ createdAt: -1 }); // En son satışlar önce gelsin
        res.status(200).json(sales);
    } catch (error) {
        console.error("Satışlar getirilirken hata oluştu:", error);
        res.status(500).json({ message: "Satışlar getirilirken bir hata oluştu." });
    }
});

// Yeni satış ekleme ve stok güncelleme
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { product, platform, quantity } = req.body;

        // Giriş doğrulama
        if (!product || !platform || !quantity) {
            return res.status(400).json({ 
                message: "Ürün, platform ve miktar zorunludur" 
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({ 
                message: "Miktar 0'dan büyük olmalıdır" 
            });
        }

        // Ürünü bul
        const foundProduct = await Product.findById(product).session(session);
        if (!foundProduct) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }

        // Stok kontrolü
        if (foundProduct.stock < quantity) {
            await session.abortTransaction();
            return res.status(400).json({
                message: `Yetersiz stok! Sadece ${foundProduct.stock} adet mevcut.`
            });
        }

        // Stok düşme işlemi
        foundProduct.stock -= quantity;
        await Product.findByIdAndUpdate(
            foundProduct._id,
            { stock: foundProduct.stock },
            { session, new: true }
        );

        // Satış kaydı oluştur
        const sale = new Sale({ 
            product, 
            platform, 
            quantity,
            date: new Date()
        });
        await sale.save({ session });

        await session.commitTransaction();
        
        // Yanıtta ürün bilgilerini de gönder
        const populatedSale = await Sale.findById(sale._id).populate('product');
        
        res.status(201).json(populatedSale);
    } catch (error) {
        await session.abortTransaction();
        console.error("Satış eklenirken hata detayı:", {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ 
            message: "Satış eklenirken bir hata oluştu. Lütfen tekrar deneyin.",
            error: error.message,
            details: error.stack
        });
    } finally {
        session.endSession();
    }
});

// Satış iptali ve stok iadesi
router.post('/:id/cancel', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({ 
                message: "İptal sebebi belirtilmelidir" 
            });
        }

        const sale = await Sale.findById(req.params.id).session(session);
        if (!sale) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Satış bulunamadı" });
        }

        if (sale.isCancelled) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Bu satış zaten iptal edilmiş" });
        }

        // Ürünü bul
        const product = await Product.findById(sale.product).session(session);
        if (!product) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }

        // Stok iadesi
        product.stock += sale.quantity;
        await Product.findByIdAndUpdate(
            product._id,
            { stock: product.stock },
            { session, new: true }
        );

        // Satışı iptal edildi olarak işaretle
        sale.isCancelled = true;
        sale.cancelledAt = new Date();
        sale.cancelReason = reason;
        await sale.save({ session });

        await session.commitTransaction();

        // Yanıtta ürün bilgilerini de gönder
        const populatedSale = await Sale.findById(sale._id).populate('product');

        res.status(200).json({ 
            message: "Satış başarıyla iptal edildi", 
            sale: populatedSale,
            updatedStock: product.stock
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Satış iptal edilirken hata oluştu:", error);
        res.status(500).json({ 
            message: "Satış iptal edilirken bir hata oluştu. Lütfen tekrar deneyin.",
            error: error.message 
        });
    } finally {
        session.endSession();
    }
});

// Tüm satışları silme (Sadece test amaçlı kullanın!)
router.delete('/clear-all', async (req, res) => {
    try {
        // Tüm satışları sil
        await Sale.deleteMany({});
        
        res.status(200).json({ 
            message: "Tüm satışlar başarıyla silindi",
            success: true
        });
    } catch (error) {
        console.error("Satışlar silinirken hata oluştu:", error);
        res.status(500).json({ 
            message: "Satışlar silinirken bir hata oluştu. Lütfen tekrar deneyin.",
            success: false
        });
    }
});

module.exports = router;
