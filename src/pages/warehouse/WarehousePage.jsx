import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/api';
import { toast } from 'react-hot-toast';
import { PlusCircle, Edit3, X, Save, Package, Calculator } from 'lucide-react';

export default function WarehousePage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', weight: '' });
  
  // Modal va Tahrirlash holatlari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrices, setNewPrices] = useState({ price: '', cost: '' });

  useEffect(() => { load(); }, []);
  
  const load = () => apiService.getWarehouseStock().then(res => setProducts(res.data));

  // Tanlangan mahsulotni topish (Summani hisoblash uchun)
  const selectedProduct = products.find(p => p.id === Number(form.product_id));
  const totalInboundCost = selectedProduct ? (selectedProduct.cost * (parseFloat(form.weight) || 0)) : 0;

  const handleAddStock = async (e) => {
    e.preventDefault();
    if(!form.product_id || !form.weight) return toast.error("Ma'lumotlarni to'liq kiriting!");
    
    await apiService.addStock(form);
    toast.success(`${selectedProduct.name} zahiraga qo'shildi!`);
    setForm({ product_id: '', weight: '' });
    load();
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setNewPrices({ price: p.price, cost: p.cost });
    setIsModalOpen(true);
  };

  const handleSavePrice = async () => {
    if(!newPrices.price || !newPrices.cost) return toast.error("Narxlarni kiriting!");
    await apiService.updateProductPrice(editingProduct.id, newPrices.price, newPrices.cost);
    toast.success("Narxlar yangilandi!");
    setIsModalOpen(false);
    load();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24 min-h-screen bg-slate-50/50">
      
      {/* 1. YUK QABUL QILISH (KIRIM) PANELi */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase italic flex items-center gap-2 text-slate-800">
            <PlusCircle size={18} className="text-emerald-500"/> Yuk qabul qilish
          </h2>
          {/* DINAMIK HISOB-KITOB */}
          {totalInboundCost > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 animate-pulse">
              <Calculator size={14} className="text-emerald-600"/>
              <span className="text-[10px] font-black uppercase text-emerald-600">
                Kirim summasi: {totalInboundCost.toLocaleString()} uzs
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleAddStock} className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-[2] w-full">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Mahsulotni tanlang</label>
            <select 
              value={form.product_id} 
              onChange={e => setForm({...form, product_id: e.target.value})} 
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold focus:border-slate-900 transition-all outline-none"
            >
              <option value="">Tanlash...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <div className="flex-1 w-full md:w-40">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Vazn (kg)</label>
            <input 
              type="number" step="0.1" 
              value={form.weight} 
              onChange={e => setForm({...form, weight: e.target.value})} 
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold text-center focus:border-slate-900 transition-all outline-none text-xl"
              placeholder="0.0"
            />
          </div>

          <button className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-black active:scale-95 transition-all">
            Kirimni tasdiqlash
          </button>
        </form>
      </div>

      {/* 2. ZAHIRA JADVALI */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-sm font-black uppercase italic text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-blue-500"/> Joriy Ombor Holati
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">Mahsulot</th>
                <th className="px-8 py-5">Tannarx</th>
                <th className="px-8 py-5">Sotish</th>
                <th className="px-8 py-5">Zaxira</th>
                <th className="px-8 py-5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold uppercase text-slate-700">
              {products.map(p => (
                <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 font-black text-slate-900">{p.name}</td>
                  <td className="px-8 py-5 text-rose-500">{p.cost?.toLocaleString()}</td>
                  <td className="px-8 py-5 text-emerald-600">{p.price?.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full ${p.currentStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                      {p.currentStock.toFixed(1)} kg
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => openEditModal(p)} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-slate-400 transition-all">
                      <Edit3 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL OYNASI (OLDINGI KODDAGI kabi) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8">
             {/* Modal tarkibi tahrirlash uchun */}
             <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase italic">Narxni tahrirlash</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Tannarx (Cost)</label>
                <input type="number" value={newPrices.cost} onChange={e => setNewPrices({...newPrices, cost: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-rose-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Sotish (Price)</label>
                <input type="number" value={newPrices.price} onChange={e => setNewPrices({...newPrices, price: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-emerald-600 outline-none" />
              </div>
              <button onClick={handleSavePrice} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px]">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}