import { useState, useEffect } from "react";
import { getStockReport, getDailySales, getRevenue, getSales } from "../utils/api";

const StockReport = () => {
  const [stockReport, setStockReport] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Veri yükleme fonksiyonu
  const fetchData = async () => {
    setLoading(true);
    try {
      const stockData = await getStockReport();
      setStockReport(stockData);

      const revenueData = await getRevenue();
      setTotalRevenue(revenueData.totalRevenue);

      if (selectedDate) {
        const salesData = await getDailySales(selectedDate);
        setDailySales(salesData);
      }
    } catch (error) {
      setError("Veri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme ve event listener'ları ekle
  useEffect(() => {
    fetchData();

    // Event listener'ları ekle
    const handleStockUpdate = () => fetchData();
    const handleRevenueUpdate = () => fetchData();

    window.addEventListener('updateStockReport', handleStockUpdate);
    window.addEventListener('updateRevenue', handleRevenueUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('updateStockReport', handleStockUpdate);
      window.removeEventListener('updateRevenue', handleRevenueUpdate);
    };
  }, []);

  // Seçili tarih değiştiğinde satışları güncelle
  useEffect(() => {
    if (selectedDate) {
      fetchSales();
    }
  }, [selectedDate]);

  // Günlük satış raporunu çekme fonksiyonu
  const fetchSales = async () => {
    setLoading(true);
    try {
      const salesData = selectedDate
        ? await getDailySales(selectedDate)
        : await getSales();

      setDailySales(salesData);
      setError("");
    } catch (error) {
      setError("Satış verisi alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Tarih formatla
  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Stok ve Satış Raporu</h2>

      {/* Hata mesajı */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Toplam Ciro */}
      <div className="mb-4 p-4 bg-green-100 border rounded">
        <h3 className="text-xl font-semibold">Toplam Ciro</h3>
        <p className="text-lg font-bold">{totalRevenue.toFixed(2)} TL</p>
      </div>

      {/* Stok Raporu */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Stok Durumu</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : stockReport.length === 0 ? (
          <p>Stok verisi bulunamadı.</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Ürün</th>
                <th className="border p-2">Stok</th>
                <th className="border p-2">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {stockReport.map(product => (
                <tr key={product._id}>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.stock}</td>
                  <td className="border p-2">{product.price} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Günlük Satış Raporu */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Günlük Satışlar</h3>
        <input
          type="date"
          className="border p-2 mb-2"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <button
          onClick={fetchSales}
          className="bg-blue-500 text-white p-2 ml-2 rounded"
          disabled={loading} // Yüklenirken buton devre dışı bırakılır
        >
          Rapor Getir
        </button>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : dailySales.length === 0 ? (
          <p>Belirtilen tarihte satış verisi bulunamadı.</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Ürün</th>
                <th className="border p-2">Adet</th>
                <th className="border p-2">Platform</th>
                <th className="border p-2">Tarih</th>
                <th className="border p-2">Durum</th>
                <th className="border p-2">İptal Bilgileri</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map(sale => (
                <tr 
                  key={sale._id}
                  className={sale.isCancelled ? "bg-red-50" : ""}
                >
                  <td className="border p-2">{sale.product.name}</td>
                  <td className="border p-2">{sale.quantity}</td>
                  <td className="border p-2">{sale.platform}</td>
                  <td className="border p-2">{formatDate(sale.date)}</td>
                  <td className="border p-2">
                    {sale.isCancelled ? (
                      <span className="text-red-500 font-medium">İptal Edildi</span>
                    ) : (
                      <span className="text-green-500 font-medium">Aktif</span>
                    )}
                  </td>
                  <td className="border p-2">
                    {sale.isCancelled && (
                      <div>
                        <p><span className="font-semibold">İptal Tarihi:</span> {formatDate(sale.cancelledAt)}</p>
                        {sale.cancelReason && (
                          <p><span className="font-semibold">İptal Nedeni:</span> {sale.cancelReason}</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockReport;
