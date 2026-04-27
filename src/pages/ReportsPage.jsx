import React, { useEffect, useState } from "react";
import { 
  BarChart3, Calendar, Download, ArrowUpCircle, 
  ArrowDownCircle, ShoppingBag, CreditCard, Wallet, UserCheck 
} from "lucide-react";

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("today"); 

  useEffect(() => {
    // Ma'lumotlarni olishda xatolikni tekshirish
    try {
      const salesData = JSON.parse(localStorage.getItem("sales_history") || "[]");
      const paymentsData = JSON.parse(localStorage.getItem("payment_history") || "[]");
      setSales(Array.isArray(salesData) ? salesData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      console.error("LocalStorage o'qishda xato:", err);
      setSales([]);
      setPayments([]);
    }
  }, []);

  // Filtrlash mantiqi
  const getFilteredData = (data) => {
    if (!Array.isArray(data)) return [];
    const now = new Date();
    return data.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      if (filter === "today") return itemDate.toDateString() === now.toDateString();
      if (filter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return itemDate.toDateString() === yesterday.toDateString();
      }
      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return itemDate >= weekAgo;
      }
      return true;
    });
  };

  const filteredSales = getFilteredData(sales);
  const filteredPayments = getFilteredData(payments);

  // Xavfsiz hisob-kitob (Number() va || 0 ishlatilgan)
  const stats = {
    totalSales: filteredSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    totalProfit: filteredSales.reduce((sum, s) => sum + Number(s.profit || 0), 0),
    cashSales: filteredSales.filter(s => s.paymentMethod === "naqd").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    cardSales: filteredSales.filter(s => s.paymentMethod === "karta").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    debtSales: filteredSales.filter(s => s.paymentMethod === "nasiya").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    receivedDebts: filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 italic font-bold text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-2xl font-black uppercase italic">Hisobotlar</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {[
              { id: "today", name: "Bugun" },
              { id: "yesterday", name: "Kecha" },
              { id: "week", name: "Hafta" }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-6 py-2.5 rounded-xl uppercase text-[10px] font-black transition-all ${filter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl">
            <p className="text-[10px] uppercase text-slate-500 mb-1">Umumiy Savdo</p>
            <h2 className="text-3xl font-black">{stats.totalSales.toLocaleString()} UZS</h2>
            <div className="mt-4 flex gap-4 text-[9px] opacity-70">
              <span className="flex items-center gap-1"><Wallet size={12}/> Naqd: {stats.cashSales.toLocaleString()}</span>
              <span className="flex items-center gap-1"><CreditCard size={12}/> Karta: {stats.cardSales.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
            <p className="text-[10px] uppercase text-slate-400 mb-1">Sof Foyda</p>
            <h2 className="text-3xl font-black text-emerald-600">{stats.totalProfit.toLocaleString()} UZS</h2>
            <p className="text-[9px] mt-2 text-emerald-500 italic uppercase">Tannarxdan tashqari</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
            <p className="text-[10px] uppercase text-slate-400 mb-1">Undirilgan qarzlar</p>
            <h2 className="text-3xl font-black text-blue-600">{stats.receivedDebts.toLocaleString()} UZS</h2>
            <p className="text-[9px] mt-2 text-blue-400 uppercase italic">Kassaga kirgan qarz pullari</p>
          </div>
        </div>

        {/* DETAILS TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SAVDO TARIXI RO'YXATI */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
              <ShoppingBag className="text-emerald-500" /> Savdo Tarixi
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredSales.length === 0 ? <p className="text-center py-10 text-slate-300 uppercase text-[10px]">Ma'lumot yo'q</p> : 
                [...filteredSales].reverse().map((sale, index) => (
                  <div key={sale.id || index} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="text-xs font-black uppercase">{sale.customerName || "Noma'lum"}</p>
                      <p className="text-[9px] text-slate-400 uppercase">
                        {(sale.paymentMethod || "naqd")} • {sale.date ? new Date(sale.date).toLocaleTimeString() : "--:--"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">
                        {(sale.totalAmount || 0).toLocaleString()} UZS
                      </p>
                      <p className="text-[9px] text-emerald-500">
                        +{(sale.profit || 0).toLocaleString()} foyda
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* QARZ TO'LOVLARI RO'YXATI */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
              <UserCheck className="text-blue-500" /> Undirilgan qarzlar
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredPayments.length === 0 ? <p className="text-center py-10 text-slate-300 uppercase text-[10px]">Ma'lumot yo'q</p> : 
                [...filteredPayments].reverse().map((pay, index) => (
                  <div key={pay.id || index} className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><ArrowDownCircle size={16}/></div>
                      <div>
                        <p className="text-xs font-black uppercase">{pay.customerName || "Noma'lum"}</p>
                        <p className="text-[9px] text-blue-400 uppercase">
                          {pay.date ? new Date(pay.date).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-blue-600">
                      +{(pay.amount || 0).toLocaleString()} UZS
                    </p>
                  </div>
                ))
              }
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}