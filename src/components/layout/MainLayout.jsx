import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Warehouse, Users, PieChart, LogOut, User, ShoppingCart } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({isActive}) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold italic ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
  >
    <Icon size={20} />
    <span className="hidden lg:block text-sm uppercase">{label}</span>
  </NavLink>
);

export default function MainLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user_token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <aside className="w-24 lg:w-72 bg-white border-r border-gray-100 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div className="space-y-2">
          <div className="text-2xl font-black italic text-blue-600 mb-10 text-center lg:text-left">MeatPOS</div>
          <nav className="space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Panel" />
            <NavItem to="/products" icon={ShoppingBag} label="Mahsulotlar" />
            <NavItem to="/warehouse" icon={Warehouse} label="Ombor" />
            <NavItem to="/sales" icon={ShoppingCart} label="Sotuv" />
            <NavItem to="/debts" icon={Users} label="Nasiya" />
            <NavItem to="/reports" icon={PieChart} label="Hisobot" />
            <NavItem to="/profile" icon={User} label="Profil" />
          </nav>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all font-bold italic uppercase text-sm"
        >
          <LogOut size={20} /> <span className="hidden lg:block">Chiqish</span>
        </button>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}