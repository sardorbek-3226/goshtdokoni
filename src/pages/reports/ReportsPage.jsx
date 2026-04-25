import React, { useEffect, useState } from "react";
import { apiService } from "../../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [period, setPeriod] = useState("bugun");

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      const statsRes = await apiService.getStats(period);
      const recentRes = await apiService.getRecentSales();

      setStats(Array.isArray(statsRes?.data) ? statsRes.data : []);
      setRecent(Array.isArray(recentRes?.data) ? recentRes.data : []);
    } catch (error) {
      console.error("REPORTS ERROR:", error);
      setStats([]);
      setRecent([]);
    }
  };

  const getValue = (type) => {
    const item = stats.find((s) => s.type === type);
  
    const raw = String(item?.value ?? "0");
  
    const clean = raw.replace(/[^\d.-]/g, "");
  
    const num = Number(clean);
  
    return Number.isFinite(num) ? num : 0;
  };

  const chartData = [
    { name: "Umumiy savdo", value: getValue("total") },
    { name: "Sof foyda", value: getValue("profit") },
    { name: "Naqd", value: getValue("cash") },
    { name: "Karta", value: getValue("card") },
    { name: "Nasiya", value: getValue("debt") },
  ];
  
  const paymentData = [
    { name: "Naqd", value: getValue("cash") },
    { name: "Karta", value: getValue("card") },
    { name: "Nasiya", value: getValue("debt") },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-slate-800">
            Hisobotlar
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Savdo, foyda va to‘lovlar statistikasi
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm">
          {["bugun", "kecha", "hafta", "oy"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                period === p
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400">
              {s.title}
            </p>
            <h2 className="text-xl font-black text-slate-800 mt-2">
              {s.value} <small className="text-xs text-slate-300">uzs</small>
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm">
          <h2 className="font-black uppercase italic text-slate-800 mb-6">
            Umumiy ko‘rsatkichlar
          </h2>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString()} uzs`} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
          <h2 className="font-black uppercase italic text-slate-800 mb-6">
            To‘lov turlari
          </h2>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {paymentData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm">
        <h2 className="font-black uppercase italic text-slate-800 mb-6">
          Oxirgi sotuvlar
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400">
                <th className="py-3">Mijoz</th>
                <th className="py-3">To‘lov</th>
                <th className="py-3">Vaqt</th>
                <th className="py-3 text-right">Summa</th>
              </tr>
            </thead>

            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400 text-xs font-bold uppercase">
                    Sotuvlar yo‘q
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr key={r.id} className="text-sm">
                    <td className="py-4 font-bold text-slate-700">
                      {r.customer || "Naqd mijoz"}
                    </td>
                    <td className="py-4 font-bold text-slate-400">
                      {r.paymentDisplay || "Naqd"}
                    </td>
                    <td className="py-4 text-slate-400">
                      {r.time || "--:--"}
                    </td>
                    <td className="py-4 text-right font-black text-slate-800">
                      {r.total || 0} uzs
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