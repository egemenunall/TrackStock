import React, { useState, useEffect } from 'react';
import { getProducts, getProductByBarcode } from '../utils/api';

const ProductManagement = () => {
    // ... existing state ...
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // ... existing code ...

    // Barkod ile ürün ara
    const handleBarcodeSearch = async () => {
        if (!barcodeSearch) return;

        try {
            setLoading(true);
            const product = await getProductByBarcode(barcodeSearch);
            setSelectedProduct(product);
            setError(null);
        } catch (err) {
            setError('Ürün bulunamadı');
            setSelectedProduct(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Ürün Yönetimi</h2>

            {/* Barkod Arama */}
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={barcodeSearch}
                    onChange={(e) => setBarcodeSearch(e.target.value)}
                    placeholder="Barkod ile ara..."
                    className="p-2 border rounded"
                />
                <button
                    onClick={handleBarcodeSearch}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
                >
                    {loading ? 'Aranıyor...' : 'Ara'}
                </button>
            </div>

            {/* Hata Mesajı */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Seçili Ürün Detayı */}
            {selectedProduct && (
                <div className="mb-4 p-4 border rounded bg-gray-50">
                    <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <p><span className="font-semibold">Barkod:</span> {selectedProduct.barcode}</p>
                            <p><span className="font-semibold">Fiyat:</span> {selectedProduct.price} TL</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Stok Durumu:</h4>
                            <p>Eczane: {selectedProduct.stock.pharmacy}</p>
                            <p>Farmazon: {selectedProduct.stock.farmazon}</p>
                            <p>WooCommerce: {selectedProduct.stock.woocommerce}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ... existing table code ... */}
        </div>
    );
};

export default ProductManagement; 