import { useState, useEffect } from "react";
import { addProduct } from "../utils/api";  // API'ye veri gönderme fonksiyonu
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050/api';

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stock, setStock] = useState(0);
  const [error, setError] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("adet");
  const [minStock, setMinStock] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [woocommerceId, setWoocommerceId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ürün verilerinin doğruluğunu kontrol et
    if (!name || !price || !purchasePrice) {
      setError("Ürün adı, satış fiyatı ve alış fiyatı zorunlu alanlardır.");
      setLoading(false);
      return;
    }

    // Ürünü API'ye gönder
    const productData = {
      barcode,
      name,
      description,
      price: parseFloat(price),
      purchasePrice: parseFloat(purchasePrice),
      stock: parseInt(stock, 10) || 0,
      unit,
      minStock: parseInt(minStock, 10) || 0,
      category: selectedCategory || null,
      woocommerceId: woocommerceId || null
    };

    try {
      await addProduct(productData);  // API'ye gönder
      alert("Ürün başarıyla eklendi!");
      // Formu temizle
      setBarcode("");
      setName("");
      setDescription("");
      setPrice("");
      setPurchasePrice("");
      setStock(0);
      setUnit("adet");
      setMinStock(0);
      setSelectedCategory("");
      setWoocommerceId("");
      setError("");
    } catch (error) {
      setError("Ürün eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Yeni Ürün Ekle</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Barkod</label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Barkod numarası"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Ürün Adı *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Ürün adı"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Ürün açıklaması"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Kategori seçin</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Satış Fiyatı *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Alış Fiyatı *</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Stok Miktarı</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Minimum Stok</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Birim</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="adet">Adet</option>
            <option value="kg">Kilogram</option>
            <option value="lt">Litre</option>
            <option value="mt">Metre</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">WooCommerce ID</label>
          <input
            type="text"
            value={woocommerceId}
            onChange={(e) => setWoocommerceId(e.target.value)}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="WooCommerce ürün ID'si"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Ekleniyor...' : 'Ürün Ekle'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
