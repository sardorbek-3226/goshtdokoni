import React, { useState, useEffect } from 'react';
import { 
  Bell, Menu, X, User, Package, LogOut, 
  LayoutDashboard, ShoppingCart, BarChart3, 
  Boxes // Mahsulotlar uchun ikonka
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { apiService } from '../../api/api';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Omborni tekshirish
  useEffect(() => {
    const checkStock = async () => {
      try {
        const res = await apiService.getProducts();
        const lowItems = res.data.filter(p => p.currentStock < 5);
        setLowStockProducts(lowItems);
      } catch (err) { console.error(err); }
    };
    checkStock();
  }, [location.pathname]);

  // NAVIGATSIYA LINKLARI (Mahsulotlar bo'limi qo'shildi)
  const navLinks = [
    { name: "Asosiy", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Mahsulotlar", path: "/products", icon: <Boxes size={18} /> }, // Qaytarildi
    { name: "Ombor", path: "/warehouse", icon: <Package size={18} /> },
    { name: "Sotuv", path: "/sales", icon: <ShoppingCart size={18} /> },
    { name: "Hisobotlar", path: "/reports", icon: <BarChart3 size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
            <Package size={22} />
          </div>
          <span className="text-xl font-black text-slate-800 uppercase hidden sm:block">
            Go'sht<span className="text-violet-600">Pro</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                location.pathname === link.path 
                ? "bg-violet-600 text-white shadow-md shadow-violet-200" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {link.icon} {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          {/* Notification */}
          <div className="relative group">
            <button className="p-2.5 text-slate-400 hover:text-violet-600 bg-slate-50 rounded-xl transition-all">
              <Bell size={20} />
              {lowStockProducts.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            {/* Dropdown list (qoldiqlar uchun) */}
            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-4 hidden group-hover:block animate-in fade-in zoom-in duration-200">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-3 px-2">Xabarnomalar</p>
               <div className="space-y-2 max-h-48 overflow-y-auto">
                 {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                   <div key={p.id} className="p-2.5 bg-rose-50 rounded-xl flex justify-between items-center border border-rose-100">
                      <span className="text-[11px] font-black text-slate-700">{p.name}</span>
                      <span className="text-[10px] font-black text-rose-600">{p.currentStock} kg</span>
                   </div>
                 )) : <p className="text-[10px] text-slate-400 text-center py-4 font-bold uppercase">Hammasi joyida</p>}
               </div>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden md:block"></div>

          {/* Profile */}
          <Link to="/profile" className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-2xl transition-all">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-xs font-black text-slate-800 tracking-tighter">Alisher I.</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
              <User size={20} className="text-slate-400" />
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden p-2.5 text-slate-600 bg-slate-50 rounded-xl"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-6 absolute w-full shadow-2xl z-50 animate-in slide-in-from-top">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-4 p-4 rounded-2xl font-black text-[12px] uppercase tracking-wider transition-all ${
                  location.pathname === link.path 
                  ? "bg-violet-600 text-white" 
                  : "bg-slate-50 text-slate-600 active:bg-slate-100"
                }`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
            <div className="h-[1px] bg-slate-100 my-2"></div>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-rose-50 text-rose-600 font-black text-[12px] uppercase tracking-wider"
            >
              <LogOut size={18} /> Chiqish
            </button>
          </div>
        </div>
      )}
    </header>
  );
}