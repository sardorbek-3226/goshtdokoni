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
    realSalesIncome: 0,
    netCashFlow: 0,
    totalExpectedMoney: 0,
  });

  useEffect(() => {
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
    const debts = JSON.parse(localStorage.getItem("debts") || "[]");
    const payments = JSON.parse(localStorage.getItem("payment_history") || "[]");

    // HAMMA SAVDO: naqd + karta + nasiya
    const totalSales = sales.reduce((sum, s) => {
      return sum + Number(s.totalAmount || s.total || 0);
    }, 0);

    // FOYDA: nasiya bo‘lsa ham foydani hisoblaydi
    const totalProfit = sales.reduce((sum, sale) => {
      const items = sale.items || [];

      const saleProfit = items.reduce((itemSum, item) => {
        const qty = Number(item.qty || item.quantityKg || item.quantity || 0);

        const sellPrice = Number(
          item.price || item.sotish || item.sellPrice || 0
        );

        const costPrice = Number(
          item.cost || item.tannarx || item.costPrice || 0
        );

        return itemSum + (sellPrice - costPrice) * qty;
      }, 0);

      return sum + saleProfit;
    }, 0);

    // HOZIRGACHA OLINMAGAN QARZLAR
    const activeDebts = debts.reduce((sum, d) => {
      return (
        sum +
        Number(
          d.remainingDebt ||
            d.remaining ||
            d.debt ||
            d.amount ||
            d.totalDebt ||
            0
        )
      );
    }, 0);

    // QARZDAN KELIB TUSHGAN PULLAR
    const receivedDebtPayments = payments.reduce((sum, p) => {
      return sum + Number(p.amount || p.paidAmount || 0);
    }, 0);

    // FAQAT NAQD/KARTA SAVDOLAR
    const realSalesIncome = sales
      .filter((s) => s.paymentMethod !== "nasiya")
      .reduce((sum, s) => {
        return sum + Number(s.totalAmount || s.total || 0);
      }, 0);

    // REAL KELGAN PUL: naqd/karta + olingan qarz
    const netCashFlow = realSalesIncome + receivedDebtPayments;

    // KUTILAYOTGAN UMUMIY PUL: kelgan pul + hali olinadigan qarz
    const totalExpectedMoney = netCashFlow + activeDebts;

    setStats({
      totalSales,
      totalProfit,
      activeDebts,
      receivedDebtPayments,
      realSalesIncome,
      netCashFlow,
      totalExpectedMoney,
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
              Real Kelgan Pul
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              {stats.netCashFlow.toLocaleString()}{" "}
              <span className="text-sm">UZS</span>
            </h2>
            <p className="text-[9px] mt-2 opacity-70 italic text-white uppercase">
              Naqd/karta savdo + olingan qarzlar
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
              Qarzdor mijozlardan olingan pul
            </p>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
              <AlertCircle size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-400 mb-1">
              Hali Olinishi Kerak
            </p>
            <h2 className="text-2xl font-black text-rose-600">
              {stats.activeDebts.toLocaleString()} UZS
            </h2>
            <p className="text-[10px] text-rose-300 mt-2 uppercase">
              Qolgan nasiyalar
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
            <p className="text-[10px] text-slate-400 mt-2 uppercase">
              Naqd + karta + nasiya
            </p>
          </div>

          <div className={cardClass}>
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 mb-6">
              <Banknote size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-400 mb-1">
              Kutilayotgan Umumiy Pul
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              {stats.totalExpectedMoney.toLocaleString()} UZS
            </h2>
            <p className="text-[10px] text-yellow-500 mt-2 uppercase">
              Kelgan pul + qolgan qarzlar
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-xl text-white">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6">
              <Wallet size={24} />
            </div>
            <p className="text-[10px] uppercase text-slate-500 mb-1">
              Umumiy Foyda
            </p>
            <h2 className="text-2xl font-black text-emerald-400">
              {stats.totalProfit.toLocaleString()} UZS
            </h2>
            <p className="text-[9px] mt-2 text-slate-500 uppercase">
              Naqd + karta + nasiya foydasi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}