const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Tüm kategorileri getir
router.get('/', categoryController.getAllCategories);

// Yeni kategori oluştur
router.post('/', categoryController.createCategory);

// ID'ye göre kategori getir
router.get('/:id', categoryController.getCategoryById);

// Kategori güncelle
router.put('/:id', categoryController.updateCategory);

// Kategori sil
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 