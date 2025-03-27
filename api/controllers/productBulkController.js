const Product = require('../models/Product');
const Category = require('../models/Category');
const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

exports.uploadProducts = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Lütfen bir dosya yükleyin' });
    }

    const results = [];
    const errors = [];
    let rowNumber = 1;

    try {
        // CSV dosyasını oku
        const stream = Readable.from(req.file.buffer.toString());
        
        await new Promise((resolve, reject) => {
            stream
                .pipe(csv({
                    mapHeaders: ({ header }) => header.trim().toLowerCase()
                }))
                .on('data', async (row) => {
                    rowNumber++;
                    try {
                        // Kategori kontrolü
                        let category = null;
                        if (row.category) {
                            category = await Category.findOne({ name: row.category });
                            if (!category) {
                                errors.push(`Satır ${rowNumber}: "${row.category}" kategorisi bulunamadı`);
                                return;
                            }
                        }

                        // Zorunlu alanları kontrol et
                        if (!row.name || !row.price || !row.purchaseprice || !row.unit) {
                            errors.push(`Satır ${rowNumber}: Zorunlu alanlar eksik`);
                            return;
                        }

                        // Sayısal değerleri kontrol et
                        const price = parseFloat(row.price);
                        const purchasePrice = parseFloat(row.purchaseprice);
                        const stock = row.stock ? parseFloat(row.stock) : 0;
                        const minStock = row.minstock ? parseFloat(row.minstock) : 0;

                        if (isNaN(price) || isNaN(purchasePrice) || isNaN(stock) || isNaN(minStock)) {
                            errors.push(`Satır ${rowNumber}: Geçersiz sayısal değer`);
                            return;
                        }

                        // Birim kontrolü
                        const validUnits = ['adet', 'kg', 'lt', 'mt'];
                        if (!validUnits.includes(row.unit.toLowerCase())) {
                            errors.push(`Satır ${rowNumber}: Geçersiz birim. Geçerli birimler: ${validUnits.join(', ')}`);
                            return;
                        }

                        // Ürün nesnesini oluştur
                        const product = {
                            name: row.name,
                            barcode: row.barcode || null,
                            category: category ? category._id : null,
                            description: row.description || '',
                            price: price,
                            purchasePrice: purchasePrice,
                            stock: stock,
                            unit: row.unit.toLowerCase(),
                            minStock: minStock,
                            isActive: row.isactive === 'true',
                            imageUrl: row.imageurl || null
                        };

                        // Barkod varsa tekrar kontrolü yap
                        if (product.barcode) {
                            const existingProduct = await Product.findOne({ barcode: product.barcode });
                            if (existingProduct) {
                                errors.push(`Satır ${rowNumber}: "${product.barcode}" barkodlu ürün zaten mevcut`);
                                return;
                            }
                        }

                        results.push(product);
                    } catch (error) {
                        errors.push(`Satır ${rowNumber}: ${error.message}`);
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Hata kontrolü
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Dosya işlenirken hatalar oluştu',
                errors: errors
            });
        }

        // Ürünleri toplu olarak ekle
        await Product.insertMany(results);

        res.json({
            message: `${results.length} ürün başarıyla yüklendi`,
            successCount: results.length
        });

    } catch (error) {
        res.status(500).json({
            message: 'Dosya işlenirken bir hata oluştu',
            error: error.message
        });
    }
};

// Örnek CSV şablonu indir
exports.downloadTemplate = (req, res) => {
    const template = 'name,barcode,category,description,price,purchasePrice,stock,unit,minStock,isActive,imageUrl\n' +
                    'Örnek Ürün,123456789,Elektronik,Ürün açıklaması,100,80,50,adet,10,true,https://example.com/image.jpg';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=urun_sablonu.csv');
    res.send(template);
}; 