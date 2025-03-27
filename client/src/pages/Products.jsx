import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // yönlendirme için

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // sayfalar arası yönlendirme için

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Kategoriler yüklenemedi", err);
    }
  };

  // Ürünleri yükle
  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error("Ürünler alınamadı", err);
      setError("Ürünler yüklenirken bir hata oluştu");
    }
  };

  // Barkod ile ürün ara
  const handleBarcodeSearch = async () => {
    if (!barcodeSearch) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/barcode/${barcodeSearch}`);
      setSelectedProduct(response.data);
      setError(null);
    } catch (err) {
      console.error("Ürün bulunamadı", err);
      setError("Ürün bulunamadı");
      setSelectedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(products.filter(product => product._id !== id));
      if (selectedProduct && selectedProduct._id === id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error("Ürün silinirken hata oluştu", err);
      setError("Ürün silinirken bir hata oluştu");
    }
  };

  const handleAddProduct = () => {
    navigate("/addproduct"); // AddProduct sayfasına yönlendir
  };

  const handleUpdateProduct = (id) => {
    navigate(`/updateproduct/${id}`); // Ürün güncelleme sayfasına yönlendir
  };

  // Filtrelenmiş ürünleri getir
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesName = !nameSearch || 
        product.name.toLowerCase().includes(nameSearch.toLowerCase());
      return matchesCategory && matchesName;
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ürünler</h2>
        <button
          onClick={handleAddProduct}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Barkod Arama */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barkod ile Ara
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                placeholder="Barkod..."
                className="border p-2 rounded-lg flex-grow"
              />
              <button
                onClick={handleBarcodeSearch}
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Aranıyor...' : 'Ara'}
              </button>
            </div>
          </div>

          {/* İsim ile Arama */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İsim ile Ara
            </label>
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Ürün adı..."
              className="border p-2 rounded-lg w-full"
            />
          </div>
        </div>

        {/* Kategori Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategoriye Göre Filtrele
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border p-2 rounded-lg w-full"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Seçili Ürün Detayı */}
      {selectedProduct && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">{selectedProduct.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Barkod: {selectedProduct.barcode || "Yok"}</p>
              <p className="text-gray-600">Fiyat: {selectedProduct.price} TL</p>
              <p className="text-gray-600">Alış Fiyatı: {selectedProduct.purchasePrice} TL</p>
              <p className="text-gray-600">WooCommerce ID: {selectedProduct.woocommerceId || "Yok"}</p>
            </div>
            <div>
              <p className="text-gray-600">Stok: {selectedProduct.stock}</p>
              <p className="text-gray-600">Minimum Stok: {selectedProduct.minStock}</p>
              <p className="text-gray-600">Birim: {selectedProduct.unit}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleUpdateProduct(selectedProduct._id)}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Güncelle
            </button>
            <button
              onClick={() => handleDelete(selectedProduct._id)}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Sil
            </button>
          </div>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getFilteredProducts().map(product => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-500">Barkod: {product.barcode || "Yok"}</p>
            <p className="text-gray-500">Fiyat: {product.price} TL</p>
            <p className="text-gray-500">Alış Fiyatı: {product.purchasePrice} TL</p>
            <p className="text-gray-500">Stok: {product.stock}</p>
            <p className="text-gray-500">Birim: {product.unit}</p>
            <p className="text-gray-500">WooCommerce ID: {product.woocommerceId || "Yok"}</p>
            <p className="text-gray-500">
              Kategori: {categories.find(c => c._id === product.category)?.name || "Kategorisiz"}
            </p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleUpdateProduct(product._id)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Güncelle
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
