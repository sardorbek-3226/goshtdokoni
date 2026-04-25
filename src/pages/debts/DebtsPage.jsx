import React, { useState, useEffect } from "react";
import { Phone, CheckCircle, Search, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { apiService } from "../../api/api";

const DEBTS_KEY = "debts";

export default function DebtsPage() {
  const [debtors, setDebtors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    totalDebt: "",
  });

  const normalizeDebt = (d) => ({
    id: d.id || Date.now(),
    name: d.name || d.customerName || "Nomsiz mijoz",
    phone: d.phone || d.customerPhone || "",
    totalDebt: Number(d.totalDebt ?? d.amount ?? d.debt ?? 0),
    remainingDebt: Number(
      d.remainingDebt ?? d.totalDebt ?? d.amount ?? d.debt ?? 0
    ),
    paidAmount: Number(d.paidAmount || 0),
    date: d.date || new Date().toLocaleDateString("uz-UZ"),
    items: d.items || [],
  });

  const getLocalDebts = () => {
    try {
      return JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]").map(
        normalizeDebt
      );
    } catch {
      return [];
    }
  };

  const saveLocalDebts = (items) => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(items.map(normalizeDebt)));
  };

  const mergeDebts = (apiDebts, localDebts) => {
    const map = new Map();

    [...apiDebts, ...localDebts].forEach((d) => {
      const key = String(d.id || `${d.name}-${d.phone}-${d.totalDebt}`);
      map.set(key, normalizeDebt(d));
    });

    return Array.from(map.values());
  };

  const load = async () => {
    try {
      setLoading(true);

      const localDebts = getLocalDebts();

      try {
        const res = await apiService.getDebtors();
        const apiDebts = Array.isArray(res?.data)
          ? res.data.map(normalizeDebt)
          : [];

        const merged = mergeDebts(apiDebts, localDebts);
        setDebtors(merged);
        saveLocalDebts(merged);
      } catch (apiErr) {
        console.warn("DEBT API LOAD FAILED:", apiErr?.response?.data || apiErr);
        setDebtors(localDebts);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddDebt = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.replace(/\s+/g, "").trim();
    const totalDebt = Number(form.totalDebt || 0);

    if (!name) {
      toast.error("Mijoz ismini kiriting!");
      return;
    }

    if (!totalDebt || totalDebt <= 0) {
      toast.error("Qarz summasini to‘g‘ri kiriting!");
      return;
    }

    try {
      setSaving(true);

      let backendId = null;

      try {
        const res = await apiService.addDebtCustomer({ name, phone });
        backendId = res?.id || res?.data?.id || null;
      } catch (apiErr) {
        console.warn("Backendga mijoz qo‘shilmadi, local saqlandi:", apiErr?.response?.data || apiErr);
      }

      const newDebt = normalizeDebt({
        id: backendId || Date.now(),
        name,
        phone,
        totalDebt,
        remainingDebt: totalDebt,
        paidAmount: 0,
        date: new Date().toLocaleDateString("uz-UZ"),
        items: [],
        type: "manual",
      });

      const updated = [...getLocalDebts(), newDebt];
      saveLocalDebts(updated);
      setDebtors(updated);

      toast.success("Nasiya qo‘shildi!");
      setForm({ name: "", phone: "", totalDebt: "" });
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (id) => {
    const amount = Number(window.prompt("To‘langan summani kiriting:"));

    if (!amount || amount <= 0) {
      toast.error("To‘lov summasini to‘g‘ri kiriting!");
      return;
    }

    try {
      try {
        await apiService.payDebt(id, amount);
      } catch (apiErr) {
        console.warn("Backend payDebt ishlamadi, local yangilandi:", apiErr?.response?.data || apiErr);
      }

      const updated = getLocalDebts()
        .map((d) => {
          if (String(d.id) !== String(id)) return d;

          const current = Number(d.remainingDebt ?? d.totalDebt ?? 0);
          const remaining = Math.max(0, current - amount);

          return {
            ...d,
            paidAmount: Number(d.paidAmount || 0) + amount,
            remainingDebt: remaining,
          };
        })
        .filter((d) => Number(d.remainingDebt ?? d.totalDebt ?? 0) > 0);

      saveLocalDebts(updated);
      setDebtors(updated);

      toast.success("Qarz to‘lovi qabul qilindi");
    } catch (err) {
      console.error("PAY DEBT ERROR:", err);
      toast.error("Qarzni to‘lashda xatolik");
    }
  };

  const filtered = debtors.filter((d) =>
    String(d.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-slate-800">
            Nasiya Daftari
          </h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Qarzga olingan mahsulotlar hisobi
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Mijozni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold"
          />
          <Search className="absolute left-4 top-4.5 text-slate-300" size={18} />
        </div>
      </div>

      <form
        onSubmit={handleAddDebt}
        className="bg-white p-6 rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none"
          placeholder="Mijoz ismi"
        />

        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none"
          placeholder="+998901234567"
        />

        <input
          type="number"
          value={form.totalDebt}
          onChange={(e) => setForm({ ...form, totalDebt: e.target.value })}
          className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none"
          placeholder="Qarz summasi"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <PlusCircle size={16} />
          {saving ? "Saqlanmoqda..." : "Nasiya qo‘shish"}
        </button>
      </form>

      {loading ? (
        <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
          Yuklanmoqda...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white text-xl font-black">
                  {String(d.name || "M").charAt(0)}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase">
                  {d.date || ""}
                </span>
              </div>

              <h4 className="font-black text-slate-800 text-xl uppercase mb-1">
                {d.name || "Nomsiz mijoz"}
              </h4>

              <p className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-6">
                <Phone size={14} /> {d.phone || "Telefon yo‘q"}
              </p>

              <div className="bg-slate-50 p-6 rounded-3xl mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Qarz miqdori:
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {Number(d.remainingDebt ?? d.totalDebt ?? 0).toLocaleString()}{" "}
                  <small className="text-xs">UZS</small>
                </h3>
              </div>

              <button
                onClick={() => handlePay(d.id)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors"
              >
                <CheckCircle size={16} /> To'lov qabul qilindi
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
          Qarzdorlar yo'q
        </div>
      )}
    </div>
  );
}