import React, { useEffect, useState } from "react";
import { Search, Phone, Clock, UserX, CheckCircle, X, Wallet, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modallar uchun holatlar
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Yangi qarz formasi
  const [newDebt, setNewDebt] = useState({ name: "", phone: "", amount: "" });

  useEffect(() => { loadDebts(); }, []);

  const loadDebts = () => {
    const data = JSON.parse(localStorage.getItem("debts") || "[]");
    setDebts(data);
  };

  // --- QO'LDA QARZ QO'SHISH ---
  const handleAddNewDebt = (e) => {
    e.preventDefault();
    const amount = Number(newDebt.amount);
    
    if (!newDebt.name || !amount || amount <= 0) {
      return toast.error("Ism va miqdorni to'g'ri kiriting!");
    }

    const currentDebts = JSON.parse(localStorage.getItem("debts") || "[]");
    const debtEntry = {
      id: Date.now(),
      customerName: newDebt.name,
      phone: newDebt.phone,
      remainingDebt: amount,
      date: new Date().toISOString(),
      type: "manual" // Qo'lda qo'shilganini bildirish uchun
    };

    localStorage.setItem("debts", JSON.stringify([...currentDebts, debtEntry]));
    toast.success("Qarz muvaffaqiyatli qo'shildi!");
    
    // Tozalash
    setNewDebt({ name: "", phone: "", amount: "" });
    setIsAddModalOpen(false);
    loadDebts();
  };

  // --- TO'LOVNI QABUL QILISH ---
  const handlePayment = () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return toast.error("To'lov miqdorini kiriting!");
    
    let allDebts = JSON.parse(localStorage.getItem("debts") || "[]");
    const updatedDebts = allDebts.map(d => {
      if (d.id === selectedDebt.id) {
        return { ...d, remainingDebt: d.remainingDebt - amount };
      }
      return d;
    }).filter(d => d.remainingDebt > 0);

    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    // To'lov tarixiga yozish (Dashboardda ko'rinishi uchun)
    const paymentHistory = JSON.parse(localStorage.getItem("payment_history") || "[]");
    paymentHistory.push({
      id: Date.now(),
      customerName: selectedDebt.customerName,
      amount: amount,
      date: new Date().toISOString()
    });
    localStorage.setItem("payment_history", JSON.stringify(paymentHistory));

    toast.success("To'lov qabul qilindi!");
    setSelectedDebt(null);
    setPaymentAmount("");
    loadDebts();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 italic font-bold">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center">
              <UserX size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic text-slate-900">Nasiyalar</h1>
              <p className="text-[10px] text-slate-400 uppercase">Jami qarz: {debts.reduce((s,d)=>s+d.remainingDebt, 0).toLocaleString()} UZS</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-3 text-slate-300" size={18} />
              <input 
                type="text" placeholder="Qidirish..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all"
            >
              <UserPlus size={18} /> Yangi Qarz
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 gap-4">
          {debts.filter(d => d.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map((debt) => (
            <div key={debt.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black italic border">{debt.customerName.charAt(0)}</div>
                <div>
                  <h3 className="font-black uppercase text-slate-800">{debt.customerName}</h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-2"><Phone size={10}/> {debt.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] uppercase text-slate-400">Qarz</p>
                  <p className="text-lg font-black text-rose-600">{debt.remainingDebt.toLocaleString()} UZS</p>
                </div>
                <button 
                  onClick={() => setSelectedDebt(debt)}
                  className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <CheckCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: YANGI QARZ QO'SHISH (MANUAL) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic">Qarz qo'shish</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-50 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleAddNewDebt} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 ml-2">Mijoz Ismi</label>
                <input 
                  type="text" required placeholder="Ism sharifi"
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-slate-900 font-bold"
                  value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 ml-2">Telefon (Ixtiyoriy)</label>
                <input 
                  type="text" placeholder="+998"
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-slate-900 font-bold"
                  value={newDebt.phone} onChange={e => setNewDebt({...newDebt, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 ml-2">Qarz Miqdori (UZS)</label>
                <input 
                  type="number" required placeholder="0.00"
                  className="w-full bg-slate-50 p-5 rounded-2xl outline-none border-2 border-transparent focus:border-rose-500 font-black text-2xl text-rose-600"
                  value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 transition-all">
                Ro'yxatga qo'shish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TO'LOV QABUL QILISH MODALI (AVVALGI KODDAGI) */}
      {selectedDebt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl">
            <h2 className="font-black uppercase italic text-center mb-6">Qarzni yopish</h2>
            <div className="bg-rose-50 p-6 rounded-[2rem] text-center mb-6">
              <p className="text-[10px] text-rose-400 uppercase">{selectedDebt.customerName}</p>
              <p className="text-2xl font-black text-rose-600">{selectedDebt.remainingDebt.toLocaleString()} UZS</p>
            </div>
            <input 
              autoFocus type="number" 
              className="w-full bg-slate-50 rounded-[2rem] p-6 text-2xl font-black outline-none border-4 border-transparent focus:border-emerald-500 text-center mb-6"
              value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="To'lov summasi"
            />
            <button 
              onClick={handlePayment}
              className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase text-[10px] shadow-lg"
            >
              To'lovni tasdiqlash
            </button>
            <button onClick={() => setSelectedDebt(null)} className="w-full mt-4 text-slate-400 uppercase text-[9px]">Bekor qilish</button>
          </div>
        </div>
      )}
    </div>
  );
}