import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Warehouse, Users, 
  PieChart, LogOut, User, ShoppingCart, Banknote,
  Search, Bell, ChevronRight
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({isActive}) => `
      group relative flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500
      ${isActive 
        ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)]' 
        : 'text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm'}
    `}
  >
    <Icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
    <span className="hidden lg:block text-[13px] font-black uppercase tracking-[1px]">{label}</span>
    {({isActive}) => isActive && (
      <ChevronRight size={16} className="absolute right-4 hidden lg:block animate-pulse" />
    )}
  </NavLink>
);

export default function MainLayout() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen bg-[#F0F2F5] text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-24 lg:w-72 p-5 sticky top-0 h-screen flex flex-col z-50">
        <div className="bg-white/70 backdrop-blur-2xl border border-white h-full rounded-[35px] shadow-2xl shadow-slate-200/50 flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-12 justify-center lg:justify-start px-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
              <img 
  src="/logo.png" 
  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20 shadow-sm" 
  alt="Logo" 
/>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-black tracking-tighter text-slate-800">MEAT<span className="text-blue-600">POS</span></h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px]"></p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <NavItem to="/" icon={LayoutDashboard} label="Panel" />
              <NavItem to="/products" icon={ShoppingBag} label="Mahsulot" />
              <NavItem to="/warehouse" icon={Warehouse} label="Ombor" />
              <NavItem to="/sales" icon={ShoppingCart} label="Sotuv" />
              <NavItem to="/debts" icon={Users} label="Nasiya" />
              <NavItem to="/cashflow" icon={Banknote} label="Kassa" />
              <div className="py-4"><div className="h-[1px] bg-slate-100 w-full" /></div>
              <NavItem to="/reports" icon={PieChart} label="Hisobot" />
              <NavItem to="/profile" icon={User} label="Profil" />
            </nav>
          </div>

          <div className="mt-auto p-6">
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center lg:justify-start gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group border border-transparent hover:border-rose-100"
            >
              <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden lg:block font-black uppercase text-[12px]">Chiqish</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col p-5 pl-0 lg:pl-0 overflow-hidden">
        <header className="h-20 bg-white/40 backdrop-blur-md rounded-[30px] border border-white/60 mb-6 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4 bg-white/60 px-5 py-2.5 rounded-2xl border border-white shadow-inner">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Tizim bo'ylab qidiruv..." className="bg-transparent outline-none text-sm w-48 lg:w-80 font-medium" />
          </div>
          <div className="flex items-center gap-5">
             <div className="relative p-2.5 bg-white rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </div>
             <div className="h-10 w-[1px] bg-slate-200 mx-2" />
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-black text-slate-800 leading-none">Administrator</p>
                   <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Sifat Broyler</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                   AD
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white/80 backdrop-blur-md rounded-[35px] border border-white p-8 min-h-full shadow-sm">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}