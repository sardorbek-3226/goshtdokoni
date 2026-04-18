import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/layout/Navbar";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import WarehousePage from "./pages/warehouse/WarehousePage";
import SalesPage from "./pages/sales/SalesPage";
import ReportsPage from "./pages/reports/ReportsPage"
import DebtsPage from "./pages/debts/DebtsPage"
import ProfilePage from "./pages/profile/ProfilePage"


function App() {
  const isAuthenticated = () => {
    return localStorage.getItem("isLoggedIn") === "true";
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main>{children}</main>
      </div>
    );
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warehouse"
          element={
            <ProtectedRoute>
              <WarehousePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/debts"
          element={
            <ProtectedRoute>
              <DebtsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;