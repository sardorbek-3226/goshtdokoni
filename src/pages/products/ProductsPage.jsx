import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ShoppingCart, Info, Layers, 
  Minus, CheckCircle2 
} from "lucide-react";
import { apiService } from '../../api/api';
import { useCart } from "../../context/CartContext";
import { toast } from 'react-toastify';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hammasi");
  
  // Har bir mahsulot uchun alohida miqdor (weight) saqlash
  const [quantities, setQuantities] = useState({});

  const { addToCart } = useCart();

  useEffect(() => {
    apiService.getProducts().then(res => {
      setProducts(res.data);
      // Boshlang'ich miqdorlarni 1kg qilib sozlash
      const initialQtys = {};
      res.data.forEach(p => initialQtys[p.id] = 1);
      setQuantities(initialQtys);
    });
  }, []);

  // Miqdorni o'zgartirish funksiyasi
  const updateQty = (id, val) => {
    const newQty = Math.max(0.1, (quantities[id] || 1) + val);
    setQuantities(prev => ({ ...prev, [id]: parseFloat(newQty.toFixed(1)) }));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Hammasi" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Hammasi", "Mol", "Tovuq", "Qo'y", "Dushaki"];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Mahsulotlar Vitrinasi</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sifatli va yangi go'sht mahsulotlari</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Mahsulot nomi bo'yicha qidirish..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-violet-500/10 transition-all outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              selectedCategory === cat 
              ? "bg-slate-900 text-white shadow-xl scale-105" 
              : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
            
            {/* Top part: Info */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {product.category}
                </span>
                {product.currentStock < 5 && (
                  <span className="bg-rose-50 text-rose-500 text-[8px] font-black px-2 py-1 rounded-md animate-pulse">KAM QOLDI</span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{product.name}</h3>
              <p className="text-xs font-bold text-slate-400 italic">Omborda: {product.currentStock} kg</p>
            </div>

            {/* Middle part: Price */}
            <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Narxi (1kg)</p>
                <p className="text-lg font-black text-slate-900 tracking-tighter">{product.price.toLocaleString()} <span className="text-[10px] text-slate-400">UZS</span></p>
              </div>
              <Info size={18} className="text-slate-200" />
            </div>

            {/* Bottom part: Controls */}
            <div className="p-8 pt-6 mt-auto space-y-4">
              {/* Qty Selector */}
              <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => updateQty(product.id, -0.5)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 transition-colors shadow-sm active:scale-90"
                >
                  <Minus size={16} />
                </button>
                <span className="font-black text-slate-800">{quantities[product.id] || 1} <span className="text-[10px] text-slate-400">kg</span></span>
                <button 
                  onClick={() => updateQty(product.id, 0.5)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-500 transition-colors shadow-sm active:scale-90"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                onClick={() => {
                  addToCart(product, quantities[product.id] || 1);
                  toast.success(`${product.name} savatga qo'shildi`);
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg active:scale-95"
              >
                <ShoppingCart size={18} /> Savatga
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}