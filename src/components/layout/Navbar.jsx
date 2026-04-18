import React from "react"; // Profiler o'chirildi
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
  User, // Profil uchun yangi ikonka
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav className="bg-white border-b border-slate-100 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO VA LINKLAR */}
        <div className="flex items-center gap-8">
          <span className="font-black italic text-xl tracking-tighter uppercase">
            Meat<span className="text-emerald-500">POS</span>
          </span>

          <div className="hidden md:flex gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
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

        {/* O'NG TOMON: PROFIL VA CHIQISH */}
        <div className="flex items-center gap-3">
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

          {/* Chiqish tugmasi */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group"
            title="Chiqish"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
