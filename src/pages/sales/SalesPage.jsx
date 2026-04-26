import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Wallet, CreditCard, UserCheck, ChevronLeft, Phone } from "lucide-react";

export default function SalesPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("naqd");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("active_cart") || "[]");

    if (!savedCart.length) {
      toast.error("Savat bo'sh!");
      navigate("/products");
      return;
    }

    setCart(savedCart);
  }, [navigate]);

  const totalAmount = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || item.sotish || 0) * Number(item.qty || 0),
    0
  );

  const printReceipt = (receipt) => {
    const html = `
      <html>
        <head>
          <title>Chek</title>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial; padding: 20px; }
            .receipt { max-width: 380px; margin: auto; border: 1px dashed #999; padding: 16px; }
            .center { text-align: center; }
            .title { font-size: 20px; font-weight: 700; }
            .line { border-top: 1px dashed #999; margin: 12px 0; }
            .muted { font-size: 12px; color: #555; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            td, th { padding: 6px 0; }
            .total { display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <div class="title">SIFAT BROYLER 066</div>
              <div class="muted">Yozyovon tumani</div>
              <div class="muted">+998 94 806 00 66</div>
            </div>

            <div class="line"></div>

            <div class="muted">Chek: ${receipt.id}</div>
            <div class="muted">Sana: ${receipt.date}</div>
            <div class="muted">Mijoz: ${receipt.customerName}</div>
            <div class="muted">To'lov: ${receipt.paymentMethod}</div>

            <div class="line"></div>

            <table>
              <thead>
                <tr>
                  <th align="left">Mahsulot</th>
                  <th align="center">Kg</th>
                  <th align="right">Narx</th>
                  <th align="right">Jami</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.items
                  .map(
                    (i) => `
                    <tr>
                      <td>${i.name}</td>
                      <td align="center">${i.quantityKg}</td>
                      <td align="right">${Number(i.price).toLocaleString()}</td>
                      <td align="right">${Number(i.total).toLocaleString()}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="line"></div>

            <div class="total">
              <span>Jami:</span>
              <span>${Number(receipt.total).toLocaleString()} UZS</span>
            </div>

            <div class="center muted" style="margin-top:16px;">
              Xaridingiz uchun rahmat!
            </div>
          </div>

          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=500,height=700");
    if (!w) return toast.error("Print oynasi bloklandi!");

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleCompleteSale = async () => {
    if (!cart.length) return toast.error("Savat bo‘sh!");
  
    try {
      setIsSubmitting(true);
  
      const saleData = {
        id: Date.now(),
        date: new Date().toISOString(),
        customerName: customerName.trim() || "Naqd mijoz",
        customerPhone: customerPhone.trim(),
        paymentMethod,
        totalAmount,
        items: cart.map((item) => ({
          id: item.id,
          productId: item.productId || item.id,
          name: item.name,
          quantityKg: Number(item.quantityKg || item.qty || 0),
          qty: Number(item.quantityKg || item.qty || 0),
          price: Number(item.price || item.sotish || 0),
          sotish: Number(item.price || item.sotish || 0),
          cost: Number(item.cost || item.tannarx || 0),
          tannarx: Number(item.cost || item.tannarx || 0),
        })),
      };
  
      await apiService.createSale(saleData);
      if (paymentMethod === "nasiya") {
        await apiService.addDebtCustomer({
          name: customerName.trim() || "Nasiya mijoz",
          phone: customerPhone.trim(),
        });
      }
      // 1) zaxiradan ayirish
      const warehouseBackup = JSON.parse(
        localStorage.getItem("warehouse_backup") || "[]"
      );
  
      const updatedWarehouse = warehouseBackup.map((p) => {
        const sold = saleData.items.find(
          (i) => String(i.productId) === String(p.productId || p.id)
        );
  
        if (!sold) return p;
  
        return {
          ...p,
          currentStock: Math.max(
            0,
            Number(p.currentStock || 0) - Number(sold.quantityKg || 0)
          ),
        };
      });
  
      localStorage.setItem("warehouse_backup", JSON.stringify(updatedWarehouse));
  
      const oldSales = JSON.parse(localStorage.getItem("sales_history") || "[]");
      localStorage.setItem("sales_history", JSON.stringify([...oldSales, saleData]));
  
      // 3) nasiya bo‘lsa qarzdorga yozish
      if (paymentMethod === "nasiya") {
        const oldDebts = JSON.parse(localStorage.getItem("debts") || "[]");
  
        const newDebt = {
          id: Date.now(),
          saleId: saleData.id,
          name: saleData.customerName,
          phone: saleData.customerPhone,
          totalDebt: totalAmount,
          remainingDebt: totalAmount,
          paidAmount: 0,
          date: new Date().toLocaleDateString("uz-UZ"),
          items: saleData.items,
        };
  
        localStorage.setItem("debts", JSON.stringify([...oldDebts, newDebt]));
      }
  
      const receipt = {
        id: saleData.id,
        date: new Date().toLocaleString("uz-UZ"),
        customerName: saleData.customerName,
        paymentMethod,
        items: saleData.items.map((item) => ({
          name: item.name,
          quantityKg: item.quantityKg,
          price: item.price,
          total: item.quantityKg * item.price,
        })),
        total: totalAmount,
      };
  
      printReceipt(receipt);
  
      localStorage.removeItem("active_cart");
  
      toast.success("Sotuv yakunlandi!");
      navigate("/products");
    } catch (err) {
      console.error("SALE ERROR:", err?.response?.data || err);
      toast.error("Sotuvda xatolik!");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px]"
      >
        <ChevronLeft size={16} /> Ortga qaytish
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
          <h2 className="font-black uppercase italic mb-6">
            Tanlangan mahsulotlar
          </h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-4">
                <div>
                  <p className="font-black text-xs uppercase">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {item.qty} kg x{" "}
                    {Number(item.price || item.sotish || 0).toLocaleString()}
                  </p>
                </div>

                <span className="font-black">
                  {(
                    Number(item.qty || 0) *
                    Number(item.price || item.sotish || 0)
                  ).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="pt-4 flex justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Jami summa:
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {totalAmount.toLocaleString()} uzs
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
            <h2 className="font-black uppercase italic mb-6">
              To'lov tafsilotlari
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <UserCheck
                  className="absolute left-4 top-4 text-slate-300"
                  size={18}
                />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 rounded-2xl p-4 pl-12 font-bold outline-none"
                  placeholder="Mijoz ismi"
                />
              </div>

              {paymentMethod === "nasiya" && (
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-4 text-slate-300"
                    size={18}
                  />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 rounded-2xl p-4 pl-12 font-bold outline-none"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "naqd", name: "Naqd", icon: <Wallet size={16} /> },
                  { id: "karta", name: "Karta", icon: <CreditCard size={16} /> },
                  { id: "nasiya", name: "Nasiya", icon: <UserCheck size={16} /> },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${
                      paymentMethod === m.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-50 text-slate-400"
                    }`}
                  >
                    {m.icon}
                    <span className="text-[9px] font-black uppercase">
                      {m.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={isSubmitting}
            className="w-full bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs"
          >
            {isSubmitting
              ? "Yuklanmoqda..."
              : "Sotuvni yakunlash va chek chiqarish"}
          </button>
        </div>
      </div>
    </div>
  );
}