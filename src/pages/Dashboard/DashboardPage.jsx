import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Hash, // Odamlar o'rniga raqam (sanoq) ikonkasini ishlatamiz
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Receipt, // Xaridlar uchun chek ikonasi
} from "lucide-react";
import { apiService } from "../../api/api";

export default function DashboardPage() {
  // 1. Statelar
  const [statsData, setStatsData] = useState([
    {
      title: "Bugungi Sotuv",
      value: "4,250,000",
      subValue: "+12.5%",
      trend: "up",
      icon: <ShoppingCart size={24} />,
      color: "bg-violet-600",
    },
    {
      title: "Xaridlar Soni",
      value: "48 ta",
      subValue: "+3 ta yangi",
      trend: "up",
      icon: <Receipt size={24} />,
      color: "bg-blue-600",
    }, // O'zgartirilgan qism
    {
      title: "Ombor Qoldig'i",
      value: "850.4 kg",
      subValue: "-50 kg bugun",
      trend: "down",
      icon: <Package size={24} />,
      color: "bg-emerald-600",
    },
    {
      title: "Sof Foyda",
      value: "1,120,000",
      subValue: "+8.2%",
      trend: "up",
      icon: <TrendingUp size={24} />,
      color: "bg-fuchsia-600",
    },
  ]);

  const recentSales = [
    {
      id: 1,
      customer: "Alisher I.",
      product: "File (Tovuq)",
      amount: "5.5 kg",
      total: "176,000",
      time: "10 min oldin",
    },
    {
      id: 2,
      customer: "Jahongir O.",
      product: "Pusti mag'iz",
      amount: "2.0 kg",
      total: "240,000",
      time: "25 min oldin",
    },
    {
      id: 3,
      customer: "Nodir B.",
      product: "Golen",
      amount: "10.0 kg",
      total: "300,000",
      time: "1 soat oldin",
    },
  ];

  // 2. Effektlar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.getStats();
        // Agar backenddan ma'lumot kelsa, statni yangilaymiz
        // setStatsData(res.data);
      } catch (err) {
        console.error("Statistika yuklashda xato:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. STATISTIKA KARTALARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
              >
                {stat.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-black ${
                  stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stat.subValue}
                {stat.trend === "up" ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                {stat.value}
                {stat.title === "Bugungi Sotuv" ||
                stat.title === "Sof Foyda" ? (
                  <span className="text-[10px] text-slate-300 font-bold uppercase ml-1">
                    uzs
                  </span>
                ) : null}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. SOTUV GRAFIKASI O'RNI */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 italic">
              Sotuv Dinamikasi
            </h3>
            <select className="bg-slate-50 border-none outline-none text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl text-slate-500 cursor-pointer">
              <option>Oxirgi 7 kun</option>
              <option>Oxirgi 30 kun</option>
            </select>
          </div>

          <div className="h-[300px] w-full bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <TrendingUp className="text-violet-600" size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                Grafik ma'lumotlari kutilmoqda...
              </p>
            </div>
          </div>
        </div>

        {/* 3. OXIRGI SOTUVLAR */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 italic">
            Oxirgi Sotuvlar
          </h3>
          <div className="space-y-6">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700 group-hover:text-violet-600 transition-colors">
                      {sale.customer}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {sale.product} • {sale.amount}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    {sale.total}{" "}
                    <span className="text-[9px] text-slate-300 uppercase">
                      uzs
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    {sale.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg shadow-slate-200">
            Barcha hisobotlar
          </button>
        </div>
      </div>
    </div>
  );
}
