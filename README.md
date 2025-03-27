# 📊 TrackStock

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"/>
</p>

---

*[English](#-trackstock---inventory-management-system) | [Türkçe](#-trackstock---stok-yönetim-sistemi)*

---

## 📈 TrackStock - Inventory Management System

TrackStock is a comprehensive inventory and stock management application designed for small to medium businesses. The application allows businesses to track their inventory, manage sales, and generate reports with a user-friendly interface.

### 🚀 Features

- **Inventory Management**: Track products, categories, and stock levels
- **Sales Management**: Record and track sales transactions
- **Reporting**: Generate inventory and sales reports
- **WooCommerce Integration**: Sync with your online store
- **Bulk Operations**: Upload and manage products in bulk

### 🛠️ Technologies Used

- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (implied from the project structure)

### 🔧 Installation and Setup

#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

#### Client Setup
```bash
cd client
npm install
npm run dev
```

#### API Setup
```bash
cd api
npm install
npm start
```

### 📝 Environment Variables

The application requires environment variables to be set up in `.env` files:

**Client (.env)**
```
VITE_API_URL=http://localhost:5000
```

**API (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trackstock
JWT_SECRET=your_jwt_secret
```

### 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📈 TrackStock - Stok Yönetim Sistemi

TrackStock, küçük ve orta ölçekli işletmeler için tasarlanmış kapsamlı bir envanter ve stok yönetim uygulamasıdır. Uygulama, işletmelerin envanterlerini takip etmelerini, satışlarını yönetmelerini ve kullanıcı dostu bir arayüzle raporlar oluşturmalarını sağlar.

### 🚀 Özellikler

- **Envanter Yönetimi**: Ürünleri, kategorileri ve stok seviyelerini takip edin
- **Satış Yönetimi**: Satış işlemlerini kaydedin ve takip edin
- **Raporlama**: Envanter ve satış raporları oluşturun
- **WooCommerce Entegrasyonu**: Çevrimiçi mağazanızla senkronize edin
- **Toplu İşlemler**: Ürünleri toplu olarak yükleyin ve yönetin

### 🛠️ Kullanılan Teknolojiler

- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Veritabanı**: MongoDB (proje yapısından anlaşıldığı üzere)

### 🔧 Kurulum ve Ayarlar

#### Gereksinimler
- Node.js (v16 veya üstü)
- npm veya yarn
- MongoDB (yerel veya bulut tabanlı)

#### İstemci Kurulumu
```bash
cd client
npm install
npm run dev
```

#### API Kurulumu
```bash
cd api
npm install
npm start
```

### 📝 Çevre Değişkenleri

Uygulamanın `.env` dosyalarında ayarlanması gereken çevre değişkenleri:

**İstemci (.env)**
```
VITE_API_URL=http://localhost:5000
```

**API (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trackstock
JWT_SECRET=your_jwt_secret
```

### 👥 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen bir Pull Request göndermekten çekinmeyin.

---

<p align="center">
  © 2023 TrackStock. Tüm hakları saklıdır. / All rights reserved.
</p>