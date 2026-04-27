import React, { useState, useEffect } from 'react';
import { apiService } from '../api/api'; 
import { toast } from 'react-hot-toast';
import { 
  Plus, Trash2, Beef, Loader2, 
  Search, Package, DollarSign, Tag 
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Yangi mahsulot formasi
  const [form, setForm] = useState({ 
    name: '', 
    category: 'Go\'sht', 
    tannarx: '', 
    sotish: '' 
  });

  // Ma'lumotlarni yuklash
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getProducts();
      
      // Agar res.data massiv bo'lsa uni olamiz, aks holda res o'zini massiv deb ko'ramiz
      const data = Array.isArray(res) ? res : (res?.data || []);
      setProducts(data);
    } catch (err) {
      console.error("Yuklashda xato:", err);
      setProducts([]); // Xato bo'lsa bo'sh massiv beramiz, shunda .filter xato bermaydi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // Mahsulot qo'shish
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validatsiya
    if (!form.name || !form.tannarx || !form.sotish) {
      return toast.error("Iltimos, barcha maydonlarni to'ldiring!");
    }

    try {
      await apiService.addProduct(form);
      toast.success("Mahsulot muvaffaqiyatli qo'shildi");
      setForm({ name: '', category: 'Go\'sht', tannarx: '', sotish: '' });
      loadProducts();
    } catch (err) {
      // 400 xatosi bo'lsa api.js tutib oladi
    }
  };

  // Mahsulotni o'chirish
  const handleDelete = async (id) => {
    if (window.confirm("Ushbu mahsulotni o'chirishga aminmisiz?")) {
      try {
        await apiService.deleteProduct(id);
        toast.success("Mahsulot o'chirildi");
        loadProducts();
      } catch (err) {}
    }
  };

  // Qidiruv bo'yicha filtrlash
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  return (
    <div className="p-6 space-y-10 italic font-bold max-w-7xl mx-auto">
      
      {/* 1. Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800 flex items-center gap-3">
            <Package className="text-emerald-500" size={40} /> Mahsulotlar
          </h1>
          <p className="text-gray-400 text-sm uppercase mt-1">Jami: {products.length} turdagi mahsulot</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Mahsulot qidirish..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-[2rem] shadow-sm border-none focus:ring-4 ring-emerald-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Yangi qo'shish formasi */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-emerald-500/20 sticky top-6">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Plus className="text-emerald-500" /> Yangi Mahsulot
            </h2>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-400 ml-2">Nomi</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-emerald-500 transition-all"
                  placeholder="Masalan: Lahm go'sht"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 ml-2">Tannarx</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-emerald-500 transition-all"
                    placeholder="0.00"
                    value={form.tannarx}
                    onChange={e => setForm({...form, tannarx: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-400 ml-2">Sotish</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-emerald-500 transition-all"
                    placeholder="0.00"
                    value={form.sotish}
                    onChange={e => setForm({...form, sotish: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Ro'yxatga qo'shish
              </button>
            </form>
          </div>
        </div>

        {/* 3. Mahsulotlar ro'yxati */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Beef size={24} />
                  </div>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <h3 className="text-lg font-black uppercase text-slate-800 mb-1 truncate">{p.name}</h3>
                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-gray-500 uppercase">{p.category}</span>

                <div className="mt-6 flex justify-between items-end border-t border-dashed pt-4">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase">Sotuv narxi</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                      {p.sotish.toLocaleString()} <span className="text-xs">UZS</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 uppercase">Tannarx</p>
                    <p className="text-sm font-bold text-slate-400 line-through">
                      {p.tannarx.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Dekorativ element */}
                <div className="absolute -right-2 -bottom-2 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform">
                   <Beef size={100} />
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed">
              <Package className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 uppercase">Hech narsa topilmadi</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}