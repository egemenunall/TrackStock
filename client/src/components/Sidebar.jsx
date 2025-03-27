import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Stok Takip</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block p-2 rounded hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/products" className="block p-2 rounded hover:bg-gray-700">
              Ürünler
            </Link>
          </li>
          <li>
            <Link to="/sales" className="block p-2 rounded hover:bg-gray-700">
              Satışlar
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
