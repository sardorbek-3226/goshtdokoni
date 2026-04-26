import React, { useState, useEffect } from "react";
import { Phone, CheckCircle, Search, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { apiService } from "../../api/api";

export default function DebtsPage() {
  const [debtors, setDebtors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const normalizeDebt = (d) => ({
    id: d.id,
    name: d.name || d.customerName || "Nomsiz mijoz",
    phone: d.phone || d.customerPhone || "",
    totalDebt: Number(d.totalDebt ?? d.amount ?? d.debt ?? 0),
    remainingDebt: Number(
      d.remainingDebt ?? d.totalDebt ?? d.amount ?? d.debt ?? 0
    ),
    date: d.date || "",
  });

  const load = async () => {
    try {
      setLoading(true);

      const res = await apiService.getDebtors();
      const data = Array.isArray(res?.data) ? res.data : [];

      setDebtors(data.map(normalizeDebt));
    } catch (err) {
      console.error("DEBTS LOAD ERROR:", err?.response?.data || err);
      toast.error("Qarzdorlarni yuklab bo‘lmadi");
      setDebtors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddDebt = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Mijoz ismini kiriting!");
      return;
    }

    try {
      setSaving(true);

      await apiService.addDebtCustomer({
        name: form.name,
        phone: form.phone,
      });

      toast.success("Mijoz backendga qo‘shildi!");

      setForm({
        name: "",
        phone: "",
      });

      await load();
    } catch (err) {
      console.error("ADD DEBT ERROR FULL:", err?.response?.data || err);
    
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(", ")
        : err?.response?.data?.message || "Backendga saqlanmadi!";
    
      toast.error(message);
    }
  };

  const handlePay = async (id) => {
    const amount = Number(window.prompt("To‘langan summani kiriting:"));

    if (!amount || amount <= 0) {
      toast.error("To‘lov summasini to‘g‘ri kiriting!");
      return;
    }

    try {
      await apiService.payDebt(id, amount);
      toast.success("Qarz to‘lovi qabul qilindi");
      await load();
    } catch (err) {
      console.error("PAY DEBT ERROR:", err?.response?.data || err);
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
            Backend API orqali qarzdorlar ro‘yxati
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
        className="bg-white p-6 rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
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

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <PlusCircle size={16} />
          {saving ? "Saqlanmoqda..." : "Mijoz qo‘shish"}
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
              className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all"
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
                {d.name}
              </h4>

              <p className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-6">
                <Phone size={14} /> {d.phone || "Telefon yo‘q"}
              </p>

              <div className="bg-slate-50 p-6 rounded-3xl mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Qarz miqdori:
                </p>

                <h3 className="text-2xl font-black text-slate-900">
                  {Number(d.remainingDebt || 0).toLocaleString()}{" "}
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