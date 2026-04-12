import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { Printer, Trash2, Wallet, CreditCard, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SalesPage() {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("naqd");
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("active_cart") || "[]"));
  }, []);

  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const handleSale = async () => {
    if (cart.length === 0) return toast.error("Savat bo'sh!");
    if (paymentMethod === "nasiya" && (!customer.name || !customer.phone)) {
       return toast.warning("Mijoz ma'lumotlarini to'ldiring!");
    }

    const saleData = {
      items: cart,
      totalAmount: total,
      paymentMethod,
      customer: paymentMethod === 'nasiya' ? customer : { name: "Naqd Mijoz", phone: "" }
    };

    await apiService.createSale(saleData);
    toast.success("Sotuv muvaffaqiyatli yakunlandi!");
    
    // Chek chiqarish va tozalash
    window.print();
    localStorage.removeItem("active_cart");
    navigate("/dashboard");
  };

  const removeItem = (id) => {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    localStorage.setItem("active_cart", JSON.stringify(updated));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* CHAP TOMON - SAVAT */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-2xl font-black uppercase italic">Savatdagi mahsulotlar</h3>
        {cart.length === 0 ? (
          <div className="bg-slate-50 p-20 rounded-[3rem] text-center text-slate-300 font-black uppercase tracking-widest">Savat bo'sh</div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">{item.qty}</div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-bold">{item.price.toLocaleString()} x {item.qty} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-black text-lg">{(item.price * item.qty).toLocaleString()} UZS</span>
                <button onClick={() => removeItem(item.id)} className="text-rose-500 hover:bg-rose-50 p-3 rounded-xl transition-colors"><Trash2 size={20}/></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* O'NG TOMON - TO'LOV */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl sticky top-24 space-y-6">
          <div className="text-center pb-4 border-b">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Umumiy hisob</p>
             <h2 className="text-4xl font-black text-slate-900">{total.toLocaleString()} <small className="text-xs">UZS</small></h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {id: 'naqd', icon: <Wallet size={16}/>, label: 'Naqd'},
              {id: 'karta', icon: <CreditCard size={16}/>, label: 'Karta'},
              {id: 'nasiya', icon: <UserCircle size={16}/>, label: 'Nasiya'}
            ].map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${paymentMethod === m.id ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-50 text-slate-400'}`}>
                {m.icon} <span className="text-[10px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>

          {paymentMethod === 'nasiya' && (
            <div className="space-y-3 animate-in slide-in-from-top duration-300">
              <input type="text" placeholder="Mijoz ismi..." value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-sm" />
              <input type="text" placeholder="Telefon raqami..." value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-sm" />
            </div>
          )}

          <button onClick={handleSale} className="w-full bg-emerald-500 text-white py-5 rounded-[1.5rem] font-black uppercase shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all">
            <Printer size={20} /> Sotuvni yakunlash
          </button>
        </div>
      </div>
    </div>
  );
}