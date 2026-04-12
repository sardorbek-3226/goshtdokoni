import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  UserCircle, 
  Clock, 
  ShoppingBag,
  BadgeDollarSign
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [period, setPeriod] = useState('bugun');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        apiService.getStats(period),
        apiService.getRecentSales()
      ]);
      setStats(statsRes.data);
      setRecentSales(salesRes.data);
    } catch (error) {
      console.error("Ma'lumot yuklashda xato:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 pt-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Hisobotlar</h1>
          <p className="text-slate-400 text-[10px] font-bold mt-2 tracking-[0.2em]">SAVDO VA FOYDA TAHLILI</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          {['bugun', 'hafta', 'oy'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                period === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* STATS GRID - 5 TA BLOK */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-6 rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${
            stat.title.includes('Foyda') ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-50'
          }`}>
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                stat.title.includes('Foyda') ? 'bg-emerald-500 text-white' :
                stat.title.includes('Karta') ? 'bg-blue-500 text-white' :
                stat.title.includes('Nasiya') ? 'bg-rose-500 text-white' : 
                stat.title.includes('Savdo') ? 'bg-violet-500 text-white' : 'bg-slate-800 text-white'
              }`}>
                {stat.title.includes('Foyda') ? <BadgeDollarSign size={20} /> :
                 stat.title.includes('Karta') ? <CreditCard size={20} /> :
                 stat.title.includes('Nasiya') ? <UserCircle size={20} /> : <TrendingUp size={20} />}
              </div>
              
              <p className={`text-[9px] font-black uppercase tracking-widest ${
                stat.title.includes('Foyda') ? 'text-emerald-600' : 'text-slate-400'
              }`}>{stat.title}</p>
              
              <h3 className={`text-xl font-black mt-1 tracking-tighter ${
                stat.title.includes('Foyda') ? 'text-emerald-700' : 'text-slate-800'
              }`}>
                {stat.value} <small className="text-[10px] font-bold opacity-50 uppercase">uzs</small>
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT SALES TABLE */}
      <div className="mx-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-800">Oxirgi Sotuvlar</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Mijoz / Vaqt</th>
                <th className="px-8 py-5">Mahsulot</th>
                <th className="px-8 py-5 text-right">To'lov va Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-sm">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                        {sale.customer.charAt(0)}
                      </div>
                      <div>
                        <div className="text-slate-800 uppercase tracking-tight">{sale.customer}</div>
                        <div className="text-[10px] text-slate-300 flex items-center gap-1 font-medium italic">
                          <Clock size={10} /> {sale.time}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-slate-500 font-medium max-w-xs truncate uppercase text-[12px]">
                      {sale.product}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-[10px] font-black italic uppercase px-2 py-1 rounded-md ${
                        sale.paymentDisplay.includes('Nasiya') ? 'text-rose-500 bg-rose-50' : 
                        sale.paymentDisplay.includes('Karta') ? 'text-blue-500 bg-blue-50' : 'text-emerald-500 bg-emerald-50'
                      }`}>
                        {sale.paymentDisplay}
                      </span>
                      <span className="text-lg font-black text-slate-900 tracking-tighter">
                        {sale.total} <small className="text-[10px] text-slate-300 uppercase">uzs</small>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}