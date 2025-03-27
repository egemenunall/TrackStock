const express = require('express');
const InventoryCount = require('../models/Inventory');
const Product = require('../models/Product');

const router = express.Router();

// Tüm stok sayımlarını getir
router.get('/', async (req, res) => {
    try {
        const inventoryCounts = await InventoryCount.find()
            .sort({ createdAt: -1 });
        res.status(200).json(inventoryCounts);
    } catch (error) {
        console.error("Stok sayımları alınırken hata oluştu:", error);
        res.status(500).json({ message: "Stok sayımları alınırken bir hata oluştu." });
    }
});

// Belirli bir stok sayımını getir
router.get('/:id', async (req, res) => {
    try {
        const inventoryCount = await InventoryCount.findById(req.params.id)
            .populate('items.product');
        
        if (!inventoryCount) {
            return res.status(404).json({ message: "Stok sayımı bulunamadı" });
        }
        
        res.status(200).json(inventoryCount);
    } catch (error) {
        console.error("Stok sayımı alınırken hata oluştu:", error);
        res.status(500).json({ message: "Stok sayımı alınırken bir hata oluştu." });
    }
});

// Yeni stok sayımı oluştur
router.post('/', async (req, res) => {
    try {
        const { name, notes, createdBy } = req.body;
        
        // Tüm ürünleri getir
        const products = await Product.find();
        
        // Her ürün için bir sayım öğesi oluştur
        const items = products.map(product => ({
            product: product._id,
            systemQuantity: product.stock,
            countedQuantity: 0,
            difference: -product.stock, // Başlangıçta sayılan miktar 0 olduğu için fark negatif olacak
            counted: false
        }));
        
        // Stok sayımı oluştur
        const inventoryCount = new InventoryCount({
            name,
            notes,
            createdBy,
            items
        });
        
        await inventoryCount.save();
        res.status(201).json(inventoryCount);
    } catch (error) {
        console.error("Stok sayımı oluşturulurken hata oluştu:", error);
        res.status(500).json({ message: "Stok sayımı oluşturulurken bir hata oluştu." });
    }
});

// Ürün barkodu veya ID'si ile sayım güncelle
router.post('/:id/count', async (req, res) => {
    try {
        const { productIdentifier, countedQuantity } = req.body;
        
        // Stok sayımını bul
        const inventoryCount = await InventoryCount.findById(req.params.id);
        
        if (!inventoryCount) {
            return res.status(404).json({ message: "Stok sayımı bulunamadı" });
        }
        
        if (inventoryCount.status === 'completed') {
            return res.status(400).json({ message: "Tamamlanmış bir sayım güncellenemez" });
        }
        
        // Durumu güncelle
        if (inventoryCount.status === 'draft') {
            inventoryCount.status = 'in_progress';
        }
        
        // Ürünü bul (barkod veya ID'ye göre)
        let product;
        
        if (productIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId formatında ise ID olarak kullan
            product = await Product.findById(productIdentifier);
        } else {
            // Değilse barkod olarak ara
            product = await Product.findOne({ barcode: productIdentifier });
        }
        
        if (!product) {
            return res.status(404).json({ message: "Ürün bulunamadı" });
        }
        
        // Sayım öğesini bul ve güncelle
        const itemIndex = inventoryCount.items.findIndex(
            item => item.product.toString() === product._id.toString()
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Bu sayımda belirtilen ürün bulunamadı" });
        }
        
        // Sayım öğesini güncelle
        inventoryCount.items[itemIndex].countedQuantity = parseInt(countedQuantity);
        inventoryCount.items[itemIndex].difference = 
            parseInt(countedQuantity) - inventoryCount.items[itemIndex].systemQuantity;
        inventoryCount.items[itemIndex].counted = true;
        inventoryCount.items[itemIndex].countedAt = new Date();
        
        await inventoryCount.save();
        
        // Ürün bilgileriyle yanıt ver
        const updatedItem = {
            ...inventoryCount.items[itemIndex].toObject(),
            product: {
                _id: product._id,
                name: product.name,
                barcode: product.barcode
            }
        };
        
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error("Stok sayımı güncellenirken hata oluştu:", error);
        res.status(500).json({ message: "Stok sayımı güncellenirken bir hata oluştu." });
    }
});

// Stok sayımını tamamla
router.post('/:id/complete', async (req, res) => {
    try {
        const { updateStock } = req.body;
        
        // Stok sayımını bul
        const inventoryCount = await InventoryCount.findById(req.params.id);
        
        if (!inventoryCount) {
            return res.status(404).json({ message: "Stok sayımı bulunamadı" });
        }
        
        if (inventoryCount.status === 'completed') {
            return res.status(400).json({ message: "Sayım zaten tamamlanmış" });
        }
        
        // Durumu tamamlandı olarak işaretle
        inventoryCount.status = 'completed';
        inventoryCount.completedAt = new Date();
        
        // Stok değerlerini güncelle (isteğe bağlı)
        if (updateStock) {
            for (const item of inventoryCount.items) {
                if (item.counted) {
                    await Product.findByIdAndUpdate(item.product, {
                        stock: item.countedQuantity
                    });
                }
            }
        }
        
        await inventoryCount.save();
        res.status(200).json(inventoryCount);
    } catch (error) {
        console.error("Stok sayımı tamamlanırken hata oluştu:", error);
        res.status(500).json({ message: "Stok sayımı tamamlanırken bir hata oluştu." });
    }
});

module.exports = router; 