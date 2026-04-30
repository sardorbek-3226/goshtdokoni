import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  Download,
  Calendar
} from 'lucide-react';

const CashFlowPage = () => {
  // LocalStorage bilan ishlash
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('meatpos_cash_v2');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('income');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('meatpos_cash_v2', JSON.stringify(transactions));
  }, [transactions]);

  // Hisob-kitoblar
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = (e) => {
    e.preventDefault();
    if(!amount || !description) return;
    const newT = { 
      id: Date.now(), 
      amount: Number(amount), 
      description, 
      type, 
      date: new Date().toLocaleString('uz-UZ', { hour12: false }) 
    };
    setTransactions([newT, ...transactions]);
    setAmount(''); 
    setDescription('');
  };

  const deleteItem = (id) => {
    if(window.confirm("Ushbu amalni o'chirmoqchimisiz?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kassa <span className="text-blue-600">Nazorati</span></h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Barcha kirim va chiqimlarni real vaqtda boshqaring</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={16} /> Bugun
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[35px] text-white shadow-2xl shadow-slate-200 group transition-transform hover:scale-[1.01]">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <Wallet size={24} className="text-blue-400" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[3px] text-slate-400">Umumiy qoldiq</p>
            <h3 className="text-4xl font-black mt-2 tracking-tighter tabular-nums">
              {balance.toLocaleString()} <span className="text-lg font-medium opacity-50 font-sans tracking-normal">UZS</span>
            </h3>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-8 rounded-[35px] border border-slate-50 shadow-xl shadow-slate-200/40 flex items-center gap-6 group transition-all hover:border-blue-100">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Jami Kirim</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1 tabular-nums">+{totalIncome.toLocaleString()}</h4>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-8 rounded-[35px] border border-slate-50 shadow-xl shadow-slate-200/40 flex items-center gap-6 group transition-all hover:border-blue-100">
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Jami Chiqim</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1 tabular-nums">-{totalExpense.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* 3. INPUT FORM (GLASS UI) */}
      <div className="bg-white/60 backdrop-blur-md p-2 rounded-[40px] border border-white shadow-sm">
        <div className="bg-white p-6 lg:p-8 rounded-[35px] shadow-inner border border-slate-50">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Amal turi</label>
              <select 
                value={type} 
                onChange={(e)=>setType(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 font-bold text-sm outline-none transition-all appearance-none"
              >
                <option value="income">💰 Kirim (Kirim qilish)</option>
                <option value="expense">💸 Chiqim (Harajat)</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Summa (UZS)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e)=>setAmount(e.target.value)} 
                placeholder="0.00" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 font-bold text-sm outline-none transition-all" 
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Batafsil izoh</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e)=>setDescription(e.target.value)} 
                placeholder="Nima uchun? (masalan: Go'sht sotuvi)" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 font-bold text-sm outline-none transition-all" 
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus size={20} strokeWidth={3} /> QO'SHISH
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. TRANSACTIONS TABLE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
           <h3 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
             <Filter size={20} className="text-blue-600" /> Tarixiy harakatlar
           </h3>
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Tranzaksiyalardan qidirish..." 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)} 
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium" 
              />
           </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] bg-slate-50/50">
                  <th className="px-10 py-6">Vaqt va Sana</th>
                  <th className="px-10 py-6">Izoh</th>
                  <th className="px-10 py-6 text-center">Turi</th>
                  <th className="px-10 py-6 text-right">Miqdor</th>
                  <th className="px-10 py-6 text-center">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions
                  .filter(t => t.description.toLowerCase().includes(search.toLowerCase()))
                  .map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="text-[11px] font-bold text-slate-400 bg-slate-50 inline-block px-3 py-1 rounded-lg">
                        {t.date}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-black text-slate-700 uppercase italic tracking-wide">
                        {t.description}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        t.type === 'income' 
                        ? 'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-100' 
                        : 'bg-rose-100 text-rose-600 shadow-sm shadow-rose-100'
                      }`}>
                        {t.type === 'income' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </td>
                    <td className={`px-10 py-6 text-right font-black text-lg tabular-nums ${
                      t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button 
                        onClick={() => deleteItem(t.id)} 
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Wallet size={32} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">Hozircha hech qanday ma'lumot yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowPage;