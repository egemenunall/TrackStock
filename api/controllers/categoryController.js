const Category = require('../models/Category');

// Tüm kategorileri getir
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('parentCategory', 'name')
            .sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Kategoriler getirilirken hata:', error);
        res.status(500).json({ message: 'Kategoriler getirilirken bir hata oluştu' });
    }
};

// Yeni kategori oluştur
exports.createCategory = async (req, res) => {
    try {
        // Gelen veriyi doğrula
        if (!req.body.name || !req.body.name.trim()) {
            return res.status(400).json({ message: 'Kategori adı zorunludur' });
        }

        // Eğer üst kategori seçildiyse, var olduğunu kontrol et
        if (req.body.parentCategory) {
            const parentExists = await Category.findById(req.body.parentCategory);
            if (!parentExists) {
                return res.status(400).json({ message: 'Seçilen üst kategori bulunamadı' });
            }
        }

        const category = new Category({
            name: req.body.name.trim(),
            description: req.body.description ? req.body.description.trim() : '',
            parentCategory: req.body.parentCategory || null
        });

        await category.save();
        
        // Kaydedilen kategoriyi üst kategori bilgisiyle birlikte getir
        const savedCategory = await Category.findById(category._id)
            .populate('parentCategory', 'name');
            
        res.status(201).json(savedCategory);
    } catch (error) {
        console.error('Kategori oluşturulurken hata:', error);
        res.status(400).json({ 
            message: error.message || 'Kategori oluşturulurken bir hata oluştu' 
        });
    }
};

// ID'ye göre kategori getir
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name');
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (error) {
        console.error('Kategori getirilirken hata:', error);
        res.status(500).json({ message: 'Kategori getirilirken bir hata oluştu' });
    }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
    try {
        // Gelen veriyi doğrula
        if (!req.body.name || !req.body.name.trim()) {
            return res.status(400).json({ message: 'Kategori adı zorunludur' });
        }

        // Eğer üst kategori seçildiyse, var olduğunu ve döngü oluşturmadığını kontrol et
        if (req.body.parentCategory) {
            if (req.body.parentCategory === req.params.id) {
                return res.status(400).json({ message: 'Bir kategori kendisini üst kategori olarak seçemez' });
            }
            const parentExists = await Category.findById(req.body.parentCategory);
            if (!parentExists) {
                return res.status(400).json({ message: 'Seçilen üst kategori bulunamadı' });
            }
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name.trim(),
                description: req.body.description ? req.body.description.trim() : '',
                parentCategory: req.body.parentCategory || null
            },
            { new: true, runValidators: true }
        ).populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        res.json(category);
    } catch (error) {
        console.error('Kategori güncellenirken hata:', error);
        res.status(400).json({ message: error.message || 'Kategori güncellenirken bir hata oluştu' });
    }
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
    try {
        // Önce bu kategoriye bağlı alt kategorileri kontrol et
        const hasSubCategories = await Category.exists({ parentCategory: req.params.id });
        if (hasSubCategories) {
            return res.status(400).json({ 
                message: 'Bu kategorinin alt kategorileri var. Önce alt kategorileri silmelisiniz.' 
            });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        await Category.deleteOne({ _id: req.params.id });
        res.json({ message: 'Kategori başarıyla silindi' });
    } catch (error) {
        console.error('Kategori silinirken hata:', error);
        res.status(500).json({ message: 'Kategori silinirken bir hata oluştu' });
    }
}; 