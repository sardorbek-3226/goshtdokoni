import React, { useEffect, useState } from "react";
import { apiService } from "../api/api";
import { toast } from "react-hot-toast";
import {
  Package,
  Plus,
  Search,
  Loader2,
  Database,
  ArrowDownCircle,
} from "lucide-react";

export default function WarehousePage() {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    productId: "",
    weight: "",
  });

  // =========================
  // SAFE ARRAY NORMALIZER
  // =========================

  const normalizeArray = (res) => {
    if (!res) return [];

    if (Array.isArray(res)) return res;

    if (Array.isArray(res.data)) return res.data;

    if (Array.isArray(res.data?.data))
      return res.data.data;

    if (Array.isArray(res.items))
      return res.items;

    if (Array.isArray(res.result))
      return res.result;

    return [];
  };

  // =========================
  // STOCK VALUE GETTER
  // =========================

  const getStockValue = (item) => {
    if (!item) return 0;

    return Number(
      item.quantityKg ??
      item.currentStock ??
      item.quantity ??
      item.stock ??
      item.amount ??
      item.data?.quantityKg ??
      0
    );
  };

  // =========================
  // PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      const res =
        await apiService.getProducts();

      console.log(
        "PRODUCTS API:",
        res
      );

      const data =
        normalizeArray(res);

      setProducts(data);

    } catch (err) {

      console.log(err);

      toast.error(
        "Mahsulotlarni yuklashda xato"
      );
    }
  };

  // =========================
  // WAREHOUSE
  // =========================

  const loadWarehouse = async () => {
    try {

      const res =
        await apiService.getWarehouse();

      console.log(
        "WAREHOUSE API:",
        res
      );

      const data =
        normalizeArray(res);

      setStock(data);

    } catch (err) {

      console.log(err);

      toast.error(
        "Warehouse yuklanmadi"
      );
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);
  
      const productsRes = await apiService.getProducts();
      console.log("PRODUCTS FROM API:", productsRes);
  
      const productsData = normalizeArray(productsRes);
  
      const formattedData = productsData.map((product) => ({
        id: String(product.id),
        name: product.name || "Nomsiz",
        price: Number(product.sotish || 0),
        cost: Number(product.tannarx || 0),
        currentStock: Number(product.stockKg || 0), 
      }));
  
      setProducts(formattedData);
    } catch (err) {
      console.log(err);
      toast.error("Yuklashda xato");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // MERGE PRODUCTS + STOCK
  // =========================

  const mergedProducts = products.map((product) => {
    return {
      id: product.id,
  
      // API-dan kelayotgan 'name' field
      name: product.name || "Noma'lum",
  
      // API-dan kelayotgan 'sotish' field (string bo'lgani uchun Number ga o'giramiz)
      price: Number(product.sotish || 0),
  
      // API-dan kelayotgan 'tannarx' field
      cost: Number(product.tannarx || 0),
  
      // API-dan kelayotgan 'stockKg' field
      currentStock: Number(product.stockKg || 0),
    };
  });
  
  console.log("YANGI MERGED PRODUCTS:", mergedProducts);

  // =========================
  // FILTER
  // =========================

  const filtered =
    mergedProducts.filter((p) =>
      p.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  // =========================
  // TOTAL
  // =========================

  const totalStockValue =
    filtered.reduce(
      (sum, p) => {

        return (
          sum +
          Number(
            p.currentStock || 0
          ) *
            Number(
              p.cost || 0
            )
        );
      },
      0
    );

  // =========================
  // ADD STOCK
  // =========================

  const handleAddStock =
    async (e) => {

      e.preventDefault();

      const weight =
        parseFloat(form.weight);

      if (
        !form.productId ||
        isNaN(weight) ||
        weight <= 0
      ) {
        return toast.error(
          "Ma'lumotlarni to‘g‘ri kiriting"
        );
      }

      try {

        await apiService.receiveStock({
          productId:
            form.productId,

          quantityKg: weight,
        });

        toast.success(
          "Yuk qo‘shildi"
        );

        setForm({
          productId: "",
          weight: "",
        });

        await loadWarehouse();

      } catch (err) {

        console.log(err);

        toast.error(
          "Qo‘shishda xato"
        );
      }
    };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">

          <h1 className="text-xl font-black uppercase flex items-center gap-3">
            <Database className="text-emerald-500" />
            Ombor Boshqaruvi
          </h1>

          <div className="relative w-full md:w-80">

            <Search
              className="absolute left-4 top-3 text-slate-300"
              size={18}
            />

            <input
              type="text"
              placeholder="Qidirish..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none border"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT */}

          <div className="lg:col-span-4">

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border">

              <h2 className="font-black uppercase mb-6 flex items-center gap-2">
                <ArrowDownCircle
                  size={18}
                  className="text-emerald-500"
                />
                Yangi Kirim
              </h2>

              <form
                onSubmit={
                  handleAddStock
                }
                className="space-y-5"
              >

                <select
                  className="w-full p-4 rounded-2xl border bg-slate-50"
                  value={
                    form.productId
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      productId:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Mahsulot tanlang
                  </option>

                  {products.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.1"
                  placeholder="KG"
                  className="w-full p-4 rounded-2xl border bg-slate-50"
                  value={form.weight}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weight:
                        e.target.value,
                    })
                  }
                />

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">

                  <Plus size={18} />

                  Qo‘shish
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT */}

          <div className="lg:col-span-8">

            <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="text-xs uppercase text-slate-400">

                    <th className="p-6 text-left">
                      Mahsulot
                    </th>

                    <th className="p-6 text-center">
                      Narxi
                    </th>

                    <th className="p-6 text-right">
                      Zaxira
                    </th>

                    <th className="p-6 text-right">
                      Qiymati
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="p-20 text-center"
                      >
                        <Loader2 className="animate-spin mx-auto text-emerald-500" />
                      </td>
                    </tr>

                  ) : filtered.length === 0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="p-20 text-center"
                      >
                        Ma'lumot topilmadi
                      </td>
                    </tr>

                  ) : (

                    filtered.map((p) => {

                      const value =
                        Number(
                          p.currentStock
                        ) *
                        Number(
                          p.cost
                        );

                      return (

                        <tr
                          key={p.id}
                          className="border-t"
                        >

                          <td className="p-6">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">

                                <Package size={18} />

                              </div>

                              <span className="font-bold uppercase text-sm">
                                {p.name}
                              </span>
                            </div>
                          </td>

                          <td className="p-6 text-center">

                            <div className="text-red-400 text-xs line-through">
                              {p.cost.toLocaleString()} UZS
                            </div>

                            <div className="text-emerald-600 font-black">
                              {p.price.toLocaleString()} UZS
                            </div>
                          </td>

                          <td className="p-6 text-right">

                            <div className="inline-block bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-xs">
                              {Number(
                                p.currentStock
                              ).toFixed(1)} KG
                            </div>
                          </td>

                          <td className="p-6 text-right font-black">

                            {value.toLocaleString()} UZS
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {!loading &&
                  filtered.length >
                    0 && (

                  <tfoot className="bg-slate-900">

                    <tr>

                      <td
                        colSpan="3"
                        className="p-6 text-white font-black"
                      >
                        Jami qiymat
                      </td>

                      <td className="p-6 text-right text-emerald-400 font-black text-lg">

                        {totalStockValue.toLocaleString()} UZS
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}