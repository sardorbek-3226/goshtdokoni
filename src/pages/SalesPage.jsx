import React, { useState, useEffect } from "react";
import { apiService } from "../api/api";
import qz from "qz-tray";
import { toast } from "react-hot-toast";
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, Loader2, 
  Scale, Wallet, CreditCard, UserCheck, Phone, ChevronLeft, CheckCircle2 
} from "lucide-react";
export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  // Sahifa holati: 'list' (ro'yxat) yoki 'checkout' (to'lov)
  const [view, setView] = useState("list"); 

  // Modal va To'lov holatlari
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputWeight, setInputWeight] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("naqd");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getProducts();
      const apiData = Array.isArray(res) ? res : (res?.data || []);
      const localStock = JSON.parse(localStorage.getItem("warehouse_backup") || "[]");

      const merged = apiData.map(p => {
        const stockEntry = localStock.find(s => String(s.productId || s.id) === String(p.id));
        return {
          ...p,
          id: String(p.id),
          price: Number(p.price || p.sotish || 0),
          currentStock: stockEntry ? Number(stockEntry.currentStock || 0) : 0
        };
      });
      setProducts(merged);
    } catch (err) {
      toast.error("Ma'lumot yuklashda xato!");
    } finally {
      setLoading(false);
    }
  };
 // 1. CHEK CHIQARISH FUNKSIYASI
 const printReceipt = (receipt) => {
  const COMPANY_NAME = "SIFAT BROYLER 066";
  const ADDRESS = "Yozyovon tumani, Markaziy ko'cha";
  const PHONES = "+998 90 123 45 67, +998 91 789 00 11";

  // Minglik ajratgich (000 chiqishi uchun)
  const formatNumber = (num) => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(num));
  };

  const html = `
    <html>
      <head>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Arial', sans-serif; 
            width: 100%; 
            margin: 0; 
            padding: 5mm; 
            padding-bottom: 70mm; /* Qog'ozni majburiy surish */
            font-size: 14px; 
            font-weight: 900; 
            text-transform: uppercase;
            color: #000;
            line-height: 1.2;
          }
          .center { text-align: center; }
          .brand { font-size: 22px; font-weight: 900; border-bottom: 3px solid #000; margin-bottom: 5px; padding-bottom: 5px; }
          .line { border-top: 3px solid #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; border-bottom: 2px solid #000; padding-bottom: 5px; font-size: 13px; }
          td { padding: 7px 0; font-size: 15px; font-weight: 900; }
          .right { text-align: right; }
          .total-section { margin-top: 10px; border-top: 3px solid #000; padding-top: 10px; }
          .total-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: 900; }
          .footer { text-align: center; margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="brand">${COMPANY_NAME}</div>
          <div style="font-size: 11px;">${ADDRESS}</div>
          <div style="font-size: 11px;">TEL: ${PHONES}</div>
        </div>

        <div class="line"></div>
        
        <div>
          ID: #${receipt.id}<br/>
          SANA: ${new Date().toLocaleString('uz-UZ')}<br/>
          MIJOZ: ${receipt.customerName || "NAQD MIJOZ"}
        </div>

        <div class="line"></div>

        <table>
          <thead>
            <tr>
              <th width="45%">NOMI</th>
              <th width="20%">KG</th>
              <th width="35%" class="right">SUMMA</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map(i => `
              <tr>
                <td>${i.name}</td>
                <td>${Number(i.qty).toFixed(2)}</td>
                <td class="right">${formatNumber(Number(i.price) * Number(i.qty))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>JAMI:</span>
            <span>${formatNumber(receipt.total)} UZS</span>
          </div>
          <div style="margin-top: 5px; font-size: 13px;">
            TO'LOV: ${(receipt.paymentMethod || "NAQD").toUpperCase()}
          </div>
        </div>

        <div class="footer">
          XARIDINGIZ UCHUN RAHMAT!<br/>
          YANA KELIB TURING!
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => { window.close(); }, 500);
          };
        </script>
      </body>
    </html>`;

  const w = window.open("", "_blank", "width=450,height=700");
  if (w) {
    w.document.write(html);
    w.document.close();
  } else {
    alert("Brauzerda oyna ochishga ruxsat bering (Popup allowed)");
  }
};

// 2. SOTUVNI YAKUNLASH FUNKSIYASI
const handleCompleteSale = async () => {
  if (!cart || cart.length === 0) {
    return toast.error("Savat bo'sh!");
  }

  try {
    setIsSubmitting(true);

    // Barcha hisob-kitoblar Number() bilan tekshiriladi
    const currentTotalAmount = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
    const totalCost = cart.reduce((sum, item) => sum + (Number(item.cost || 0) * Number(item.qty || 0)), 0);

    const saleId = Date.now();
    const saleData = {
      id: saleId,
      date: new Date().toISOString(),
      customerName: customerName || "Naqd mijoz",
      customerPhone: customerPhone || "",
      paymentMethod: paymentMethod,
      totalAmount: currentTotalAmount,
      profit: currentTotalAmount - totalCost,
      items: cart.map(i => ({ ...i, qty: Number(i.qty), price: Number(i.price) }))
    };

    // LocalStorage-ga saqlash
    const currentSales = JSON.parse(localStorage.getItem("sales_history") || "[]");
    localStorage.setItem("sales_history", JSON.stringify([...currentSales, saleData]));

    // Zaxirani kamaytirish
    const currentStock = JSON.parse(localStorage.getItem("warehouse_backup") || "[]");
    const updatedStock = currentStock.map(stockItem => {
      const soldItem = cart.find(c => String(c.id) === String(stockItem.productId || stockItem.id));
      return soldItem ? { ...stockItem, currentStock: Number(stockItem.currentStock) - Number(soldItem.qty) } : stockItem;
    });
    localStorage.setItem("warehouse_backup", JSON.stringify(updatedStock));

    // API yuborish (ixtiyoriy)
    if (apiService?.createSale) {
      await apiService.createSale(saleData).catch(e => console.log("API error ignored"));
    }

    // CHEK CHIQARISH
    printReceipt({
      id: saleId,
      customerName: saleData.customerName,
      items: cart,
      total: currentTotalAmount,
      paymentMethod: paymentMethod
    });

    // Tozalash
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setView("list");
    toast.success("Sotuv yakunlandi!");
    if (typeof loadData === 'function') loadData();

  } catch (err) {
    console.error(err);
    toast.error("Xatolik yuz berdi!");
  } finally {
    setIsSubmitting(false);
  }
};
// 2. SOTUVNI YAKUNLASH FUNKSIYASI (Xatosiz)
const onSaleFinish = (saleData) => {
    // saleData ichida cart, totalAmount, customerName va h.k. bo'ladi
    printReceipt({
      id: saleData.id,
      customerName: saleData.customerName,
      items: saleData.cart,
      total: saleData.totalAmount,
      paymentMethod: saleData.paymentMethod
    });
};

 
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 italic font-bold">
      <div className="max-w-5xl mx-auto">
        
        {/* VIEW 1: MAHSULOTLAR RO'YXATI */}
        {view === "list" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center gap-4">
              <h1 className="text-xl font-black uppercase flex items-center gap-2 text-slate-800">
                <ShoppingCart className="text-emerald-500" /> Mahsulotlar
              </h1>
              <input 
                type="text" placeholder="Qidirish..." 
                className="bg-slate-50 p-3 px-6 rounded-2xl outline-none border-none w-full max-w-xs"
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" /> :
                products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-black uppercase text-xs mb-2">{p.name}</h3>
                    <p className="text-emerald-600 font-black text-lg mb-4">{p.price.toLocaleString()} UZS</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase italic">{p.currentStock.toFixed(1)} kg bor</span>
                      <button 
                        onClick={() => setSelectedProduct(p)} 
                        disabled={p.currentStock <= 0}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-20"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* SAVAT PANELI (PASTDA) */}
            {cart.length > 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-6 rounded-[3rem] shadow-2xl border border-emerald-100 flex justify-between items-center z-40 animate-in slide-in-from-bottom-10">
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Jami Savatda:</p>
                  <p className="text-xl font-black text-emerald-600">{totalAmount.toLocaleString()} UZS</p>
                </div>
                <button 
                  onClick={() => setView("checkout")}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl uppercase text-[10px] font-black tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  To'lovga o'tish <CheckCircle2 size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TO'LOV VA YAKUNLASH (CHECKOUT) */}
        {view === "checkout" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in duration-300">
            <button 
              onClick={() => setView("list")} 
              className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] mb-4"
            >
              <ChevronLeft size={16} /> Mahsulotlarga qaytish
            </button>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
              <h2 className="text-2xl font-black uppercase italic text-center border-b pb-4">To'lov Tafsilotlari</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase text-slate-400 ml-4">Mijoz ismi</label>
                  <input 
                    type="text" placeholder="Ism sharifi" 
                    className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-black text-lg focus:ring-2 ring-emerald-500 transition-all"
                    value={customerName} onChange={e => setCustomerName(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "naqd", name: "Naqd", icon: <Wallet size={18} /> },
                    { id: "karta", name: "Karta", icon: <CreditCard size={18} /> },
                    { id: "nasiya", name: "Nasiya", icon: <UserCheck size={18} /> },
                  ].map(m => (
                    <button 
                      key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-[2rem] border-4 transition-all ${paymentMethod === m.id ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-50 text-slate-300'}`}
                    >
                      {m.icon}
                      <span className="text-[10px] font-black uppercase">{m.name}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "nasiya" && (
                  <input 
                    type="text" placeholder="Telefon raqami" 
                    className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-black text-lg animate-in fade-in"
                    value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} 
                  />
                )}
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                <div className="flex justify-between items-center mb-2 text-[10px] uppercase text-slate-400">
                  <span>Umumiy miqdor:</span>
                  <span>{cart.length} turdagi mahsulot</span>
                </div>
                <div className="text-3xl font-black text-emerald-400">{totalAmount.toLocaleString()} UZS</div>
              </div>

              <button 
                onClick={handleCompleteSale}
                disabled={isSubmitting}
                className="w-full bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100"
              >
                {isSubmitting ? "Sotuv bajarilmoqda..." : "Sotuvni yakunlash va chek chiqarish"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MIQDOR KIRITISH MODALI */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl">
            <h2 className="font-black uppercase italic text-center mb-6 text-slate-800">Kg kiriting</h2>
            <div className="bg-slate-50 p-4 rounded-2xl text-center mb-6">
               <p className="font-black text-emerald-600 italic uppercase text-xs">{selectedProduct.name}</p>
            </div>
            <input 
              autoFocus type="number" step="0.01" 
              className="w-full bg-slate-50 rounded-[2rem] p-6 text-4xl font-black outline-none border-4 border-transparent focus:border-emerald-500 text-center mb-6" 
              value={inputWeight} onChange={e => setInputWeight(e.target.value)} placeholder="0.0" 
            />
            <div className="flex gap-3">
              <button onClick={() => setSelectedProduct(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px]">Bekor</button>
              <button onClick={() => {
                const w = parseFloat(inputWeight);
                if (w > 0 && w <= selectedProduct.currentStock) {
                  setCart([...cart, { ...selectedProduct, qty: w }]);
                  setSelectedProduct(null);
                  setInputWeight("");
                  toast.success("Savatga qo'shildi");
                } else { toast.error("Zaxira yetarli emas yoki noto'g'ri vazn!"); }
              }} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px]">Savatga qo'shish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}