import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050/api';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    description: "",
    price: "",
    purchasePrice: "",
    stock: 0,
    unit: "adet",
    minStock: 0,
    category: "",
    isActive: true,
    woocommerceId: ""
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      setError("Ürün bilgileri yüklenirken bir hata oluştu");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        purchasePrice: parseFloat(formData.purchasePrice),
        stock: parseInt(formData.stock, 10),
        minStock: parseInt(formData.minStock, 10),
        category: formData.category || null
      };

      await axios.put(`${API_URL}/products/${id}`, productData);
      alert("Ürün başarıyla güncellendi!");
      navigate("/products");
    } catch (error) {
      setError("Ürün güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Ürün Düzenle</h2>

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
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Barkod numarası"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Ürün Adı *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Ürün adı"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Açıklama</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Ürün açıklaması"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Kategori</label>
          <select
            name="category"
            value={formData.category || ""}
            onChange={handleInputChange}
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
              name="price"
              value={formData.price}
              onChange={handleInputChange}
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
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
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
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Minimum Stok</label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleInputChange}
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Birim</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
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
            name="woocommerceId"
            value={formData.woocommerceId || ""}
            onChange={handleInputChange}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="WooCommerce ürün ID'si"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-gray-700">Aktif</label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            İptal
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
