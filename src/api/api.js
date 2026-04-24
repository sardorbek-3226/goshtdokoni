import axios from "axios";

const BASE_URL = "https://sifat006.duckdns.org/api";

const TOKEN_KEY = "user_token";
const PRODUCTS_KEY = "meat_inventory";
const SALES_KEY = "sales_history";
const DEBTS_KEY = "debts";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  console.log("➡️ API REQUEST:", {
    url: config.url,
    method: config.method,
    data: config.data,
    token,
  });

  if (token && token !== "mock-token") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE:", response.data);
    return response;
  },
  (error) => {
    console.warn("⚠️ API ERROR / LOCAL ISHLAYDI:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

const defaultProducts = [
  { id: 101, name: "Mol go'shti (Bo'yin)", category: "Go'sht", tannarx: 72000, sotish: 82000, cost: 72000, price: 82000, currentStock: 0, type: "beef" },
  { id: 102, name: "Mol go'shti (Pusti mag'iz)", category: "Go'sht", tannarx: 105000, sotish: 120000, cost: 105000, price: 120000, currentStock: 0, type: "beef" },
  { id: 103, name: "Mol go'shti (Ichki son)", category: "Go'sht", tannarx: 90000, sotish: 100000, cost: 90000, price: 100000, currentStock: 0, type: "beef" },
  { id: 104, name: "Mol go'shti (Son yaxlit)", category: "Go'sht", tannarx: 86000, sotish: 96000, cost: 86000, price: 96000, currentStock: 0, type: "beef" },
  { id: 105, name: "Mol go'shti (Son qismi)", category: "Go'sht", tannarx: 85000, sotish: 95000, cost: 85000, price: 95000, currentStock: 0, type: "beef" },
  { id: 106, name: "Mol go'shti (Son tepa qism)", category: "Go'sht", tannarx: 84000, sotish: 94000, cost: 84000, price: 94000, currentStock: 0, type: "beef" },
  { id: 107, name: "Mol go'shti (Mushtak qism)", category: "Go'sht", tannarx: 70000, sotish: 80000, cost: 70000, price: 80000, currentStock: 0, type: "beef" },
  { id: 108, name: "Mol go'shti (Qo'l qismi)", category: "Go'sht", tannarx: 75000, sotish: 85000, cost: 75000, price: 85000, currentStock: 0, type: "beef" },
  { id: 109, name: "Mol go'shti (Qovurga qism)", category: "Go'sht", tannarx: 70000, sotish: 80000, cost: 70000, price: 80000, currentStock: 0, type: "beef" },
  { id: 110, name: "Mol jigar", category: "Go'sht", tannarx: 35000, sotish: 45000, cost: 35000, price: 45000, currentStock: 0, type: "beef" },
  { id: 111, name: "Mol go'shti (Bo'yin qismi)", category: "Go'sht", tannarx: 73000, sotish: 83000, cost: 73000, price: 83000, currentStock: 0, type: "beef" },
  { id: 112, name: "Mol tili", category: "Go'sht", tannarx: 50000, sotish: 60000, cost: 50000, price: 60000, currentStock: 0, type: "beef" },

  { id: 201, name: "Tovuq (File)", category: "Go'sht", tannarx: 26000, sotish: 32000, cost: 26000, price: 32000, currentStock: 0, type: "chicken" },
  { id: 202, name: "Tovuq (Bedro)", category: "Go'sht", tannarx: 22000, sotish: 27000, cost: 22000, price: 27000, currentStock: 0, type: "chicken" },
  { id: 203, name: "Tovuq (Golen)", category: "Go'sht", tannarx: 25000, sotish: 30000, cost: 25000, price: 30000, currentStock: 0, type: "chicken" },
  { id: 204, name: "Tovuq (Qanot)", category: "Go'sht", tannarx: 26000, sotish: 31000, cost: 26000, price: 31000, currentStock: 0, type: "chicken" },
  { id: 205, name: "Tovuq (Okorochka)", category: "Go'sht", tannarx: 18000, sotish: 22000, cost: 18000, price: 22000, currentStock: 0, type: "chicken" },
  { id: 206, name: "Tovuq (Plicho)", category: "Go'sht", tannarx: 26000, sotish: 32000, cost: 26000, price: 32000, currentStock: 0, type: "chicken" },
  { id: 207, name: "Tovuq (Krilishka)", category: "Go'sht", tannarx: 27000, sotish: 33000, cost: 27000, price: 33000, currentStock: 0, type: "chicken" },
  { id: 208, name: "Tovuq (Katta go'sht)", category: "Go'sht", tannarx: 18000, sotish: 23000, cost: 18000, price: 23000, currentStock: 0, type: "chicken" },
  { id: 209, name: "Tovuq (Drobok)", category: "Go'sht", tannarx: 5000, sotish: 8000, cost: 5000, price: 8000, currentStock: 0, type: "chicken" },
  { id: 210, name: "Tovuq (Spinka)", category: "Go'sht", tannarx: 5000, sotish: 8000, cost: 5000, price: 8000, currentStock: 0, type: "chicken" },
  { id: 211, name: "Tovuq (Po'tka)", category: "Go'sht", tannarx: 3000, sotish: 5000, cost: 3000, price: 5000, currentStock: 0, type: "chicken" },
  { id: 212, name: "Tovuq jigar", category: "Go'sht", tannarx: 2000, sotish: 4000, cost: 2000, price: 4000, currentStock: 0, type: "chicken" },
  { id: 213, name: "Tovuq (Gril)", category: "Go'sht", tannarx: 21000, sotish: 26500, cost: 21000, price: 26500, currentStock: 0, type: "chicken" },

  { id: 301, name: "Tuxum", category: "Parranda", tannarx: 24000, sotish: 28000, cost: 24000, price: 28000, currentStock: 0, type: "egg" },
];

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const normalizeProduct = (p) => ({
  id: Number(p.id),
  name: p.name || "Nomsiz mahsulot",
  category: p.category || "Go'sht",
  tannarx: Number(p.tannarx ?? p.cost ?? 0),
  sotish: Number(p.sotish ?? p.price ?? 0),
  cost: Number(p.cost ?? p.tannarx ?? 0),
  price: Number(p.price ?? p.sotish ?? 0),
  currentStock: Number(p.currentStock ?? p.quantityKg ?? p.quantity ?? 0),
  type: p.type || "product",
});

const getLocalProducts = () => {
  const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");

  if (!Array.isArray(stored) || stored.length < defaultProducts.length) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts.map(normalizeProduct);
  }

  return stored.map(normalizeProduct);
};

const setLocalProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products.map(normalizeProduct)));
};

export const apiService = {
  login: async (credentials) => {
    const email = String(credentials.email || "").trim();
    const password = String(credentials.password || "").trim();

    try {
      const res = await api.post("/auth/login", { email, password });

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.access_token ||
        res.data?.data?.token ||
        res.data?.data?.accessToken ||
        res.data?.data?.access_token;

      if (!token) throw new Error("Token kelmadi");

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("isLoggedIn", "true");

      return res.data;
    } catch (error) {
      if (email === "admin" && password === "12345") {
        localStorage.setItem(TOKEN_KEY, "mock-token");
        localStorage.setItem("isLoggedIn", "true");
        return { success: true, token: "mock-token" };
      }

      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getProducts: async () => {
    const localProducts = getLocalProducts();

    try {
      const res = await api.get("/products");
      const apiProducts = safeArray(res.data).map(normalizeProduct);

      if (apiProducts.length >= defaultProducts.length) {
        return { data: apiProducts };
      }

      return { data: localProducts };
    } catch {
      return { data: localProducts };
    }
  },

  getAllProducts: async () => {
    return apiService.getProducts();
  },

  addProduct: async (data) => {
    const payload = {
      name: data.name,
      category: data.category || "Go'sht",
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
    };

    try {
      const res = await api.post("/products", payload);
      return res.data;
    } catch {
      const products = getLocalProducts();

      const newProduct = normalizeProduct({
        id: Date.now(),
        ...payload,
        cost: payload.tannarx,
        price: payload.sotish,
        currentStock: 0,
        type: data.type || "custom",
      });

      setLocalProducts([...products, newProduct]);

      return { success: true, data: newProduct };
    }
  },

  updateProduct: async (id, data) => {
    const payload = {
      name: data.name,
      category: data.category || "Go'sht",
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
    };

    try {
      const res = await api.put(`/products/update/${id}`, payload);
      return res.data;
    } catch {
      const updated = getLocalProducts().map((p) =>
        Number(p.id) === Number(id)
          ? normalizeProduct({
              ...p,
              ...payload,
              cost: payload.tannarx,
              price: payload.sotish,
            })
          : p
      );

      setLocalProducts(updated);

      return { success: true };
    }
  },

  updateProductPrice: async (id, newPrice, newCost) => {
    return apiService.updateProduct(id, {
      tannarx: newCost,
      sotish: newPrice,
    });
  },

  deleteProduct: async (id) => {
    try {
      const res = await api.delete(`/products/delete/${id}`);
      return res.data;
    } catch {
      const updated = getLocalProducts().filter(
        (p) => Number(p.id) !== Number(id)
      );

      setLocalProducts(updated);

      return { success: true };
    }
  },

  getWarehouseStock: async () => {
    const localProducts = getLocalProducts();

    try {
      const res = await api.get("/warehouse/current");
      const apiProducts = safeArray(res.data).map(normalizeProduct);

      if (apiProducts.length >= defaultProducts.length) {
        return { data: apiProducts };
      }

      return { data: localProducts };
    } catch {
      return { data: localProducts };
    }
  },

  addStock: async (data) => {
    const productId = Number(data.productId || data.product_id || data.id);
    const quantityKg = Number(data.quantityKg ?? data.weight ?? data.qty ?? 0);

    try {
      const res = await api.post("/warehouse/receive", {
        productId,
        quantityKg,
      });

      const updated = getLocalProducts().map((p) =>
        Number(p.id) === productId
          ? { ...p, currentStock: Number(p.currentStock || 0) + quantityKg }
          : p
      );

      setLocalProducts(updated);

      return res.data;
    } catch {
      const updated = getLocalProducts().map((p) =>
        Number(p.id) === productId
          ? { ...p, currentStock: Number(p.currentStock || 0) + quantityKg }
          : p
      );

      setLocalProducts(updated);

      return { success: true };
    }
  },

  receiveStock: async (data) => {
    return apiService.addStock(data);
  },

 createSale: async (saleData) => {
  const items = safeArray(saleData.items);

  const totalAmount =
    Number(saleData.totalAmount) ||
    items.reduce((sum, item) => {
      const price = Number(item.price ?? item.sotish ?? 0);
      const qty = Number(item.qty ?? item.quantityKg ?? 0);
      return sum + price * qty;
    }, 0);

  const newSale = {
    ...saleData,
    id: Date.now(),
    items,
    totalAmount,
    date: new Date().toISOString(),
  };

  const saveLocal = () => {
    const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
    localStorage.setItem(SALES_KEY, JSON.stringify([...sales, newSale]));

    const products = getLocalProducts();

    const items = safeArray(saleData.items).map((item) => {
      const product = products.find(
        (p) =>
          Number(p.id) === Number(item.productId || item.id) ||
          String(p.name).toLowerCase() === String(item.name).toLowerCase()
      );
    
      return {
        ...item,
        id: Number(item.id || item.productId || product?.id),
        productId: Number(item.productId || item.id || product?.id),
        name: item.name || product?.name,
        qty: Number(item.qty ?? item.quantityKg ?? 0),
        quantityKg: Number(item.quantityKg ?? item.qty ?? 0),
        price: Number(item.price ?? item.sotish ?? product?.price ?? product?.sotish ?? 0),
        sotish: Number(item.sotish ?? item.price ?? product?.sotish ?? product?.price ?? 0),
        cost: Number(item.cost ?? item.tannarx ?? product?.cost ?? product?.tannarx ?? 0),
        tannarx: Number(item.tannarx ?? item.cost ?? product?.tannarx ?? product?.cost ?? 0),
      };
    });

    const updatedProducts = products.map((p) => {
      const soldItem = items.find(
        (item) => Number(item.productId || item.id) === Number(p.id)
      );

      if (!soldItem) return p;

      return {
        ...p,
        currentStock: Math.max(
          0,
          Number(p.currentStock || 0) -
            Number(soldItem.qty ?? soldItem.quantityKg ?? 0)
        ),
      };
    });

    setLocalProducts(updatedProducts);

    if (String(saleData.paymentMethod || "").toLowerCase() === "nasiya") {
      const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");

      const newDebt = {
        id: Date.now(),
        saleId: newSale.id,
        name: saleData.customer?.name || saleData.customerName || "Mijoz",
        phone: saleData.customer?.phone || saleData.customerPhone || "",
        totalDebt: totalAmount,
        paidAmount: 0,
        remainingDebt: totalAmount,
        date: new Date().toLocaleDateString("uz-UZ"),
        items,
      };

      localStorage.setItem(DEBTS_KEY, JSON.stringify([...debts, newDebt]));
    }
  };

  const payload = {
    items: items.map((item) => ({
      productId: Number(item.productId || item.id),
      quantityKg: Number(item.quantityKg ?? item.qty ?? 0),
    })),
    paymentMethod: String(saleData.paymentMethod || "NAQD").toUpperCase(),
  };

  try {
    const res = await api.post("/sale", payload);
    saveLocal();

    return {
      success: true,
      data: newSale,
      apiData: res.data,
    };
  } catch {
    saveLocal();

    return {
      success: true,
      data: newSale,
    };
  }
},

  completeSale: async (saleData) => {
    return apiService.createSale(saleData);
  },

  getDebtors: async () => {
    const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");
  
    return {
      data: Array.isArray(debts) ? debts : [],
    };
  },

  getDebts: async () => {
    return apiService.getDebtors();
  },

  addDebtCustomer: async (data) => {
    try {
      const res = await api.post("/debt/customer", {
        name: data.name,
        phone: data.phone,
      });

      return res.data;
    } catch {
      const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");

      const newDebt = {
        id: Date.now(),
        name: data.name,
        phone: data.phone || "",
        totalDebt: Number(data.totalDebt || 0),
        date: new Date().toLocaleDateString("uz-UZ"),
      };

      localStorage.setItem(DEBTS_KEY, JSON.stringify([...debts, newDebt]));

      return { success: true, data: newDebt };
    }
  },

  payDebt: async (id, amount = 0) => {
    try {
      const res = await api.put(`/debt/pay/${id}`, {
        amount: Number(amount),
      });

      return res.data;
    } catch {
      const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]").filter(
        (d) => Number(d.id) !== Number(id)
      );

      localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));

      return { success: true };
    }
  },
  getStats: async (period = "bugun") => {
    const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
    const products = getLocalProducts();
  
    let total = 0;
    let profit = 0;
    let cash = 0;
    let card = 0;
    let debt = 0;
  
    sales.forEach((sale) => {
      const saleTotal = Number(sale.totalAmount || 0);
      total += saleTotal;
  
      const method = String(sale.paymentMethod || "").toLowerCase();
  
      if (method === "naqd") cash += saleTotal;
      if (method === "karta") card += saleTotal;
      if (method === "nasiya") debt += saleTotal;
  
      (sale.items || []).forEach((item) => {
        const sellPrice = Number(item.price || item.sotish || 0);
        const costPrice = Number(item.cost || item.tannarx || 0);
        const qty = Number(item.qty || item.quantityKg || 0);
      
        profit += (sellPrice - costPrice) * qty;
      });
    });
  
    return {
      data: [
        { title: "Umumiy Savdo", value: total.toLocaleString(), type: "total" },
        { title: "Sof Foyda", value: profit.toLocaleString(), type: "profit" },
        { title: "Karta orqali", value: card.toLocaleString(), type: "card" },
        { title: "Naqd tushum", value: cash.toLocaleString(), type: "cash" },
        { title: "Nasiyalar", value: debt.toLocaleString(), type: "debt" },
      ],
    };
  },
  
  getRecentSales: async () => {
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
  
    return {
      data: sales
        .slice(-10)
        .reverse()
        .map((s) => ({
          id: s.id,
          customer: s.customer?.name || s.customerName || "Naqd Mijoz",
          product: (s.items || []).map((i) => i.name).join(", "),
          total: Number(s.totalAmount || 0).toLocaleString(),
          paymentDisplay:
            String(s.paymentMethod || "").toLowerCase() === "nasiya"
              ? "Nasiya:"
              : String(s.paymentMethod || "").toLowerCase() === "karta"
              ? "Karta:"
              : "Naqd:",
          time: s.date
            ? new Date(s.date).toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--",
        })),
    };
  },
  getStats: async (period = "bugun") => {
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
  
    const total = sales.reduce((sum, sale) => {
      return sum + Number(sale.totalAmount || 0);
    }, 0);
  
    const cash = sales
      .filter((s) => String(s.paymentMethod || "").toLowerCase() === "naqd")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
    const card = sales
      .filter((s) => String(s.paymentMethod || "").toLowerCase() === "karta")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
    const debt = sales
      .filter((s) => String(s.paymentMethod || "").toLowerCase() === "nasiya")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
    return {
      data: [
        { title: "Umumiy Savdo", value: total.toLocaleString(), type: "total" },
        { title: "Sof Foyda", value: "0", type: "profit" },
        { title: "Karta orqali", value: card.toLocaleString(), type: "card" },
        { title: "Naqd tushum", value: cash.toLocaleString(), type: "cash" },
        { title: "Nasiyalar", value: debt.toLocaleString(), type: "debt" },
      ],
    };
  },
  
  getRecentSales: async () => {
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
  
    return {
      data: sales
        .slice(-10)
        .reverse()
        .map((s) => ({
          id: s.id,
          customer: s.customer?.name || s.customerName || "Naqd Mijoz",
          product: (s.items || []).map((i) => i.name).join(", "),
          total: Number(s.totalAmount || 0).toLocaleString(),
          paymentDisplay:
            String(s.paymentMethod || "").toLowerCase() === "nasiya"
              ? "Nasiya:"
              : String(s.paymentMethod || "").toLowerCase() === "karta"
              ? "Karta:"
              : "Naqd:",
          time: s.date
            ? new Date(s.date).toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--",
        })),
    };
  },

  getReceipt: async (id) => {
    try {
      const res = await api.get(`/receipt/${id}`);
      return res.data;
    } catch {
      const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");

      return {
        success: true,
        data: sales.find((s) => Number(s.id) === Number(id)) || null,
      };
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get("/profile");
      return res.data;
    } catch {
      return {
        success: true,
        data: JSON.parse(localStorage.getItem("user") || "{}"),
      };
    }
  },
  addStock: async (data) => {
    const productId = Number(data.productId || data.product_id || data.id);
    const quantityKg = Number(data.quantityKg || data.quantity || data.weight || data.qty || 0);
  
    console.log("📦 KIRIM PAYLOAD:", {
      productId,
      quantityKg,
      originalData: data,
    });
  
    if (!productId) {
      throw new Error("productId topilmadi");
    }
  
    if (!quantityKg || quantityKg <= 0) {
      throw new Error("quantityKg noto‘g‘ri");
    }
  
    try {
      const res = await api.post("/warehouse/receive", {
        productId,
        quantityKg,
      });
  
      console.log("✅ KIRIM API RESPONSE:", res.data);
    } catch (error) {
      console.warn("⚠️ Kirim API ishlamadi, local ishladi");
    }
  
    const products = getLocalProducts();
  
    const updated = products.map((p) =>
      Number(p.id) === productId
        ? {
            ...p,
            currentStock: Number(p.currentStock || 0) + quantityKg,
          }
        : p
    );
  
    setLocalProducts(updated);
  
    return {
      success: true,
      data: updated.find((p) => Number(p.id) === productId),
    };
  },
  
  receiveStock: async (data) => {
    return apiService.addStock(data);
  },

  changePassword: async (data) => {
    try {
      const res = await api.put("/profile/password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      return res.data;
    } catch {
      return { success: true };
    }
  },

  uploadPhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.put("/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch {
      return { success: true };
    }
  },

  resetLocalData: () => {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(SALES_KEY);
    localStorage.removeItem(DEBTS_KEY);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));

    return { success: true };
  },
};

export default api;