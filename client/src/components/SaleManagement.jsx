import React, { useState, useEffect } from 'react';
import { getSales, cancelSale } from '../utils/api';

const SaleManagement = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Satışları yükle
    const loadSales = async () => {
        try {
            setLoading(true);
            const data = await getSales();
            setSales(data);
            setError(null);
        } catch (err) {
            setError('Satışlar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Satış iptal et
    const handleCancelSale = async () => {
        if (!selectedSale || !cancelReason) return;

        try {
            setLoading(true);
            await cancelSale(selectedSale._id, cancelReason);
            await loadSales(); // Satışları yeniden yükle
            setSelectedSale(null);
            setCancelReason('');
            setError(null);
        } catch (err) {
            setError('Satış iptal edilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleString('tr-TR');
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Satış Yönetimi</h2>

            {/* Hata Mesajı */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* İptal Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Satış İptali</h3>
                        <div className="mb-4">
                            <p><span className="font-semibold">Ürün:</span> {selectedSale.product.name}</p>
                            <p><span className="font-semibold">Miktar:</span> {selectedSale.quantity}</p>
                            <p><span className="font-semibold">Platform:</span> {selectedSale.platform}</p>
                            <p><span className="font-semibold">Tarih:</span> {formatDate(selectedSale.date)}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">İptal Nedeni</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="İptal nedenini yazın..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                disabled={loading}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleCancelSale}
                                className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300"
                                disabled={loading || !cancelReason}
                            >
                                {loading ? 'İptal Ediliyor...' : 'İptal Et'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Satış Tablosu */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Tarih</th>
                            <th className="px-4 py-2">Ürün</th>
                            <th className="px-4 py-2">Platform</th>
                            <th className="px-4 py-2">Miktar</th>
                            <th className="px-4 py-2">Durum</th>
                            <th className="px-4 py-2">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr 
                                key={sale._id} 
                                className={`hover:bg-gray-50 ${sale.isCancelled ? 'bg-red-50' : ''}`}
                            >
                                <td className="border px-4 py-2">{formatDate(sale.date)}</td>
                                <td className="border px-4 py-2">{sale.product.name}</td>
                                <td className="border px-4 py-2">{sale.platform}</td>
                                <td className="border px-4 py-2">{sale.quantity}</td>
                                <td className="border px-4 py-2">
                                    {sale.isCancelled ? (
                                        <span className="text-red-500">İptal Edildi</span>
                                    ) : (
                                        <span className="text-green-500">Aktif</span>
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {!sale.isCancelled && (
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
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
    );
};

export default SaleManagement; 