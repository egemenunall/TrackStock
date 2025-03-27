require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const migrateStocks = async () => {
    try {
        // MongoDB Bağlantısı
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log("MongoDB Bağlantısı Başarılı");
        
        // Eski formatta tüm ürünleri bul
        const products = await Product.find({});
        
        console.log(`${products.length} ürün bulundu. Stok yapısı güncelleniyor...`);
        
        for (const product of products) {
            // Eski stok yapısı kontrol et
            if (product.stock && typeof product.stock === 'object') {
                // Platform bazlı stokları topla
                let totalStock = 0;
                if (product.stock.pharmacy) totalStock += product.stock.pharmacy;
                if (product.stock.farmazon) totalStock += product.stock.farmazon;
                if (product.stock.woocommerce) totalStock += product.stock.woocommerce;
                
                // Ürünü güncelle
                product.stock = totalStock;
                await product.save();
                
                console.log(`${product.name} ürünü güncellendi. Yeni stok: ${totalStock}`);
            }
        }
        
        console.log("Stok yapısı geçişi tamamlandı!");
        process.exit(0);
    } catch (error) {
        console.error("Geçiş sırasında hata oluştu:", error);
        process.exit(1);
    }
};

migrateStocks(); 