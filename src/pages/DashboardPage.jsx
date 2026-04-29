import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Wallet,
  AlertCircle,
  Banknote,
  History,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    activeDebts: 0,
    receivedDebtPayments: 0,
    netCashFlow: 0,
  });

  useEffect(() => {
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
    const debts = JSON.parse(localStorage.getItem("debts") || "[]");
    const payments = JSON.parse(localStorage.getItem("payment_history") || "[]");

    const totalSales = sales.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0),
      0
    );

    const totalProfit = sales.reduce((sum, s) => {
      const saleProfit =
        s.items?.reduce((itemSum, item) => {
          const qty = Number(item.qty || item.quantityKg || 0);
          const sotish = Number(item.price || item.sotish || 0);
          const tannarx = Number(item.cost || item.tannarx || 0);

          return itemSum + (sotish - tannarx) * qty;
        }, 0) || 0;

      return sum + saleProfit;
    }, 0);

    const activeDebts = debts.reduce(
      (sum, d) => sum + Number(d.remainingDebt || 0),
      0
    );

    const receivedDebtPayments = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const realSalesIncome = sales
      .filter((s) => s.paymentMethod !== "nasiya")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const netCashFlow = realSalesIncome + receivedDebtPayments;

    setStats({
      totalSales,
      totalProfit,
      activeDebts,
      receivedDebtPayments,
      netCashFlow,
    });
  }, []);

  const cardClass =
    "bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-all";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 italic font-bold">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-black uppercase italic text-slate-900">
            Statistika
          </h1>
          <span className="text-[10px] bg-slate-900 text-white px-4 py-2 rounded-xl uppercase">
            Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-emerald-500 p-8 rounded-[3rem] shadow-xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Banknote size={24} />
            </div>
            <p className="text-[10px] uppercase text-emerald-100 mb-1 font-black">
              Jami Naqd Pul Oqimi
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              {stats.netCashFlow.toLocaleString()}{" "}
              <span className="text-sm">UZS</span>
            </h2>
            <p className="text-[9px] mt-2 opacity-70 italic text-white uppercase">
              Savdo + Undirilgan qarzlar
            </p>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
              <History size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-400 mb-1">
              Undirilgan Qarzlar
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              {stats.receivedDebtPayments.toLocaleString()} UZS
            </h2>
            <p className="text-[10px] text-blue-500 mt-2 uppercase">
              Qarzdan tushgan pul
            </p>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
              <AlertCircle size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-400 mb-1">
              Hali olinishi kerak
            </p>
            <h2 className="text-2xl font-black text-rose-600">
              {stats.activeDebts.toLocaleString()} UZS
            </h2>
            <p className="text-[10px] text-rose-300 mt-2 uppercase">
              Mavjud nasiyalar
            </p>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 mb-6">
              <TrendingUp size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-400 mb-1">
              Umumiy Savdo
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              {stats.totalSales.toLocaleString()} UZS
            </h2>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-xl text-white">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6">
              <Wallet size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-500 mb-1">
              Haqiqiy Foyda
            </p>
            <h2 className="text-2xl font-black text-emerald-400">
              {stats.totalProfit.toLocaleString()} UZS
            </h2>
            <p className="text-[9px] mt-2 text-slate-500 uppercase">
              Tannarxdan tashqari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}