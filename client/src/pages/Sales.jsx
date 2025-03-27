import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner, FaTrash, FaPlus, FaMinus, FaBarcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getStockReport, getRevenue } from "../utils/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050/api';

const Sales = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductName, setSelectedProductName] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [platform, setPlatform] = useState("pharmacy");
    const [quantity, setQuantity] = useState(1);
    const [saleMessage, setSaleMessage] = useState("");
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Sepet için yeni state'ler
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState(null);

    useEffect(() => {
        loadProducts();
        loadSales();
    }, []);

    // Toplam tutarı hesapla
    useEffect(() => {
        let total = 0;
        cart.forEach(item => {
            const product = products.find(p => p._id === item.product);
            if (product) {
                total += product.price * item.quantity;
            }
        });
        setTotalAmount(total);
    }, [cart, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Ürünler yüklenirken hata:', err);
            setError('Ürünler yüklenirken bir hata oluştu');
            toast.error('Ürünler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Enter tuşuna basıldığında barkod araması yap
        if (e.key === 'Enter') {
            const product = products.find(p => p.barcode === value);
            if (product) {
                addToCart(product);
                setSearchTerm('');
            }
        }
    };

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    };

    const updateQuantity = (productId, change) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.product._id === productId) {
                    const newQuantity = item.quantity + change;
                    if (newQuantity <= 0) {
                        return null;
                    }
                    if (newQuantity > item.product.stock) {
                        toast.warning(`Maksimum ${item.product.stock} adet seçebilirsiniz`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const handleSale = async () => {
        if (cart.length === 0) {
            toast.warning('Sepet boş');
            return;
        }

        setLoading(true);
        let hasError = false;

        try {
            for (const item of cart) {
                try {
                    await axios.post(`${API_URL}/sales`, {
                        product: item.product._id,
                        platform: platform,
                        quantity: item.quantity
                    });
                } catch (err) {
                    console.error('Satış hatası:', err);
                    const errorMessage = err.response?.data?.message || 'Satış işlemi sırasında bir hata oluştu';
                    toast.error(`${item.product.name}: ${errorMessage}`);
                    hasError = true;
                }
            }

            if (!hasError) {
                toast.success('Satış başarıyla tamamlandı');
                setCart([]);
                loadProducts(); // Stok durumunu güncelle
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
    );

    // Arama terimini işle ve sonuçları filtrele
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([]);
            return;
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = products.filter(product => 
            (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) ||
            (product.barcode && product.barcode.toLowerCase().includes(lowerSearchTerm))
        );
        
        setSearchResults(filtered);
    }, [searchTerm, products]);

    // Ürün seçme işlemi
    const handleProductSelect = (product) => {
        setSelectedProduct(product._id);
        setSelectedProductName(product.name);
        setSearchTerm("");
        setSearchResults([]);
    };

    // Satışları yükle
    const loadSales = async () => {
        try {
            const response = await axios.get("http://localhost:3050/api/sales");
            setSales(response.data);
        } catch (err) {
            console.error("Satışlar alınamadı", err);
            setError("Satışlar yüklenirken bir hata oluştu");
        }
    };

    // Raporları güncelle
    const updateReports = async () => {
        try {
            // StockReport sayfasındaki verileri güncelle
            const stockReportEvent = new CustomEvent('updateStockReport');
            window.dispatchEvent(stockReportEvent);

            // Ciro verilerini güncelle
            const revenueEvent = new CustomEvent('updateRevenue');
            window.dispatchEvent(revenueEvent);
        } catch (err) {
            console.error("Raporlar güncellenirken hata oluştu", err);
        }
    };

    // Satış iptal etme modalını aç
    const openCancelModal = (saleId) => {
        setSelectedSaleId(saleId);
        setShowCancelModal(true);
    };

    // Satış iptal etme
    const handleCancelSale = async () => {
        if (!cancelReason.trim()) {
            toast.warning('İptal sebebi belirtmelisiniz');
            return;
        }

        try {
            await axios.post(`${API_URL}/sales/${selectedSaleId}/cancel`, {
                reason: cancelReason
            });
            
            toast.success('Satış başarıyla iptal edildi');
            loadSales();
            loadProducts();
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedSaleId(null);
        } catch (err) {
            console.error('Satış iptal hatası:', err);
            toast.error(err.response?.data?.message || 'Satış iptal edilirken bir hata oluştu');
        }
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Hata!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Satış İşlemleri</h1>
                
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaBarcode className="absolute left-2 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ürün adı veya barkod ile ara..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onKeyPress={handleSearch}
                                className="w-full p-2 pl-8 border rounded"
                            />
                        </div>
                    </div>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="pharmacy">Eczane</option>
                        <option value="farmazon">Farmazon</option>
                        <option value="woocommerce">WooCommerce</option>
                    </select>
                </div>

                {/* Sepet */}
                {cart.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow mb-4">
                        <h2 className="text-xl font-semibold mb-3">Sepet</h2>
                        <div className="space-y-2">
                            {cart.map(item => (
                                <div key={item.product._id} className="flex items-center justify-between p-2 border rounded">
                                    <span className="font-medium">{item.product.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.product._id, -1)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="mx-2">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product._id, 1)}
                                            className="p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <FaPlus />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="ml-2 p-1 text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleSale}
                            disabled={loading}
                            className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin inline mr-2" />
                            ) : null}
                            Satışı Tamamla
                        </button>
                    </div>
                )}

                {/* Ürün Listesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading && !cart.length ? (
                        <div className="col-span-full flex justify-center items-center">
                            <FaSpinner className="animate-spin text-4xl text-blue-500" />
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <div
                                key={product._id}
                                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-600">Barkod: {product.barcode}</p>
                                <p className="text-sm text-gray-600">Stok: {product.stock}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="mt-2 bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Sepete Ekle
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Satış Geçmişi */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Satış Geçmişi</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 text-left">Ürün</th>
                                <th className="py-2 px-4 text-left">Platform</th>
                                <th className="py-2 px-4 text-left">Miktar</th>
                                <th className="py-2 px-4 text-left">Tarih</th>
                                <th className="py-2 px-4 text-left">Durum</th>
                                <th className="py-2 px-4 text-left">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale._id} className="border-t">
                                    <td className="py-2 px-4">{sale.product.name}</td>
                                    <td className="py-2 px-4">{sale.platform}</td>
                                    <td className="py-2 px-4">{sale.quantity}</td>
                                    <td className="py-2 px-4">
                                        {new Date(sale.date).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="py-2 px-4">
                                        {sale.isCancelled ? (
                                            <span className="text-red-500">İptal Edildi</span>
                                        ) : (
                                            <span className="text-green-500">Aktif</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4">
                                        {!sale.isCancelled && (
                                            <button
                                                onClick={() => openCancelModal(sale._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                İptal Et
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* İptal Modalı */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Satış İptal</h3>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="İptal sebebini yazın..."
                            className="w-full p-2 border rounded mb-4"
                            rows="3"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setSelectedSaleId(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleCancelSale}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                İptal Et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
