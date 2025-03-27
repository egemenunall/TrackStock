import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Sayfa İçeriği */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
