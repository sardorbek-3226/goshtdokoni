import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { toast } from "react-hot-toast";
import { PlusCircle, Edit3, X, Package, Calculator } from "lucide-react";

export default function WarehousePage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", weight: "" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrices, setNewPrices] = useState({ price: "", cost: "" });

  const [loading, setLoading] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const normalizeProduct = (p) => ({
    ...p,
    id: Number(p.id),
    name: p.name || "Nomsiz mahsulot",
    cost: Number(p.cost ?? p.tannarx ?? 0),
    price: Number(p.price ?? p.sotish ?? 0),
    tannarx: Number(p.tannarx ?? p.cost ?? 0),
    sotish: Number(p.sotish ?? p.price ?? 0),
    currentStock: Number(
      p.currentStock ?? p.stock ?? p.quantityKg ?? p.quantity ?? 0
    ),
    category: p.category || "Go'sht",
    type: p.type || "custom",
  });

  const load = async () => {
    try {
      setLoading(true);

      const stockRes = await apiService.getWarehouseStock();
      const stockProducts = Array.isArray(stockRes?.data) ? stockRes.data : [];

      setProducts(stockProducts.map(normalizeProduct));
    } catch (error) {
      console.error("WAREHOUSE LOAD ERROR:", error);
      toast.error("Mahsulotlarni yuklab bo'lmadi!");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(
    (p) => Number(p.id) === Number(form.product_id)
  );

  const totalInboundCost = selectedProduct
    ? Number(selectedProduct.cost || 0) * Number(form.weight || 0)
    : 0;

  const handleAddStock = async (e) => {
    e.preventDefault();

    const productId = Number(form.product_id);
    const quantityKg = Number(form.weight);

    if (!productId) {
      toast.error("Mahsulot tanlang!");
      return;
    }

    if (!quantityKg || quantityKg <= 0) {
      toast.error("Vaznni to‘g‘ri kiriting!");
      return;
    }

    try {
      setSavingStock(true);

      const payload = {
        productId,
        quantityKg,
        product_id: productId,
        weight: quantityKg,
      };

      console.log("📦 KIRIM DATA:", payload);

      const res = await apiService.addStock(payload);

      console.log("✅ KIRIM RESPONSE:", res);

      toast.success("Kirim bo‘ldi!");

      setForm({ product_id: "", weight: "" });

      await load();
    } catch (err) {
      console.error("KIRIM ERROR:", err);
      toast.error(err?.message || "Kirim qilishda xato!");
    } finally {
      setSavingStock(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewPrices({
      price: String(product.price ?? ""),
      cost: String(product.cost ?? ""),
    });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewPrices({ price: "", cost: "" });
  };

  const handleSavePrice = async () => {
    if (!editingProduct) return;

    if (!newPrices.price || !newPrices.cost) {
      toast.error("Narxlarni kiriting!");
      return;
    }

    if (Number(newPrices.price) <= 0 || Number(newPrices.cost) <= 0) {
      toast.error("Narxlar 0 dan katta bo‘lishi kerak!");
      return;
    }

    try {
      setSavingPrice(true);

      await apiService.updateProductPrice(
        editingProduct.id,
        Number(newPrices.price),
        Number(newPrices.cost)
      );

      toast.success("Narxlar yangilandi!");
      closeEditModal();
      await load();
    } catch (error) {
      console.error("PRICE SAVE ERROR:", error);
      toast.error("Narxlarni saqlashda xatolik!");
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24 min-h-screen bg-slate-50/50">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase italic flex items-center gap-2 text-slate-800">
            <PlusCircle size={18} className="text-emerald-500" />
            Yuk qabul qilish
          </h2>

          {totalInboundCost > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 animate-pulse">
              <Calculator size={14} className="text-emerald-600" />
              <span className="text-[10px] font-black uppercase text-emerald-600">
                Kirim summasi: {totalInboundCost.toLocaleString()} uzs
              </span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleAddStock}
          className="flex flex-col md:flex-row gap-6 items-end"
        >
          <div className="flex-[2] w-full">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
              Mahsulotni tanlang
            </label>

            <select
              value={form.product_id}
              onChange={(e) =>
                setForm({ ...form, product_id: e.target.value })
              }
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold focus:border-slate-900 transition-all outline-none"
            >
              <option value="">Tanlash...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full md:w-40">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
              Vazn (kg)
            </label>

            <input
              type="number"
              step="0.1"
              min="0"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold text-center focus:border-slate-900 transition-all outline-none text-xl"
              placeholder="0.0"
            />
          </div>

          <button
            type="submit"
            disabled={savingStock}
            className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-black active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingStock ? "Saqlanmoqda..." : "Kirimni tasdiqlash"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-sm font-black uppercase italic text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-blue-500" />
            Joriy Ombor Holati
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">Mahsulot</th>
                <th className="px-8 py-5">Tannarx</th>
                <th className="px-8 py-5">Sotish</th>
                <th className="px-8 py-5">Zaxira</th>
                <th className="px-8 py-5 text-right">Amal</th>
              </tr>
            </thead>

            <tbody className="text-[11px] font-bold uppercase text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-10 text-center text-slate-400 font-black"
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-50 hover:bg-slate-50/50 transition-all"
                  >
                    <td className="px-8 py-5 font-black text-slate-900">
                      {p.name}
                    </td>
                    <td className="px-8 py-5 text-rose-500">
                      {Number(p.cost).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-emerald-600">
                      {Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-full ${
                          Number(p.currentStock) > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-500"
                        }`}
                      >
                        {Number(p.currentStock).toFixed(1)} kg
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-slate-400 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-10 text-center text-slate-400 font-black"
                  >
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase italic">
                Narxni tahrirlash
              </h3>

              <button
                onClick={closeEditModal}
                className="p-2 bg-slate-50 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                  Tannarx
                </label>

                <input
                  type="number"
                  min="0"
                  value={newPrices.cost}
                  onChange={(e) =>
                    setNewPrices({ ...newPrices, cost: e.target.value })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                  Sotish
                </label>

                <input
                  type="number"
                  min="0"
                  value={newPrices.price}
                  onChange={(e) =>
                    setNewPrices({ ...newPrices, price: e.target.value })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-emerald-600 outline-none"
                />
              </div>

              <button
                onClick={handleSavePrice}
                disabled={savingPrice}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingPrice ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}