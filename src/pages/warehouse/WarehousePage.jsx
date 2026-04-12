import React, { useState, useEffect } from 'react';
import { PackagePlus, Scale, ChevronDown, TrendingUp, Drumstick, Beef } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiService } from '../../api/api';

const WarehousePage = () => {
  const [products, setProducts] = useState([
    // --- Tovuq mahsulotlari ---
    { id: 1, name: "File", type: "chicken", currentStock: 0 },
    { id: 2, name: "Bedro", type: "chicken", currentStock: 0 },
    { id: 3, name: "Golen", type: "chicken", currentStock: 0 },
    { id: 4, name: "Qanot", type: "chicken", currentStock: 0 },
    { id: 5, name: "Akolachka", type: "chicken", currentStock: 0 },
    { id: 6, name: "Plicho", type: "chicken", currentStock: 0 },
    { id: 7, name: "Krilishka", type: "chicken", currentStock: 0 },
    { id: 8, name: "Katta go'sht", type: "chicken", currentStock: 0 },
    { id: 9, name: "Drakon", type: "chicken", currentStock: 0 },
    { id: 10, name: "Spinka", type: "chicken", currentStock: 0 },
    { id: 11, name: "Po'taka", type: "chicken", currentStock: 0 },
    { id: 12, name: "Jigar (Tovuq)", type: "chicken", currentStock: 0 },
    { id: 13, name: "Gril", type: "chicken", currentStock: 0 },
    { id: 14, name: "Tuxum", type: "chicken", currentStock: 0 },

    // --- Mol go'shti mahsulotlari ---
    { id: 101, name: "Bo'yin", type: "beef", currentStock: 0 },
    { id: 102, name: "Pusti mag'iz", type: "beef", currentStock: 0 },
    { id: 103, name: "Ichki son", type: "beef", currentStock: 0 },
    { id: 104, name: "Son yabliska", type: "beef", currentStock: 0 },
    { id: 105, name: "Son qismi", type: "beef", currentStock: 0 },
    { id: 106, name: "Son o'rta qism", type: "beef", currentStock: 0 },
    { id: 107, name: "Mushtak qism", type: "beef", currentStock: 0 },
    { id: 108, name: "Qo'l qismi", type: "beef", currentStock: 0 },
    { id: 109, name: "Qovurg'a qism", type: "beef", currentStock: 0 },
    { id: 110, name: "Jigar (Mol)", type: "beef", currentStock: 0 },
    { id: 111, name: "Bo'yin qism", type: "beef", currentStock: 0 },
    { id: 112, name: "Til", type: "beef", currentStock: 0 },
  ]);

  const [selectedId, setSelectedId] = useState("");
  const [weight, setWeight] = useState("");

  // --- STATISTIKA HISOBLASH ---
  const totalChicken = products
    .filter(p => p.type === 'chicken')
    .reduce((sum, p) => sum + p.currentStock, 0);

  const totalBeef = products
    .filter(p => p.type === 'beef')
    .reduce((sum, p) => sum + p.currentStock, 0);

// Ombor qoldiqlarini olish
useEffect(() => {
  apiService.getWarehouseStock().then(res => setProducts(res.data));
}, []);

// Yuk qo'shish funksiyasi
// Yuk qo'shish funksiyasi
const handleAddStock = async (e) => {
  e.preventDefault();
  
  // Tekshiruv: agar mahsulot tanlanmagan yoki vazn yozilmagan bo'lsa
  if (!selectedId || !weight) {
    toast.warning("Iltimos, mahsulot va vaznni kiriting!");
    return;
  }

  const data = { product_id: selectedId, weight: parseFloat(weight) };

  try {
    await apiService.addStock(data);
    toast.success("Ombor yangilandi!");
    
    // --- MANA SHU JOYDA FORMANI TOZALAYMIZ ---
    setSelectedId(""); // Tanlangan mahsulotni "Tanlang..." holatiga qaytaradi
    setWeight("");    // Vazn maydonini bo'shatadi
    // ----------------------------------------

    // Ro'yxatni qayta yuklab, yangi qoldiqlarni ko'rsatish
    const res = await apiService.getWarehouseStock();
    setProducts(res.data);
  } catch (err) {
    toast.error("Xatolik yuz berdi!");
  }
};
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Drumstick size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami Tovuq</p>
            <h3 className="text-2xl font-black text-slate-800">{totalChicken.toFixed(1)} <small className="text-xs">kg</small></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Beef size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami Mol Go'shti</p>
            <h3 className="text-2xl font-black text-slate-800">{totalBeef.toFixed(1)} <small className="text-xs">kg</small></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center gap-5 text-white">
          <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Umumiy Ombor</p>
            <h3 className="text-2xl font-black italic">{(totalChicken + totalBeef).toFixed(1)} <small className="text-xs text-white/50">kg</small></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 2. ADD STOCK FORM (LEFT) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl sticky top-24">
            <h2 className="text-xl font-black text-slate-800 mb-6 italic">Yuk Qabul</h2>
            <form onSubmit={handleAddStock} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Mahsulot</label>
                <div className="relative">
                  <select 
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 font-bold text-slate-700 outline-none focus:border-violet-500 appearance-none transition-all"
                  >
                    <option value="">Tanlang...</option>
                    <optgroup label="Tovuq">
                      {products.filter(p => p.type === 'chicken').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </optgroup>
                    <optgroup label="Mol go'shti">
                      {products.filter(p => p.type === 'beef').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-4 top-4.5 text-slate-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Vazn (kg)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-12 font-black text-xl text-slate-800 focus:border-violet-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                  <Scale className="absolute left-4 top-4.5 text-slate-300" size={20} />
                </div>
              </div>

              <button type="submit" className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all uppercase text-xs tracking-widest">
                Kirim qilish
              </button>
            </form>
          </div>
        </div>

        {/* 3. TABLES (RIGHT) */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Tovuq Jadvali */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-violet-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-violet-800 flex items-center gap-2 uppercase tracking-tighter">
                <Drumstick size={20} /> Tovuq Mahsulotlari Qoldig'i
              </h3>
              <span className="text-xs font-black bg-violet-100 text-violet-700 px-3 py-1 rounded-full">{totalChicken.toFixed(1)} kg</span>
            </div>
            <ProductTable items={products.filter(p => p.type === 'chicken')} />
          </div>

          {/* Mol Go'shti Jadvali */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-pink-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-pink-800 flex items-center gap-2 uppercase tracking-tighter">
                <Beef size={20} /> Mol Go'shti Qoldig'i
              </h3>
              <span className="text-xs font-black bg-pink-100 text-pink-700 px-3 py-1 rounded-full">{totalBeef.toFixed(1)} kg</span>
            </div>
            <ProductTable items={products.filter(p => p.type === 'beef')} />
          </div>

        </div>
      </div>
    </div>
  );
};

// Reusable Table Component
const ProductTable = ({ items }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/30">
          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Mahsulot nomi</th>
          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Qoldiq</th>
          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
            <td className="px-8 py-4 font-bold text-slate-700">{item.name}</td>
            <td className="px-8 py-4 text-right">
              <span className="font-black text-slate-900">{item.currentStock.toFixed(1)}</span>
              <span className="ml-1 text-[10px] text-slate-400 font-bold uppercase">kg</span>
            </td>
            <td className="px-8 py-4">
              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${item.currentStock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.currentStock > 5 ? 'Yetarli' : 'Kam'}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WarehousePage;