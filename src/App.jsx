import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// React Toastify importlari
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Komponentlarni import qilish
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import WarehousePage from "./pages/warehouse/WarehousePage";
import SalesPage from "./pages/sales/SalesPage";

function App() {
  // Demo rejimida barcha sahifalar ochiq
  const isAuthenticated = true;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Bildirishnomalar uchun Container */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {/* Navbar faqat login bo'lganda ko'rinadi */}
        {isAuthenticated && <Navbar />}

        <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/sales" element={<SalesPage />} />

            {/* Noto'g'ri link yozilsa, Dashboardga qaytaradi */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
