import React, { useEffect, useState } from "react";
import { apiService } from "../../api/api";
import { toast } from "react-hot-toast";
import { PlusCircle, Edit3, X, Package, Calculator } from "lucide-react";

const WAREHOUSE_BACKUP_KEY = "warehouse_backup";

export default function WarehousePage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: "", weight: "" });

  const [loading, setLoading] = useState(false);
  const [savingStock, setSavingStock] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrices, setNewPrices] = useState({ price: "", cost: "" });
  const [savingPrice, setSavingPrice] = useState(false);

  const normalizeProduct = (p) => ({
    id: String(p.id ?? p.productId ?? ""),
    productId: String(p.productId ?? p.id ?? ""),
    name: p.name || p.product?.name || "Nomsiz mahsulot",
    cost: Number(p.cost ?? p.tannarx ?? p.product?.tannarx ?? 0),
    price: Number(p.price ?? p.sotish ?? p.product?.sotish ?? 0),
    tannarx: Number(p.tannarx ?? p.cost ?? p.product?.tannarx ?? 0),
    sotish: Number(p.sotish ?? p.price ?? p.product?.sotish ?? 0),
    currentStock: Number(
      p.currentStock ??
        p.stock ??
        p.quantityKg ??
        p.quantity ??
        p.product?.currentStock ??
        0
    ),
    category: p.category || p.product?.category || "Go'sht",
  });

  const getBackup = () => {
    try {
      return JSON.parse(localStorage.getItem(WAREHOUSE_BACKUP_KEY) || "[]").map(
        normalizeProduct
      );
    } catch {
      return [];
    }
  };

  const saveBackup = (items) => {
    localStorage.setItem(
      WAREHOUSE_BACKUP_KEY,
      JSON.stringify(items.map(normalizeProduct))
    );
  };

  const mergeProductsWithStock = (allProducts, stockProducts, backupProducts) => {
    return allProducts.map((product) => {
      const productId = String(product.productId || product.id);
  
      const stockItem = stockProducts.find(
        (s) => String(s.productId || s.id) === productId
      );
  
      const backupItem = backupProducts.find(
        (b) => String(b.productId || b.id) === productId
      );
  
      const apiStock = Number(
        stockItem?.currentStock ??
        stockItem?.stock ??
        stockItem?.quantityKg ??
        stockItem?.quantity ??
        0
      );
  
      const backupStock = Number(backupItem?.currentStock || 0);
  
      return {
        ...product,
        productId,
        currentStock: Math.max(apiStock, backupStock),
      };
    });
  };
  const load = async () => {
    try {
      setLoading(true);
  
      const backup = getBackup();
  
      const productsRes = await apiService.getProducts();
      const warehouseRes = await apiService.getWarehouseStock();
  
      const allProducts = Array.isArray(productsRes?.data)
        ? productsRes.data.map(normalizeProduct)
        : [];
  
      const stockProducts = Array.isArray(warehouseRes?.data)
        ? warehouseRes.data.map(normalizeProduct)
        : [];
  
      const merged = mergeProductsWithStock(allProducts, stockProducts, backup);
  
      setProducts(merged);
      saveBackup(merged);
    } catch (err) {
      const backup = getBackup();
      setProducts(backup);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const selectedProduct = products.find(
    (p) => String(p.productId || p.id) === String(form.productId)
  );

  const totalInboundCost = selectedProduct
    ? Number(selectedProduct.cost || 0) * Number(form.weight || 0)
    : 0;

  const handleAddStock = async (e) => {
    e.preventDefault();

    const productId = String(form.productId || "");
    const quantityKg = Number(form.weight || 0);

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
      };

      console.log("📦 KIRIM PAYLOAD:", payload);

      await apiService.addStock(payload);

      const updatedProducts = products.map((p) =>
        String(p.productId || p.id) === String(productId)
          ? {
              ...p,
              currentStock: Number(p.currentStock || 0) + quantityKg,
            }
          : p
      );

      setProducts(updatedProducts);
      saveBackup(updatedProducts);

      toast.success("Kirim qilindi!");
      setForm({ productId: "", weight: "" });
    } catch (err) {
      console.error("KIRIM ERROR:", err?.response?.data || err);

      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(", ")
        : err?.response?.data?.message ||
          err?.message ||
          "Kirim qilishda xato!";

      toast.error(message);
    } finally {
      setSavingStock(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewPrices({
      price: String(product.price || ""),
      cost: String(product.cost || ""),
    });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setNewPrices({ price: "", cost: "" });
    setIsModalOpen(false);
  };

  const handleSavePrice = async () => {
    if (!editingProduct) return;

    if (!newPrices.price || !newPrices.cost) {
      toast.error("Narxlarni kiriting!");
      return;
    }

    try {
      setSavingPrice(true);

      const productId = editingProduct.productId || editingProduct.id;

      await apiService.updateProductPrice(
        productId,
        Number(newPrices.price),
        Number(newPrices.cost)
      );

      const updatedProducts = products.map((p) =>
        String(p.productId || p.id) === String(productId)
          ? {
              ...p,
              price: Number(newPrices.price),
              sotish: Number(newPrices.price),
              cost: Number(newPrices.cost),
              tannarx: Number(newPrices.cost),
            }
          : p
      );

      setProducts(updatedProducts);
      saveBackup(updatedProducts);

      toast.success("Narx yangilandi!");
      closeEditModal();
    } catch (err) {
      console.error("PRICE ERROR:", err?.response?.data || err);
      toast.error("Narxni saqlashda xatolik!");
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
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
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
              value={form.productId}
              onChange={(e) =>
                setForm({ ...form, productId: e.target.value })
              }
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold outline-none"
            >
              <option value="">Tanlash...</option>
              {products.map((p) => (
                <option key={p.productId || p.id} value={p.productId || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full md:w-40">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
              Vazn kg
            </label>

            <input
              type="number"
              step="0.1"
              min="0"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 font-bold text-center outline-none text-xl"
              placeholder="0.0"
            />
          </div>

          <button
            type="submit"
            disabled={savingStock}
            className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] disabled:opacity-60"
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
                  <td colSpan="5" className="px-8 py-10 text-center">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.productId || p.id} className="border-t">
                    <td className="px-8 py-5 font-black">{p.name}</td>
                    <td className="px-8 py-5 text-rose-500">
                      {Number(p.cost).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-emerald-600">
                      {Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      {Number(p.currentStock).toFixed(1)} kg
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => openEditModal(p)}>
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center">
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
            className="absolute inset-0 bg-slate-900/60"
            onClick={closeEditModal}
          />

          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8">
            <div className="flex justify-between mb-8">
              <h3 className="text-lg font-black uppercase italic">
                Narxni tahrirlash
              </h3>
              <button onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            <input
              type="number"
              value={newPrices.cost}
              onChange={(e) =>
                setNewPrices({ ...newPrices, cost: e.target.value })
              }
              placeholder="Tannarx"
              className="w-full bg-slate-50 rounded-2xl p-4 mb-4"
            />

            <input
              type="number"
              value={newPrices.price}
              onChange={(e) =>
                setNewPrices({ ...newPrices, price: e.target.value })
              }
              placeholder="Sotish"
              className="w-full bg-slate-50 rounded-2xl p-4 mb-6"
            />

            <button
              onClick={handleSavePrice}
              disabled={savingPrice}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px]"
            >
              {savingPrice ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}