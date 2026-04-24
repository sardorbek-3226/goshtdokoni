import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Boxes,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  UserCircle,
  Menu, // Burger menu uchun
  X,    // Yopish tugmasi uchun
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobil menyu holati

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const navLinks = [
    { name: "Asosiy", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Mahsulotlar", path: "/products", icon: <Boxes size={18} /> },
    { name: "Ombor", path: "/warehouse", icon: <Package size={18} /> },
    { name: "Sotuv", path: "/sales", icon: <ShoppingCart size={18} /> },
    { name: "Nasiya", path: "/debts", icon: <Users size={18} /> },
    { name: "Hisobotlar", path: "/reports", icon: <BarChart3 size={18} /> },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO VA KOMPYUTER UCHUN LINKLAR */}
        <div className="flex items-center gap-8">
          <img 
            src="/logo.png" 
            alt="Sifat Broyler Logo"
            className="h-10 md:h-12 w-auto object-contain cursor-pointer transition duration-300 hover:scale-105"
          />
          
          {/* Desktop Menu (faqat md ekrandan kattada ko'rinadi) */}
          <div className="hidden lg:flex gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  location.pathname === item.path
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* O'NG TOMON: PROFIL, CHIQISH VA BURGER */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Profil bo'limi */}
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
          >
            <UserCircle size={20} className="text-emerald-500" />
            <span className="hidden sm:inline text-xs font-bold uppercase">
              Profil
            </span>
          </Link>

          {/* Chiqish tugmasi (Desktopda ko'rinadi) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
            title="Chiqish"
          >
            <LogOut size={20} />
          </button>

          {/* Burger Menu Button (Faqat mobil va planshetda) */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBIL MENYU (Drawer) */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Bosilganda menyu yopiladi
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest ${
                  location.pathname === item.path
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 bg-slate-50"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50"
            >
              <LogOut size={18} /> Chiqish
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}