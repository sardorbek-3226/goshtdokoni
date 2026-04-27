import React, { useState, useEffect } from "react";
import { apiService } from "../api/api";
import { toast } from "react-hot-toast";
import { Package, Plus, Search, Loader2, Database, ArrowDownCircle } from "lucide-react";

export default function WarehousePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ productId: "", weight: "" });

  // 1. Ma'lumotlarni yuklash
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getProducts();
      const apiData = Array.isArray(res) ? res : (res?.data || []);
      
      // Sizning kodingizdagi zaxira kaliti: warehouse_backup
      const localStock = JSON.parse(localStorage.getItem("warehouse_backup") || "[]");

      const merged = apiData.map(p => {
        const stockEntry = localStock.find(s => String(s.productId || s.id) === String(p.id));
        return {
          ...p,
          id: String(p.id),
          price: Number(p.price || p.sotish || 0),
          cost: Number(p.cost || p.tannarx || 0),
          currentStock: stockEntry ? Number(stockEntry.currentStock || 0) : 0
        };
      });
      setProducts(merged);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xato!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Omborga yuk qo'shish
  const handleAddStock = (e) => {
    e.preventDefault();
    const weightNum = parseFloat(form.weight);

    if (!form.productId || isNaN(weightNum) || weightNum <= 0) {
      return toast.error("Mahsulotni tanlang va vaznni to'g'ri kiriting!");
    }

    let localStock = JSON.parse(localStorage.getItem("warehouse_backup") || "[]");
    const idx = localStock.findIndex(s => String(s.productId || s.id) === String(form.productId));

    if (idx > -1) {
      localStock[idx].currentStock = Number(localStock[idx].currentStock || 0) + weightNum;
    } else {
      // Agar bu mahsulot zaxirada hali bo'lmasa, yangi obyekt qo'shamiz
      const productInfo = products.find(p => p.id === form.productId);
      localStock.push({ 
        productId: form.productId, 
        currentStock: weightNum,
        name: productInfo?.name 
      });
    }

    localStorage.setItem("warehouse_backup", JSON.stringify(localStock));
    toast.success("Yuk omborga muvaffaqiyatli qo'shildi!");
    setForm({ productId: "", weight: "" });
    loadData();
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 italic font-bold">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-black uppercase flex items-center gap-3">
            <Database className="text-emerald-500" /> Ombor Boshqaruvi
          </h1>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3 text-slate-300" size={18} />
            <input 
              type="text" placeholder="Mahsulotlarni qidirish..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CHAP TOMON: KIRIM FORMASI */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl sticky top-8">
              <h2 className="font-black uppercase italic mb-6 text-sm flex items-center gap-2">
                <ArrowDownCircle size={18} className="text-emerald-500" /> Yangi Kirim
              </h2>
              
              <form onSubmit={handleAddStock} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-slate-400 ml-2">Mahsulotni tanlang</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 font-bold appearance-none"
                    value={form.productId}
                    onChange={e => setForm({...form, productId: e.target.value})}
                  >
                    <option value="">Ro'yxatdan tanlang</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-slate-400 ml-2">Vazni (KG)</label>
                  <input 
                    type="number" step="0.1" placeholder="0.0"
                    className="w-full p-5 bg-slate-50 rounded-3xl outline-none text-center text-2xl font-black focus:border-emerald-500 border-2 border-transparent transition-all"
                    value={form.weight}
                    onChange={e => setForm({...form, weight: e.target.value})}
                  />
                </div>

                <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200">
                  <Plus size={18} /> Yukni qabul qilish
                </button>
              </form>
            </div>
          </div>

          {/* O'NG TOMON: JADVAL */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] uppercase text-slate-400 font-black">
                    <th className="p-6">Mahsulot</th>
                    <th className="p-6 text-center">Narxi (API)</th>
                    <th className="p-6 text-right">Mavjud Zaxira</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="3" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="3" className="p-20 text-center text-slate-300 uppercase text-xs font-black italic">Mahsulot topilmadi</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-all">
                            <Package size={20} />
                          </div>
                          <span className="font-black uppercase text-xs text-slate-700">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="text-[9px] text-rose-400 line-through">T: {Number(p.cost).toLocaleString()}</div>
                        <div className="text-emerald-600 font-black text-sm">{Number(p.price).toLocaleString()} UZS</div>
                      </td>
                      <td className="p-6 text-right">
                        <div className={`inline-block px-5 py-2 rounded-2xl font-black text-xs ${p.currentStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {p.currentStock.toFixed(1)} KG
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}