import React from 'react';
import { useCart } from '../../context/CartContext';
import { Printer, Trash2, ReceiptText } from 'lucide-react';

export default function SalesPage() {
  const { cart, removeFromCart, totalAmount, clearCart } = useCart();

  const handlePrint = async () => {
    if (cart.length === 0) return;

    // 1. BACKEND API UCHUN JOY (O'zingiz yozayotgan API)
    const orderData = {
      items: cart,
      total: totalAmount,
      date: new Date().toISOString()
    };
    
    console.log("Backendga yuborildi:", orderData);
    
    // 2. CHEK CHIQARISH (Brauzer printerni ochadi)
    window.print(); 
    
    // 3. TOZALASH
    clearCart();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-700 to-fuchsia-700 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Sotuv Bo'limi</h1>
            <p className="opacity-70 text-sm italic">Tanlangan mahsulotlar ro'yxati</p>
          </div>
          <ReceiptText size={40} className="opacity-20" />
        </div>

        <div className="p-8">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic">
              Mahsulot tanlanmagan. Iltimos, mahsulotlar bo'limidan tanlang.
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <h4 className="font-black text-slate-800">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.price.toLocaleString()} x {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-black text-lg text-slate-900">{(item.price * item.qty).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-10 pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Umumiy Summa</p>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                    {totalAmount.toLocaleString()} <span className="text-sm">UZS</span>
                  </h2>
                </div>
                <button 
                  onClick={handlePrint}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <Printer size={22} /> CHEK CHIQARISH
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}