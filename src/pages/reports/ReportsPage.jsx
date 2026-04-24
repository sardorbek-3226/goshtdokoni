import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart as PieIcon, TrendingUp,
  Layers, Calendar, Download, ChevronDown, Check
} from "lucide-react";
import { apiService } from '../../api/api';
import { toast } from 'react-hot-toast';

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState('Bugun');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // FRONT → BACKEND MAP
  const mapPeriod = (label) => {
    switch (label) {
      case 'Bugun': return 'bugun';
      case 'Kecha': return 'kecha';
      case 'Oxirgi 7 kun': return 'hafta';
      case 'Oxirgi 14 kun': return 'hafta';
      case 'Shu oy': return 'oy';
      default: return 'bugun';
    }
  };

  const loadStats = async (label) => {
    try {
      setLoading(true);

      const period = mapPeriod(label);
      const res = await apiService.getStats(period);

      setStats(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Statistika yuklanmadi");
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats(selectedRange);
  }, [selectedRange]);

  const filterOptions = [
    { label: 'Qisqa muddat', options: ['Bugun', 'Kecha', 'Oxirgi 7 kun', 'Oxirgi 14 kun'] },
    { label: 'Oylar', options: ['Shu oy'] },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
            Analitika
          </h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Savdo dinamikasi
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto relative">

          {/* DROPDOWN */}
          <div className="relative flex-1 md:flex-none">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-56 flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl text-[11px] font-black hover:bg-slate-100 transition-all border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-violet-600" />
                <span className="uppercase">{selectedRange}</span>
              </div>
              <ChevronDown size={14} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white border shadow-xl rounded-2xl p-3 z-50">
                {filterOptions.map((group, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-[9px] text-slate-300 uppercase mb-2">
                      {group.label}
                    </p>
                    {group.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedRange(option);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex justify-between px-4 py-3 rounded-xl text-[11px] font-bold ${
                          selectedRange === option
                            ? 'bg-violet-600 text-white'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {option}
                        {selectedRange === option && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-slate-400">
            Yuklanmoqda...
          </div>
        ) : stats.length > 0 ? (
          stats.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border text-center">
              <p className="text-[10px] text-slate-400 uppercase">{item.title}</p>
              <h2 className="text-xl font-black text-slate-800 mt-2">
                {item.value}
              </h2>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-slate-400">
            Ma'lumot yo'q
          </div>
        )}
      </div>

      {/* CHART PLACEHOLDER */}
      <div className="bg-white p-8 rounded-[3rem] border shadow-sm min-h-[300px] flex items-center justify-center">
        {loading ? (
          <p className="text-slate-400">Yuklanmoqda...</p>
        ) : (
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-[10px] text-slate-400 uppercase">
              Grafik (backendga ulansa real bo‘ladi)
            </p>
          </div>
        )}
      </div>

    </div>
  );
}