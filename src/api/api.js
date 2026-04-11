import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend manzili
});

export const apiService = {
  // --- Auth ---
  login: (data) => api.post('/auth/login', data),
  
  // --- Mahsulotlar ---
  getProducts: () => Promise.resolve({
    data: [
      { id: 1, name: "Mol go'shti (Lahm)", price: 95000, currentStock: 25.4, category: "Mol" },
      { id: 2, name: "Mol go'shti (Pusti mag'iz)", price: 125000, currentStock: 10.2, category: "Mol" },
      { id: 7, name: "Tovuq (File)", price: 32000, currentStock: 48.0, category: "Tovuq" },
      { id: 16, name: "Qiyma (Dushaki)", price: 75000, currentStock: 25.0, category: "Dushaki" },
      // ... qolgan mahsulotlar
    ]
  }),

  // --- OMBOQ QOLDIG'I (Sizda yetishmayotgan funksiya) ---
  getWarehouseStock: () => Promise.resolve({
    data: [
      { id: 1, name: "Mol go'shti (Lahm)", currentStock: 25.4, unit: "kg", lastUpdated: "2024-03-20" },
      { id: 2, name: "Mol go'shti (Pusti mag'iz)", currentStock: 10.2, unit: "kg", lastUpdated: "2024-03-20" },
      { id: 7, name: "Tovuq (File)", currentStock: 48.0, unit: "kg", lastUpdated: "2024-03-20" },
    ]
  }),

  addStock: (data) => {
    console.log("Omborga yuk qabul qilindi (Demo):", data);
    return Promise.resolve({ data: { success: true } });
  },
  
  // --- Statistika ---
  getStats: () => Promise.resolve({
    data: [
      { title: "Bugungi Sotuv", value: "4,250,000", subValue: "+12.5%", trend: "up", icon: "ShoppingCart", color: "bg-violet-600" },
      { title: "Xaridlar Soni", value: "48 ta", subValue: "+3 ta yangi", trend: "up", icon: "Receipt", color: "bg-blue-600" },
      { title: "Ombor Qoldig'i", value: "850.4 kg", subValue: "-50 kg bugun", trend: "down", icon: "Package", color: "bg-emerald-600" },
      { title: "Sof Foyda", value: "1,120,000", subValue: "+8.2%", trend: "up", icon: "TrendingUp", color: "bg-fuchsia-600" },
    ]
  }),
  
  // --- Sotuv ---
  createSale: (data) => {
    console.log("Sotuv amalga oshirildi (Demo):", data);
    return Promise.resolve({ data: { success: true, message: "Sotuv yakunlandi" } });
  },
};

// --- DIQQAT: Eksportni to'g'irlaymiz ---
export default apiService;