
import React, { useEffect, useState } from "react";

import {
  Search,
  Phone,
  UserX,
  CheckCircle,
  X,
  UserPlus,
} from "lucide-react";

import { toast } from "react-hot-toast";
import { apiService } from "../api/api";

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDebt, setSelectedDebt] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [newDebt, setNewDebt] =
    useState({
      name: "",
      phone: "",
      amount: "",
    });

  // ================= LOAD

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);

      // API DATA
      const apiData =
        await apiService.getDebts();

      // LOCAL DATA
      const localData = JSON.parse(
        localStorage.getItem("debts") ||
          "[]"
      );

      const apiDebts = Array.isArray(
        apiData
      )
        ? apiData
        : [];

      const localDebts = Array.isArray(
        localData
      )
        ? localData
        : [];

      // MERGE
      const merged = [...apiDebts];

      localDebts.forEach((localDebt) => {
        const exists = merged.find(
          (d) =>
            String(d.id) ===
            String(localDebt.id)
        );

        if (!exists) {
          merged.push(localDebt);
        }
      });

      setDebts(merged);

      localStorage.setItem(
        "debts",
        JSON.stringify(merged)
      );

      console.log(
        "API DEBTS:",
        merged
      );
    } catch (err) {
      console.log(err);

      const local = JSON.parse(
        localStorage.getItem("debts") ||
          "[]"
      );

      setDebts(local);
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD NEW DEBT

  const handleAddNewDebt = async (e) => {
    e.preventDefault();

    const amount = Number(
      newDebt.amount
    );

    if (!newDebt.name.trim()) {
      return toast.error(
        "Mijoz ismini kiriting!"
      );
    }

    if (!amount || amount <= 0) {
      return toast.error(
        "Qarz miqdorini kiriting!"
      );
    }

    const debtEntry = {
      id: Date.now(),

      customerName:
        newDebt.name.trim(),

      name: newDebt.name.trim(),

      phone: newDebt.phone.trim(),

      totalDebt: amount,

      remainingDebt: amount,

      paidAmount: 0,

      date: new Date().toISOString(),

      lastUpdate:
        new Date().toLocaleString(),

      type: "manual",

      items: [],
    };

    try {
      // API
      try {
        await apiService.createDebt(
          debtEntry
        );
      } catch (err) {
        console.log(
          "API CREATE ERROR:",
          err
        );
      }

      const updated = [
        ...debts,
        debtEntry,
      ];

      setDebts(updated);

      localStorage.setItem(
        "debts",
        JSON.stringify(updated)
      );

      toast.success(
        "Qarz qo‘shildi!"
      );

      setNewDebt({
        name: "",
        phone: "",
        amount: "",
      });

      setIsAddModalOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= PAYMENT

  const handlePayment = async () => {
    const amount = Number(
      paymentAmount
    );

    if (!amount || amount <= 0) {
      return toast.error(
        "To‘lov summasini kiriting!"
      );
    }

    try {
      // API PAYMENT
      try {
        await apiService.payDebt(
          selectedDebt.id,
          amount
        );
      } catch (err) {
        console.log(
          "API PAYMENT ERROR:",
          err
        );
      }

      const updatedDebts = debts.map(
        (d) => {
          if (
            String(d.id) !==
            String(selectedDebt.id)
          ) {
            return d;
          }

          const oldRemaining =
            Number(
              d.remainingDebt ||
                d.totalDebt ||
                d.debt ||
                0
            );

          const oldPaid = Number(
            d.paidAmount || 0
          );

          const newRemaining =
            Math.max(
              0,
              oldRemaining - amount
            );

          return {
            ...d,

            paidAmount:
              oldPaid + amount,

            remainingDebt:
              newRemaining,

            lastUpdate:
              new Date().toLocaleString(),
          };
        }
      );

      setDebts(updatedDebts);

      localStorage.setItem(
        "debts",
        JSON.stringify(updatedDebts)
      );

      // PAYMENT HISTORY

      const paymentHistory =
        JSON.parse(
          localStorage.getItem(
            "payment_history"
          ) || "[]"
        );

      paymentHistory.push({
        id: Date.now(),

        customerName:
          selectedDebt.customerName ||
          selectedDebt.name ||
          "Nomsiz",

        amount,

        date: new Date().toISOString(),
      });

      localStorage.setItem(
        "payment_history",
        JSON.stringify(
          paymentHistory
        )
      );

      toast.success(
        "To‘lov qabul qilindi!"
      );

      setSelectedDebt(null);
      setPaymentAmount("");
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FILTER

  const filteredDebts =
    Array.isArray(debts)
      ? debts.filter((d) =>
          String(
            d.customerName ||
              d.name ||
              ""
          )
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        )
      : [];

  // ================= TOTAL

  const totalDebt =
    filteredDebts.reduce(
      (sum, debt) => {
        return (
          sum +
          Number(
            debt.remainingDebt ||
              debt.totalDebt ||
              debt.debt ||
              0
          )
        );
      },
      0
    );

  // ================= LOADING

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-black">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 italic font-bold">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.5rem] flex items-center justify-center">

              <UserX size={28} />

            </div>

            <div>

              <h1 className="text-2xl font-black uppercase italic text-slate-900">
                Nasiyalar
              </h1>

              <p className="text-[10px] text-slate-400 uppercase">

                Jami qarz:
                {" "}
                {totalDebt.toLocaleString()}
                {" "}
                UZS

              </p>

            </div>

          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">

            <div className="relative flex-1 md:w-64">

              <Search
                className="absolute left-4 top-3 text-slate-300"
                size={18}
              />

              <input
                type="text"
                placeholder="Qidirish..."
                className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl outline-none"
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            <button
              onClick={() =>
                setIsAddModalOpen(true)
              }
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
            >

              <UserPlus size={18} />

              Yangi Qarz

            </button>

          </div>

        </div>

        {/* LIST */}

        <div className="grid grid-cols-1 gap-4">

          {filteredDebts.map((debt) => {

            const name =
              debt.customerName ||
              debt.name ||
              "Nomsiz mijoz";

            const amount = Number(
              debt.remainingDebt ||
                debt.totalDebt ||
                debt.debt ||
                0
            );

            return (
              <div
                key={debt.id}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"
              >

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black italic border">

                    {String(name).charAt(0)}

                  </div>

                  <div>

                    <h3 className="font-black uppercase text-slate-800">
                      {name}
                    </h3>

                    <p className="text-[10px] text-slate-400 flex items-center gap-2">

                      <Phone size={10} />

                      {debt.phone || "N/A"}

                    </p>

                    <p className="text-[9px] text-slate-300">

                      {debt.lastUpdate || ""}

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-6">

                  <div className="text-right">

                    <p className="text-[9px] uppercase text-slate-400">
                      Qarz
                    </p>

                    <p className="text-lg font-black text-rose-600">

                      {amount.toLocaleString()}
                      {" "}
                      UZS

                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedDebt(debt)
                    }
                    className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"
                  >

                    <CheckCircle size={20} />

                  </button>

                </div>

              </div>
            );
          })}

          {filteredDebts.length ===
            0 && (
            <div className="text-center py-20 text-slate-300 font-black uppercase">
              Qarzlar yo‘q
            </div>
          )}

        </div>

      </div>

      {/* ADD MODAL */}

      {isAddModalOpen && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">

            <div className="flex justify-between items-center mb-8">

              <h2 className="text-xl font-black uppercase italic">
                Qarz qo‘shish
              </h2>

              <button
                onClick={() =>
                  setIsAddModalOpen(false)
                }
                className="p-2 bg-slate-50 rounded-full"
              >

                <X size={20} />

              </button>

            </div>

            <form
              onSubmit={
                handleAddNewDebt
              }
              className="space-y-5"
            >

              <input
                type="text"
                required
                placeholder="Mijoz Ismi"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none"
                value={newDebt.name}
                onChange={(e) =>
                  setNewDebt({
                    ...newDebt,
                    name:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="+998"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none"
                value={newDebt.phone}
                onChange={(e) =>
                  setNewDebt({
                    ...newDebt,
                    phone:
                      e.target.value,
                  })
                }
              />

              <input
                type="number"
                required
                placeholder="Qarz summasi"
                className="w-full bg-slate-50 p-5 rounded-2xl outline-none text-2xl font-black"
                value={newDebt.amount}
                onChange={(e) =>
                  setNewDebt({
                    ...newDebt,
                    amount:
                      e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black"
              >
                Qo‘shish
              </button>

            </form>

          </div>

        </div>

      )}

      {/* PAYMENT MODAL */}

      {selectedDebt && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-10 p-4 z-50">

          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl">

            <h2 className="font-black uppercase italic text-center mb-6">
              Qarzni yopish
            </h2>

            <div className="bg-rose-50 p-6 rounded-[2rem] text-center mb-6">

              <p className="text-[10px] text-rose-400 uppercase">

                {selectedDebt.customerName ||
                  selectedDebt.name}

              </p>

              <p className="text-2xl font-black text-rose-600">

                {Number(
                  selectedDebt.remainingDebt ||
                    selectedDebt.totalDebt ||
                    selectedDebt.debt ||
                    0
                ).toLocaleString()}
                {" "}
                UZS

              </p>

            </div>

            <input
              autoFocus
              type="number"
              className="w-full bg-slate-50 rounded-[2rem] p-6 text-2xl font-black outline-none text-center mb-6"
              value={paymentAmount}
              onChange={(e) =>
                setPaymentAmount(
                  e.target.value
                )
              }
              placeholder="To‘lov summasi"
            />

            <button
              onClick={handlePayment}
              className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black"
            >
              To‘lovni tasdiqlash
            </button>

            <button
              onClick={() =>
                setSelectedDebt(null)
              }
              className="w-full mt-4 text-slate-400 uppercase text-[9px]"
            >
              Bekor qilish
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

