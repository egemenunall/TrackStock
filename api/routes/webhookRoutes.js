const express = require('express');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const mongoose = require('mongoose');
const crypto = require('crypto');

const router = express.Router();

// WooCommerce webhook güvenlik doğrulaması
const verifyWooCommerceWebhook = (req, res, next) => {
    const signature = req.headers['x-wc-webhook-signature'];
    const payload = JSON.stringify(req.body);
    const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

    const hash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');

    if (hash === signature) {
        next();
    } else {
        res.status(401).json({ message: 'Geçersiz webhook imzası' });
    }
};

// WooCommerce'den yeni sipariş webhook'u
router.post('/woocommerce/order', verifyWooCommerceWebhook, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = req.body;
        
        // Sadece "processing" durumundaki siparişleri işle
        if (order.status !== 'processing') {
            return res.status(200).json({ message: 'Sipariş durumu işlenmedi' });
        }

        // Her bir sipariş ürünü için stok düşme ve satış kaydı
        for (const item of order.line_items) {
            // WooCommerce ID'sine göre ürünü bul
            const product = await Product.findOne({ 
                woocommerceId: item.product_id.toString() 
            }).session(session);

            if (!product) {
                console.error(`Ürün bulunamadı: WooCommerce ID ${item.product_id}`);
                continue;
            }

            // Stok kontrolü
            if (product.stock < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Yetersiz stok: ${product.name}`
                });
            }

            // Stok düşme
            product.stock -= item.quantity;
            await Product.findByIdAndUpdate(
                product._id,
                { stock: product.stock },
                { session, new: true }
            );

            // Satış kaydı oluştur
            const sale = new Sale({
                product: product._id,
                platform: 'woocommerce',
                quantity: item.quantity,
                date: new Date(),
                woocommerceOrderId: order.id
            });
            await sale.save({ session });
        }

        await session.commitTransaction();
        res.status(200).json({ message: 'Sipariş başarıyla işlendi' });
    } catch (error) {
        await session.abortTransaction();
        console.error('WooCommerce webhook hatası:', error);
        res.status(500).json({ 
            message: 'Sipariş işlenirken hata oluştu',
            error: error.message 
        });
    } finally {
        session.endSession();
    }
});

module.exports = router; 