import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from 'react-toastify';
import { apiService } from '../../api/api';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend api ulanishi (apiService da login funksiyasi bo'lishi kerak)
      // const res = await apiService.login(formData);
      
      // Hozircha simulyatsiya qilamiz:
      if(formData.username === 'admin' && formData.password === '12345') {
        toast.success("Xush kelibsiz!");
        localStorage.setItem('token', 'fake-jwt-token'); // Kirganini belgilash
        navigate('/'); // Dashboardga yuborish
      } else {
        toast.error("Login yoki parol xato!");
      }
    } catch (err) {
      toast.error("Server bilan aloqa yo'q!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        
        {/* Dekorativ element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/5 rounded-full"></div>

        <div className="text-center space-y-2 relative">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-violet-200 mb-4">
            <Lock size={30} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
            Go'sht<span className="text-violet-600">Pro</span>
          </h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Tizimga kirish</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Foydalanuvchi nomi</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-700 focus:border-violet-500 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-12 font-bold text-slate-700 focus:border-violet-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-300 hover:text-violet-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl active:scale-95 disabled:opacity-70"
          >
            {loading ? "Tekshirilmoqda..." : (
              <>
                Kirish <LogIn className="ml-2" size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-4">
          © 2026 Go'shtPro Business Solutions
        </p>
      </div>
    </div>
  );
}