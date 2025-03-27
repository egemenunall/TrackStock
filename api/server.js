require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const reportRoutes = require('./routes/reportRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productBulkRoutes = require('./routes/productBulkRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Bağlantısı Başarılı"))
  .catch(err => {
      console.error("MongoDB Bağlantı Hatası:", err);
      process.exit(1); // Bağlantı hatası durumunda uygulamayı sonlandırıyoruz
  });

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products/bulk', productBulkRoutes);

// Ana Sayfa
app.get('/', (req, res) => {
    res.send('Stok Takip API Çalışıyor');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Bir hata oluştu!' });
});

// Sunucu başlatma
const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
