import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { apiService } from "../api/api";

import {
  Package,
  Plus,
  Search,
  Loader2,
  Database,
  ArrowDownCircle,
} from "lucide-react";

export default function WarehousePage() {

  // ================= STATE

  const [products, setProducts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [form, setForm] = useState({
    productId: "",
    quantityKg: "",
  });



  // ================= LOAD PRODUCTS

  const loadProducts = async () => {

    try {

      setLoading(true);

      // PRODUCTS API
      const productsRes =
        await apiService.getProducts();

      console.log(
        "PRODUCTS API:",
        productsRes
      );

      // WAREHOUSE API
      const warehouseRes =
        await apiService.getWarehouse();

      console.log(
        "WAREHOUSE API:",
        warehouseRes
      );

      // ARRAYGA O'TKAZISH
      const productsData =
        Array.isArray(productsRes)
          ? productsRes
          : productsRes?.data || [];

      const warehouseData =
        Array.isArray(warehouseRes)
          ? warehouseRes
          : warehouseRes?.data || [];

      // MERGE
      const merged =
        productsData.map((product) => {

          const stock =
            warehouseData.find(
              (w) =>
                String(
                  w.productId ||
                  w.id ||
                  w.product?.id
                ) ===
                String(product.id)
            );

            return {

              id: String(product.id),
            
              name:
                product.name ||
                "Nomsiz",
            
              category:
                product.category ||
                "Kategoriya",
            
              price: Number(
                product.sotish ||
                product.price ||
                0
              ),
            
              cost: Number(
                product.tannarx ||
                product.cost ||
                0
              ),
            
              currentStock: Number(
                product.stockKg ||
                stock?.stockKg ||
                stock?.quantityKg ||
                stock?.currentStock ||
                stock?.stock ||
                stock?.quantity ||
                0
              ),
            };
        });

      console.log(
        "MERGED DATA:",
        merged
      );

      setProducts(merged);

    } catch (err) {

      console.log(
        "LOAD ERROR:",
        err
      );

      toast.error(
        "Ma'lumotlarni yuklashda xato!"
      );

    } finally {

      setLoading(false);

    }
  };



  // ================= PAGE LOAD

  useEffect(() => {

    loadProducts();

  }, []);




  // ================= ADD STOCK

  const handleAddStock = async (e) => {

    e.preventDefault();

    try {

      if (
        !form.productId ||
        !form.quantityKg
      ) {
        return toast.error(
          "Ma'lumotlarni to'ldiring"
        );
      }

      setSubmitting(true);

      await apiService.receiveStock({

        productId:
          form.productId,

        quantityKg: Number(
          form.quantityKg
        ),
      });

      toast.success(
        "Mahsulot omborga qo'shildi!"
      );

      setForm({
        productId: "",
        quantityKg: "",
      });

      // reload
      await loadProducts();

    } catch (err) {

      console.log(
        "ADD STOCK ERROR:",
        err
      );

      toast.error(
        "Qo'shishda xato"
      );

    } finally {

      setSubmitting(false);

    }
  };




  // ================= FILTER

  const filtered =
    products.filter((p) =>
      p.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );



  // ================= TOTAL

  const totalStockValue =
    filtered.reduce(
      (sum, p) =>
        sum +
        Number(
          p.currentStock || 0
        ) *
          Number(
            p.cost || 0
          ),

      0
    );




  // ================= UI

  return (

    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 italic font-bold">

      <div className="max-w-7xl mx-auto space-y-8">


        {/* HEADER */}

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">

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
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500"
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

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">

              <h2 className="font-black uppercase italic mb-6 text-sm flex items-center gap-2">

                <ArrowDownCircle
                  size={18}
                  className="text-emerald-500"
                />

                Yangi Kirim

              </h2>


              <form
                onSubmit={handleAddStock}
                className="space-y-5"
              >

                {/* SELECT */}

                <select
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                  value={form.productId}
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



                {/* INPUT */}

                <input
                  type="number"
                  placeholder="KG"
                  className="w-full p-5 bg-slate-50 rounded-3xl outline-none text-center text-2xl font-black"
                  value={form.quantityKg}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantityKg:
                        e.target.value,
                    })
                  }
                />



                {/* BUTTON */}

                <button
                  disabled={submitting}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all"
                >

                  {submitting ? (

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                  ) : (

                    <Plus size={18} />

                  )}

                  Omborga qo'shish

                </button>

              </form>

            </div>

          </div>





          {/* RIGHT */}

          <div className="lg:col-span-8">

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">

              <table className="w-full text-left border-collapse">

                <thead className="bg-slate-50">

                  <tr className="text-[10px] uppercase text-slate-400 font-black">

                    <th className="p-6">
                      Mahsulot
                    </th>

                    <th className="p-6 text-center">
                      Narxi
                    </th>

                    <th className="p-6 text-right">
                      Ombor
                    </th>

                    <th className="p-6 text-right">
                      Qiymati
                    </th>

                  </tr>

                </thead>



                <tbody className="divide-y divide-slate-50">

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
                        className="p-20 text-center text-slate-300"
                      >

                        Mahsulot topilmadi

                      </td>

                    </tr>

                  ) : (

                    filtered.map((p) => {

                      const stockValue =
                        Number(
                          p.currentStock
                        ) *
                        Number(
                          p.cost
                        );

                      return (

                        <tr
                          key={p.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="p-6">

                            <div className="flex items-center gap-3">

                              <Package size={18} />

                              {p.name}

                            </div>

                          </td>



                          <td className="p-6 text-center">

                            {Number(
                              p.price
                            ).toLocaleString()}

                            {" "}UZS

                          </td>



                          <td className="p-6 text-right">

                            {Number(
                              p.currentStock
                            ).toFixed(1)}

                            {" "}KG

                          </td>



                          <td className="p-6 text-right">

                            {stockValue.toLocaleString()}

                            {" "}UZS

                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>



                {!loading &&
                  filtered.length > 0 && (

                  <tfoot className="bg-slate-900">

                    <tr>

                      <td
                        colSpan="3"
                        className="p-6 text-white font-black"
                      >

                        Jami qiymat

                      </td>

                      <td className="p-6 text-right text-emerald-400 font-black text-lg">

                        {totalStockValue.toLocaleString()}

                        {" "}UZS

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