import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { ShoppingCart, Plus, Scale, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [amounts, setAmounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    apiService.getWarehouseStock().then(res => setProducts(res.data));
  }, []);

  const addToCart = (p) => {
    // 1. Miqdorni tekshirish
    const qty = parseFloat(amounts[p.id]);
    if (!qty || qty <= 0) {
      toast.error("Miqdorni kiriting!");
      return;
    }
  
    // 2. Omborda borligini tekshirish
    if (qty > p.currentStock) {
      toast.error("Omborda yetarli mahsulot yo'q!");
      return;
    }
  
    // 3. Savatni yuklash (yoki bo'sh massiv)
    let cart = JSON.parse(localStorage.getItem("active_cart") || "[]");
    
    // 4. Savatda bu mahsulot bor-yo'qligini tekshirish
    const existingItemIndex = cart.findIndex(item => item.id === p.id);
  
    if (existingItemIndex > -1) {
      // Agar bo'lsa, miqdorini oshiramiz
      cart[existingItemIndex].qty += qty;
    } else {
      // Agar bo'lmasa, yangi ob'ekt qo'shamiz (tannarxi bilan!)
      cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        cost: p.cost, // SOF FOYDA UCHUN MUHIM
        qty: qty,
        type: p.type
      });
    }
  
    // 5. Saqlash va tozalash
    localStorage.setItem("active_cart", JSON.stringify(cart));
    setAmounts({ ...amounts, [p.id]: "" }); // Inputni tozalash
    toast.success(`${p.name} savatga qo'shildi!`);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-slate-800">Vitrina</h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Mahsulot tanlash va savatga qo'shish</p>
        </div>
        <button onClick={() => navigate("/sales")} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-transform">
          <ShoppingCart size={20} /> Savatni ko'rish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${p.type === 'beef' ? 'bg-rose-50 text-rose-500' : 'bg-violet-50 text-violet-500'}`}>
                {p.type === 'beef' ? 'Mol' : 'Tovuq'}
              </span>
              <span className={`text-[10px] font-bold ${p.currentStock <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                Zaxira: {p.currentStock.toFixed(1)} kg
              </span>
            </div>
            
            <h4 className="font-black text-slate-800 text-lg leading-tight h-12">{p.name}</h4>
            <p className="text-slate-900 font-black text-xl mb-6">{p.price.toLocaleString()} <small className="text-xs text-slate-400 uppercase font-bold">uzs</small></p>
            
            <div className="relative mb-3">
              <input 
                type="number" placeholder="Kg..." value={amounts[p.id] || ""}
                onChange={(e) => setAmounts({...amounts, [p.id]: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-center focus:ring-2 ring-slate-100 transition-all"
              />
              <Scale size={16} className="absolute left-4 top-4 text-slate-300" />
            </div>

            <button 
              disabled={p.currentStock <= 0}
              onClick={() => addToCart(p)} 
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                p.currentStock > 0 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Plus size={18} /> {p.currentStock > 0 ? "Qo'shish" : "Yo'q"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}