import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, UserCheck, ChevronLeft } from 'lucide-react';

export default function SalesPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('naqd');
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('active_cart') || '[]');
    if (savedCart.length === 0) {
      toast.error("Savat bo'sh!");
      navigate('/products');
    }
    setCart(savedCart);
  }, [navigate]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // =========================
  // SOXTA CHEK API
  // =========================
  const fakeReceiptApi = async (saleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const receipt = {
          receiptNumber: `CHK-${Date.now()}`,
          date: new Date().toLocaleString('uz-UZ'),
          companyName: "SIFAT BROYLER 006",
          address: "Farg'ona, O'zbekiston",
          phone: "+998 90 123 45 67",
          cashier: "Admin",
          customer: saleData.customer?.name || "Oddiy mijoz",
          paymentMethod: saleData.paymentMethod,
          items: saleData.items,
          totalAmount: saleData.totalAmount,
        };

        resolve({
          success: true,
          data: receipt,
        });
      }, 700);
    });
  };

  // =========================
  // CHEK HTML
  // =========================
  const generateReceiptHTML = (receipt) => {
    const itemsHtml = receipt.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 6px 0; font-size: 12px;">${item.name}</td>
            <td style="padding: 6px 0; font-size: 12px; text-align:center;">${item.qty}</td>
            <td style="padding: 6px 0; font-size: 12px; text-align:right;">${Number(item.price).toLocaleString()}</td>
            <td style="padding: 6px 0; font-size: 12px; text-align:right;">${(item.qty * item.price).toLocaleString()}</td>
          </tr>
        `
      )
      .join('');

    return `
      <html>
        <head>
          <title>Chek</title>
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
              setTimeout(() => {
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
  };

  // =========================
  // PRINT FUNCTION
  // =========================
  const printReceipt = (receipt) => {
    const printWindow = window.open('', '_blank', 'width=500,height=700');
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
      if (paymentMethod === 'nasiya' && !customerName) {
        return toast.error("Nasiya uchun mijoz ismini kiriting!");
      }

      const saleData = {
        customer: { name: customerName || "Oddiy mijoz" },
        items: cart,
        totalAmount,
        paymentMethod,
      };

      // 1. Sotuv yaratish
      const res = await apiService.createSale(saleData);

      if (res.success) {
        // 2. Hozircha soxta chek API ishlatamiz
        const receiptRes = await fakeReceiptApi(saleData);

        if (receiptRes.success) {
          // 3. Chek chiqarish
          printReceipt(receiptRes.data);
        }

        toast.success("Sotuv muvaffaqiyatli yakunlandi!");
        localStorage.removeItem('active_cart');
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error("Sotuvni yakunlashda xatolik yuz berdi!");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] hover:text-slate-900"
      >
        <ChevronLeft size={16}/> Ortga qaytish
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CHAP TARAF: SAVAT MA'LUMOTI */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="font-black uppercase italic mb-6">Tanlangan mahsulotlar</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <p className="font-black text-xs uppercase">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {item.qty} kg x {item.price.toLocaleString()}
                  </p>
                </div>
                <span className="font-black text-slate-700">
                  {(item.qty * item.price).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="pt-4 flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-400">Jami summa:</span>
              <span className="text-2xl font-black text-emerald-600">
                {totalAmount.toLocaleString()} <small className="text-xs">uzs</small>
              </span>
            </div>
          </div>
        </div>

        {/* O'NG TARAF: TO'LOV MANTIQI */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="font-black uppercase italic mb-6">To'lov tafsilotlari</h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                  Mijoz ismi (Ixtiyoriy)
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-4 text-slate-300" size={18}/>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 rounded-2xl p-4 pl-12 font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all"
                    placeholder="Masalan: Ali Valiev"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                  To'lov turi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'naqd', name: 'Naqd', icon: <Wallet size={16}/> },
                    { id: 'karta', name: 'Karta', icon: <CreditCard size={16}/> },
                    { id: 'nasiya', name: 'Nasiya', icon: <UserCheck size={16}/> }
                  ].map(method => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-50 text-slate-400'
                      }`}
                    >
                      {method.icon}
                      <span className="text-[9px] font-black uppercase">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            className="w-full bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all"
          >
            Sotuvni yakunlash
          </button>
        </div>
      </div>
    </div>
  );
}