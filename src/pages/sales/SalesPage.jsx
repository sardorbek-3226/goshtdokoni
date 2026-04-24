import React, { useState, useEffect } from "react";
import { apiService } from "../../api/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  UserCheck,
  ChevronLeft,
  Phone,
} from "lucide-react";

export default function SalesPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("naqd");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("active_cart") || "[]");

    if (savedCart.length === 0) {
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

  const normalizePaymentLabel = (method) => {
    const value = String(method || "").toLowerCase();

    if (value === "naqd") return "Naqd";
    if (value === "karta") return "Karta";
    if (value === "nasiya") return "Nasiya";

    return "Naqd";
  };

  const buildReceiptData = (saleResponse) => {
    const sale = saleResponse?.data || saleResponse || {};

    return {
      companyName: "SIFAT BROYLER 066",
      address: "Yozyovon tumani",
      phone: "+998 94 806 00 66",
      receiptNumber:
        sale.receiptNumber || sale.receiptId || sale.id || Date.now(),
      date: new Date().toLocaleString("uz-UZ"),
      cashier:
        JSON.parse(localStorage.getItem("user") || "null")?.name || "Admin",
      customer: customerName.trim() || sale.customerName || "Naqd mijoz",
      customerPhone: customerPhone.trim(),
      paymentMethod: normalizePaymentLabel(paymentMethod),
      items: cart.map((item) => ({
        name: item.name,
        qty: Number(item.qty || 0),
        price: Number(item.price || item.sotish || 0),
      })),
      totalAmount,
    };
  };

  const generateReceiptHTML = (receipt) => {
    const itemsHtml = receipt.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 6px 0; font-size: 12px;">${item.name}</td>
            <td style="padding: 6px 0; font-size: 12px; text-align:center;">
              ${item.qty}
            </td>
            <td style="padding: 6px 0; font-size: 12px; text-align:right;">
              ${Number(item.price).toLocaleString()}
            </td>
            <td style="padding: 6px 0; font-size: 12px; text-align:right;">
              ${(Number(item.qty) * Number(item.price)).toLocaleString()}
            </td>
          </tr>
        `
      )
      .join("");

    return `
      <html>
        <head>
          <title>Chek</title>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #111;
            }

            .receipt {
              max-width: 380px;
              margin: 0 auto;
              border: 1px dashed #999;
              padding: 16px;
            }

            .center {
              text-align: center;
            }

            .title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .muted {
              font-size: 12px;
              color: #555;
              margin: 2px 0;
            }

            .line {
              border-top: 1px dashed #999;
              margin: 12px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            .total {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: 700;
              margin-top: 12px;
            }

            .footer {
              text-align: center;
              font-size: 12px;
              margin-top: 16px;
            }

            @media print {
              body {
                padding: 0;
              }

              .receipt {
                border: none;
                width: 100%;
                max-width: 100%;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">
            <div class="center">
              <div class="title">${receipt.companyName}</div>
              <div class="muted">${receipt.address}</div>
              <div class="muted">Tel: ${receipt.phone}</div>
            </div>

            <div class="line"></div>

            <div class="muted">Chek raqami: ${receipt.receiptNumber}</div>
            <div class="muted">Sana: ${receipt.date}</div>
            <div class="muted">Kassir: ${receipt.cashier}</div>
            <div class="muted">Mijoz: ${receipt.customer}</div>

            ${
              receipt.customerPhone
                ? `<div class="muted">Mijoz tel: ${receipt.customerPhone}</div>`
                : ""
            }

            <div class="muted">To'lov turi: ${receipt.paymentMethod}</div>

            <div class="line"></div>

            <table>
              <thead>
                <tr>
                  <th style="text-align:left; font-size:12px;">Mahsulot</th>
                  <th style="text-align:center; font-size:12px;">Kg</th>
                  <th style="text-align:right; font-size:12px;">Narx</th>
                  <th style="text-align:right; font-size:12px;">Jami</th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="line"></div>

            <div class="total">
              <span>Jami:</span>
              <span>${Number(receipt.totalAmount).toLocaleString()} UZS</span>
            </div>

            <div class="footer">
              Xaridingiz uchun rahmat!
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
  };

  const printReceipt = (receipt) => {
    const printWindow = window.open("", "_blank", "width=500,height=700");

    if (!printWindow) {
      toast.error("Brauzer print oynasini blokladi!");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(generateReceiptHTML(receipt));
    printWindow.document.close();
  };

  const handleCompleteSale = async () => {
    try {
      setIsSubmitting(true);

      const saleData = {
        items: cart.map((item) => ({
          id: item.id,
          productId: item.productId || item.id,
          name: item.name,
          qty: Number(item.qty),
          quantityKg: Number(item.qty),
          price: Number(item.price || item.sotish || 0),
          sotish: Number(item.price || item.sotish || 0),
          cost: Number(item.cost || item.tannarx || 0),
          tannarx: Number(item.cost || item.tannarx || 0),
        })),

        customer: {
          name: customerName.trim() || "Naqd mijoz",
          phone: customerPhone.trim(),
        },

        customerName: customerName.trim() || "Naqd mijoz",
        customerPhone: customerPhone.trim(),

        paymentMethod,
        totalAmount,
      };
      console.log("SALE DATA:", saleData);

      const res = await apiService.createSale(saleData);

      // 🔥 CHEK CHIQARISH
      const receipt = buildReceiptData(res);
      printReceipt(receipt);

      localStorage.removeItem("active_cart");

      toast.success("Sotuv yakunlandi!");

      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error("Xatolik!");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] hover:text-slate-900"
      >
        <ChevronLeft size={16} /> Ortga qaytish
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="font-black uppercase italic mb-6">
            Tanlangan mahsulotlar
          </h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-slate-50 pb-4"
              >
                <div>
                  <p className="font-black text-xs uppercase">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {item.qty} kg x{" "}
                    {Number(item.price || item.sotish || 0).toLocaleString()}
                  </p>
                </div>

                <span className="font-black text-slate-700">
                  {(
                    Number(item.qty || 0) *
                    Number(item.price || item.sotish || 0)
                  ).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="pt-4 flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Jami summa:
              </span>

              <span className="text-2xl font-black text-emerald-600">
                {totalAmount.toLocaleString()}{" "}
                <small className="text-xs">uzs</small>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="font-black uppercase italic mb-6">
              To'lov tafsilotlari
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                  Mijoz ismi
                </label>

                <div className="relative">
                  <UserCheck
                    className="absolute left-4 top-4 text-slate-300"
                    size={18}
                  />

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 rounded-2xl p-4 pl-12 font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all"
                    placeholder="Masalan: Ali Valiev"
                  />
                </div>
              </div>

              {paymentMethod === "nasiya" && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                    Telefon raqam
                  </label>

                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-4 text-slate-300"
                      size={18}
                    />

                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 rounded-2xl p-4 pl-12 font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                  To'lov turi
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "naqd", name: "Naqd", icon: <Wallet size={16} /> },
                    {
                      id: "karta",
                      name: "Karta",
                      icon: <CreditCard size={16} />,
                    },
                    {
                      id: "nasiya",
                      name: "Nasiya",
                      icon: <UserCheck size={16} />,
                    },
                  ].map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === method.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-50 text-slate-400"
                      }`}
                    >
                      {method.icon}
                      <span className="text-[9px] font-black uppercase">
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={isSubmitting}
            className="w-full bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
