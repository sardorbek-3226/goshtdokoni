import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { Clock } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [period, setPeriod] = useState("bugun");

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await apiService.getStats(period);
        const recentRes = await apiService.getRecentSales();
  
        setStats(Array.isArray(statsRes?.data) ? statsRes.data : []);
        setRecent(Array.isArray(recentRes?.data) ? recentRes.data : []);
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        setStats([]);
        setRecent([]);
      }
    };
  
    loadData();
  }, [period]);

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800">
          Hisobotlar
        </h1>

        <div className="flex bg-white p-1 rounded-2xl border shadow-sm">
          {["bugun", "hafta", "oy"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                period === p
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(stats || []).map((s, i) => (
          <div
            key={i}
            className={`p-6 rounded-[2.5rem] border shadow-sm relative overflow-hidden ${
              s.type === "profit"
                ? "bg-emerald-50 border-emerald-100"
                : "bg-white border-slate-50"
            }`}
          >
            <p
              className={`text-[9px] font-black uppercase tracking-widest ${
                s.type === "profit" ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {s.title}
            </p>

            <h3
              className={`text-xl font-black mt-1 ${
                s.type === "profit" ? "text-emerald-700" : "text-slate-800"
              }`}
            >
              {s.value}{" "}
              <small className="text-[10px] opacity-40">uzs</small>
            </h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 font-black uppercase italic text-slate-800">
          Oxirgi Sotuvlar
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 py-4">Mijoz / Vaqt</th>
                <th className="px-6 py-4 text-right">Summa</th>
              </tr>
            </thead>

            <tbody>
              {(recent || []).length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-8 text-center text-xs font-bold text-slate-400 uppercase"
                  >
                    Hozircha sotuvlar yo‘q
                  </td>
                </tr>
              ) : (
                (recent || []).map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 uppercase text-xs">
                        {r.customer || "Naqd Mijoz"}
                      </div>

                      <div className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                        <Clock size={10} /> {r.time || "--:--"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-[9px] font-black uppercase mr-2 opacity-40">
                        {r.paymentDisplay || "Naqd"}
                      </span>

                      <span className="font-black text-slate-800">
                        {r.total || 0}{" "}
                        <small className="text-[9px]">uzs</small>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}