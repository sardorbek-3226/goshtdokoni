import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, User, LogIn, ShieldCheck } from 'lucide-react';
import { apiService } from '../../api/api';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
  
      const res = await apiService.login({
        email: formData.username.trim(),
        password: formData.password.trim(),
      });
  
      console.log("LOGIN DONE:", res);
  
      toast.success("Kirdingiz!");
      navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR:", err?.response?.data || err);
  
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Login xato!"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-4">
          <div className="bg-slate-900 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-500/20">
            <ShieldCheck className="text-emerald-500" size={40} />
          </div>

          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
              Meat<span className="text-emerald-500">POS</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
              Boshqaruv Tizimi
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 block">
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <User
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-5 font-bold outline-none focus:border-slate-900 focus:bg-white transition-all"
                placeholder="admin@gmail.com"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 block">
              Maxfiy Parol
            </label>
            <div className="relative">
              <Lock
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-5 font-bold outline-none focus:border-slate-900 focus:bg-white transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                Tizimga kirish
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          © 2024 MeatPOS Terminal v2.0
        </p>
      </div>
    </div>
  );
}