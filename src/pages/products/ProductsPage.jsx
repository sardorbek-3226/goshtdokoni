import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { toast } from "react-hot-toast";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  PackageX,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const normalizeProduct = (p) => ({
    id: String(p.id),
    productId: String(p.id),
    name: p.name || "Nomsiz mahsulot",
    type: p.type || "product",
    cost: Number(p.cost ?? p.tannarx ?? 0),
    price: Number(p.price ?? p.sotish ?? 0),
    tannarx: Number(p.tannarx ?? p.cost ?? 0),
    sotish: Number(p.sotish ?? p.price ?? 0),
    currentStock: Number(
      p.currentStock ?? p.stock ?? p.quantityKg ?? p.quantity ?? 0
    ),
    category: p.category || "Go'sht",
  });

  const loadData = async () => {
    try {
      setLoading(true);
  
      const res = await apiService.getProducts();
      const data = Array.isArray(res?.data) ? res.data : [];
  
      const warehouseBackup = JSON.parse(
        localStorage.getItem("warehouse_backup") || "[]"
      );
  
      const normalizedProducts = data.map((product) => {
        const p = normalizeProduct(product);
  
        const backupItem = warehouseBackup.find(
          (b) => String(b.productId || b.id) === String(p.productId || p.id)
        );
  
        return {
          ...p,
          currentStock: Math.max(
            Number(p.currentStock || 0),
            Number(backupItem?.currentStock || 0)
          ),
        };
      });
  
      setProducts(normalizedProducts);
  
      const savedCart = JSON.parse(localStorage.getItem("active_cart") || "[]");
      setCart(savedCart);
    } catch (error) {
      console.error("PRODUCT LOAD ERROR:", error);
      toast.error("Mahsulotlarni yuklab bo'lmadi!");
      setProducts([]);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("active_cart", JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const qty = Number(amounts[product.id] || 0);

    if (!qty || qty <= 0) {
      toast.error("Vaznni to'g'ri kiriting!");
      return;
    }

    const existingItem = cart.find(
      (item) => String(item.id) === String(product.id)
    );

    const currentCartQty = Number(existingItem?.qty || 0);
    const totalWanted = currentCartQty + qty;

    if (qty > Number(product.currentStock)) {
      toast.error("Omborda yetarli yuk yo'q!");
      return;
    }

    if (totalWanted > Number(product.currentStock)) {
      toast.error("Zaxiradan ko'p qo'shib bo'lmaydi!");
      return;
    }

    let currentCart = [...cart];

    const existsIndex = currentCart.findIndex(
      (item) => String(item.id) === String(product.id)
    );

    if (existsIndex > -1) {
      currentCart[existsIndex] = {
        ...currentCart[existsIndex],
        qty: Number(currentCart[existsIndex].qty) + qty,
        quantityKg: Number(currentCart[existsIndex].qty) + qty,
      };
    } else {
      currentCart.push({
        id: String(product.id),
        productId: String(product.id),
        name: product.name,
        price: Number(product.price),
        cost: Number(product.cost ?? product.tannarx ?? 0),
        tannarx: Number(product.tannarx ?? product.cost ?? 0),
        sotish: Number(product.sotish ?? product.price ?? 0),
        qty,
        quantityKg: qty,
        type: product.type,
        category: product.category,
        currentStock: Number(product.currentStock),
      });
    }

    syncCart(currentCart);
    setAmounts((prev) => ({ ...prev, [product.id]: "" }));
    toast.success("Savatga qo‘shildi");
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => String(item.id) !== String(id));
    syncCart(newCart);
    toast.success("Savatdan olib tashlandi");
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    );
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 pb-24">
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full bg-white rounded-[2rem] border border-slate-100 p-10 text-center text-slate-400 font-black uppercase text-xs">
            Yuklanmoqda...
          </div>
        ) : products.length > 0 ? (
          products.map((p) => {
            const isOutOfStock = Number(p.currentStock) <= 0;

            return (
              <div
                key={p.id}
                className={`bg-white p-4 rounded-[2rem] border transition-all ${
                  isOutOfStock
                    ? "opacity-50 border-slate-100"
                    : "hover:shadow-lg border-slate-100"
                }`}
              >
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-300 mb-2">
                  <span>{p.type}</span>
                  <span
                    className={
                      Number(p.currentStock) < 5 ? "text-orange-500" : ""
                    }
                  >
                    {Number(p.currentStock).toFixed(1)} kg
                  </span>
                </div>

                <h3 className="font-black text-[11px] uppercase text-slate-800 mb-2 h-8 leading-tight">
                  {p.name}
                </h3>

                <p className="text-emerald-600 font-black text-lg mb-4">
                  {Number(p.price).toLocaleString()}{" "}
                  <small className="text-[10px]">uzs</small>
                </p>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={isOutOfStock}
                    value={amounts[p.id] || ""}
                    onChange={(e) =>
                      setAmounts({ ...amounts, [p.id]: e.target.value })
                    }
                    className="w-1/2 bg-slate-50 border-none rounded-xl p-2 text-center font-bold text-xs outline-none"
                    placeholder="0.0"
                  />

                  <button
                    onClick={() => addToCart(p)}
                    disabled={isOutOfStock}
                    className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-[9px] font-black uppercase flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isOutOfStock ? (
                      <PackageX size={12} />
                    ) : (
                      <ShoppingCart size={12} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-[2rem] border border-slate-100 p-10 text-center text-slate-400 font-black uppercase text-xs">
            Mahsulot topilmadi
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col sticky top-8 h-fit max-h-[80vh]">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-black uppercase italic text-slate-800 flex items-center gap-2">
            <ShoppingBag size={18} /> Savat
          </h2>

          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">
            {cart.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-300 text-[10px] font-bold uppercase italic">
              Savat bo'sh
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center gap-3"
              >
                <div>
                  <p className="font-black text-[10px] uppercase text-slate-700 leading-tight">
                    {item.name}
                  </p>

                  <p className="text-[10px] font-bold text-slate-400">
                    {Number(item.qty).toFixed(1)} kg x{" "}
                    {Number(item.price).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 rounded-t-[2rem] space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Jami:
              </span>

              <span className="text-xl font-black text-slate-900">
                {calculateTotal().toLocaleString()}{" "}
                <small className="text-[10px] opacity-40">uzs</small>
              </span>
            </div>

            <button
              onClick={() => navigate("/sales")}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
            >
              Sotuvga o'tish <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}