import React, { useState } from 'react';
import { 
  BarChart3, PieChart as PieIcon, ArrowUpRight, TrendingUp, 
  Target, Layers, Calendar, Download, ChevronDown, Check 
} from "lucide-react";

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState('Shu oy');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Vaqt oraliqlari kategoriyalarga bo'lingan
  const filterOptions = [
    { label: 'Qisqa muddat', options: ['Bugun', 'Kecha', 'Oxirgi 7 kun', 'Oxirgi 14 kun'] },
    { label: 'Oylar (2026)', options: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun'] },
    { label: 'Yillik', options: ['2024-yil', '2025-yil', 'Shu yil'] }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Analitika</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">Savdo dinamikasi</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto relative">
          {/* ADVANCED DROPDOWN */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-56 flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl text-[11px] font-black hover:bg-slate-100 transition-all border border-slate-100 shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-violet-600" />
                <span className="uppercase tracking-wider">{selectedRange}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-3 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {filterOptions.map((group, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {group.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSelectedRange(option);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-bold transition-all ${
                              selectedRange === option 
                              ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' 
                              : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                            {selectedRange === option && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl shadow-slate-200">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {/* --- Qolgan grafiklar va statistikalar --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
          {/* Grafik foni uchun dekoratsiya */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 italic flex items-center gap-2 uppercase tracking-tighter text-sm">
              <TrendingUp className="text-violet-600" size={18} /> {selectedRange} hisoboti
            </h3>
          </div>
          
          <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center relative">
             <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ma'lumotlar tahlil qilinmoqda...</p>
             </div>
          </div>
        </div>

        {/* Ulushlar qismi */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-black text-slate-800 italic mb-8 flex items-center gap-2 uppercase tracking-tighter text-sm">
            <Layers className="text-orange-500" size={18} /> Ulushlar
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <CategoryItem label="Tovuq" percent={68} color="bg-violet-600" />
            <CategoryItem label="Mol go'shti" percent={24} color="bg-orange-500" />
            <CategoryItem label="Qo'y go'shti" percent={8} color="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryItem({ label, percent, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-slate-800">{percent}%</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full p-0.5">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}