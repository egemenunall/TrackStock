const express = require('express');
const router = express.Router();
const multer = require('multer');
const productBulkController = require('../controllers/productBulkController');

// Multer ayarları
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Sadece CSV dosyaları yüklenebilir'));
        }
    }
});

router.post('/upload', upload.single('file'), productBulkController.uploadProducts);
router.get('/template', productBulkController.downloadTemplate);

module.exports = router; 