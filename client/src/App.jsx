import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import StockReport from "./pages/StockReport"; // Yeni sayfa
import AddProduct from "./pages/AddProduct";
import UpdateProduct from "./pages/UptadeProduct"; // Yeni sayfa
import InventoryList from "./pages/InventoryList"; // Stok sayımı listesi
import InventoryCount from "./pages/InventoryCount"; // Stok sayımı detayı
import Categories from './pages/Categories';
import ProductBulkUpload from './pages/ProductBulkUpload';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="text-white">Dashboard</a>
            </li>
            <li>
              <a href="/sales" className="text-white">Sales</a>
            </li>
            <li>
              <a href="/products" className="text-white">Products</a>
            </li>
            <li>
              <a href="/stock-report" className="text-white">Stock Report</a>
            </li>
            <li>
              <a href="/inventory" className="text-white">Stok Sayımı</a>
            </li>
            <li>
              <a href="/categories" className="text-white">Kategoriler</a>
            </li>
            <li>
              <a href="/products/bulk-upload" className="text-white">Toplu Ürün Yükleme</a>
            </li>
          </ul>
        </nav>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stock-report" element={<StockReport />} />
            <Route path="/addproduct" element={<AddProduct />} />
            <Route path="/updateproduct/:id" element={<UpdateProduct />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/:id" element={<InventoryCount />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products/bulk-upload" element={<ProductBulkUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
