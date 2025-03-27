import { useState, useEffect } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from "axios";

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [platformRevenue, setPlatformRevenue] = useState({
    pharmacy: 0,
    farmazon: 0,
    woocommerce: 0
  });
  const [inventoryValue, setInventoryValue] = useState(0);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    // Verileri yükle
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ürünleri ve satışları paralel olarak yükle
        const [productsRes, salesRes] = await Promise.all([
          axios.get("http://localhost:3050/api/products"),
          axios.get("http://localhost:3050/api/sales")
        ]);
        
        const productsData = productsRes.data;
        const salesData = salesRes.data;
        
        setProducts(productsData);
        setSales(salesData);
        
        // Envanter değerini hesapla
        const totalInventoryValue = productsData.reduce((total, product) => {
          return total + (product.price * product.stock);
        }, 0);
        setInventoryValue(totalInventoryValue);
        
        // Platform bazlı ciroyu hesapla
        const platformRev = { pharmacy: 0, farmazon: 0, woocommerce: 0 };
        let total = 0;
        
        salesData.forEach(sale => {
          if (!sale.isCancelled && sale.product) {
            const saleAmount = sale.product.price * sale.quantity;
            platformRev[sale.platform] += saleAmount;
            total += saleAmount;
          }
        });
        
        setPlatformRevenue(platformRev);
        setTotalRevenue(total);
        
        // Son 7 günün satış verilerini hesapla
        const last7Days = getLastDays(7);
        const dailySalesData = last7Days.map(day => {
          const salesInDay = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.toDateString() === day.date.toDateString() && 
                   !sale.isCancelled;
          });
          
          const totalAmount = salesInDay.reduce((total, sale) => {
            return total + (sale.product ? sale.product.price * sale.quantity : 0);
          }, 0);
          
          return {
            date: day.label,
            sales: totalAmount
          };
        });
        
        setDailySales(dailySalesData);

        // En çok satan ürünleri hesapla
        const productSales = {};
        salesData.forEach(sale => {
          if (!sale.isCancelled && sale.product) {
            const productId = sale.product._id;
            if (!productSales[productId]) {
              productSales[productId] = {
                name: sale.product.name,
                totalQuantity: 0,
                totalRevenue: 0
              };
            }
            productSales[productId].totalQuantity += sale.quantity;
            productSales[productId].totalRevenue += sale.product.price * sale.quantity;
          }
        });

        const topProductsList = Object.values(productSales)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5);
        setTopProducts(topProductsList);

        // Son 5 satışı al
        const recentSalesList = salesData
          .filter(sale => !sale.isCancelled)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecentSales(recentSalesList);
        
      } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Son n günü dizi olarak döndür
  const getLastDays = (numDays) => {
    const days = [];
    const currentDate = new Date();
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      
      const dayNames = [
        "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"
      ];
      
      const formattedDate = `${date.getDate()} ${
        ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][date.getMonth()]
      }`;
      
      days.unshift({
        date: date,
        label: `${formattedDate} (${dayNames[date.getDay()]})`
      });
    }
    
    return days;
  };
  
  // Stok düşük ürünleri bul (stok 10'dan az)
  const lowStockProducts = products.filter(product => product.stock < 10);
  
  // Platform bazlı satış verilerini hazırla
  const platformChartData = {
    labels: ['Eczane', 'Farmazon', 'WooCommerce'],
    datasets: [
      {
        label: 'Platform Bazlı Ciro (TL)',
        data: [
          platformRevenue.pharmacy,
          platformRevenue.farmazon,
          platformRevenue.woocommerce
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Günlük satış grafiği verileri
  const dailySalesChartData = {
    labels: dailySales.map(item => item.date),
    datasets: [
      {
        label: 'Günlük Satış (TL)',
        data: dailySales.map(item => item.sales),
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1
      }
    ]
  };
  
  // Stok düşük ürünler grafiği
  const lowStockChartData = {
    labels: lowStockProducts.map(product => product.name),
    datasets: [
      {
        label: 'Kalan Stok',
        data: lowStockProducts.map(product => product.stock),
        backgroundColor: lowStockProducts.map(product => 
          product.stock < 5 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(255, 159, 64, 0.6)'
        ),
        borderColor: lowStockProducts.map(product => 
          product.stock < 5 ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 159, 64, 1)'
        ),
        borderWidth: 1,
      }
    ]
  };

  if (loading) {
    return <div className="text-center mt-8">Yükleniyor...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      {/* Özet Bilgi Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl mb-2">Toplam Ciro</h3>
          <p className="text-3xl font-bold">{totalRevenue.toLocaleString('tr-TR')} TL</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl mb-2">Toplam Ürün</h3>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl mb-2">Envanter Değeri</h3>
          <p className="text-3xl font-bold">{inventoryValue.toLocaleString('tr-TR')} TL</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Günlük Satış Trendi */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Günlük Satış Trendi</h3>
          <div className="h-80">
            <Line 
              data={dailySalesChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Son 7 Gün Satış Grafiği'
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Platform Bazlı Satışlar */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Platform Bazlı Satışlar</h3>
          <div className="h-80">
            <Pie 
              data={platformChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Platform Bazlı Ciro Dağılımı'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Stok Düşük Ürünler */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Stok Düşük Ürünler</h3>
        {lowStockProducts.length === 0 ? (
          <p className="text-green-600 font-medium">Stok seviyesi düşük ürün bulunmuyor.</p>
        ) : (
          <div className="h-80">
            <Bar 
              data={lowStockChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Stok Seviyesi Düşük Ürünler (< 10)'
                  }
                }
              }}
            />
          </div>
        )}
      </div>
      
      {/* Ürün Tablosu */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Ürün Listesi</h3>
        {products.length === 0 ? (
          <p>Veri bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Ürün</th>
                  <th className="border p-2">Fiyat (TL)</th>
                  <th className="border p-2">Stok</th>
                  <th className="border p-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className={product.stock < 5 ? "bg-red-50" : ""}>
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">{product.price}</td>
                    <td className="border p-2">{product.stock}</td>
                    <td className="border p-2">
                      {product.stock === 0 ? (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Tükendi</span>
                      ) : product.stock < 5 ? (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Kritik</span>
                      ) : (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Yeterli</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yeni Eklenen Bölümler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* En Çok Satan Ürünler */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">En Çok Satan Ürünler</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satış Adedi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Ciro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.totalQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.totalRevenue.toLocaleString('tr-TR')} TL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kritik Stok Uyarıları */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Kritik Stok Uyarıları</h3>
          <div className="space-y-4">
            {lowStockProducts.map(product => (
              <div 
                key={product._id} 
                className={`p-4 rounded-lg ${
                  product.stock < 5 ? 'bg-red-100' : 'bg-yellow-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Mevcut Stok: {product.stock} {product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Min. Stok: {product.minStock}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Son Satışlar */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Son Satışlar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(sale.date).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.platform === 'pharmacy' ? 'Eczane' :
                     sale.platform === 'farmazon' ? 'Farmazon' : 'WooCommerce'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.quantity} {sale.product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(sale.product.price * sale.quantity).toLocaleString('tr-TR')} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
