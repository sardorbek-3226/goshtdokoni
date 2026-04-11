import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Camera, Save, LogOut, Key } from "lucide-react";
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Alisher Ismoilov",
    role: "Administrator",
    email: "alisher@goshtpro.uz",
    phone: "+998 90 123 45 67",
    joined: "12 Yanvar, 2024"
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    // Bu yerda apiService.updateProfile() chaqiriladi
    toast.success("Profil muvaffaqiyatli yangilandi!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. TOP HEADER CARD */}
      <div className="relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -mr-20 -mt-20 opacity-50 shadow-inner"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              <User size={60} className="text-slate-300" />
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-violet-600 text-white rounded-xl shadow-lg hover:bg-violet-700 transition-all">
              <Camera size={18} />
            </button>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-black text-slate-800 italic">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Shield size={12} /> {user.role}
              </span>
              <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                A'zo: {user.joined}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 2. SECURITY & ACTIONS (SIDE) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-4">Xavfsizlik</h3>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-violet-50 hover:text-violet-600 transition-all">
              <Key size={16} /> Parolni o'zgartirish
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all">
              <LogOut size={16} /> Tizimdan chiqish
            </button>
          </div>
        </div>

        {/* 3. EDIT FORM (MAIN) */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 italic mb-2">Shaxsiy ma'lumotlar</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">To'liq ism</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-700 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    defaultValue={user.phone}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-700 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email manzil</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-700 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg shadow-slate-200"
              >
                <Save size={18} /> Ma'lumotlarni saqlash
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}