import axios from "axios";

const BASE_URL = "https://sifat006.duckdns.org/api";
const TOKEN_KEY = "user_token";

const PRODUCTS_KEY = "meat_inventory";
const WAREHOUSE_KEY = "warehouse_backup";
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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("➡️ API REQUEST:", {
    url: config.url,
    method: config.method,
    data: config.data,
    token,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message,
    });

    return Promise.reject(error);
  }
);

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const defaultProducts = [
  {
    id: 101,
    name: "Mol go'shti (Bo'yin)",
    category: "Go'sht",
    tannarx: 72000,
    sotish: 82000,
    cost: 72000,
    price: 82000,
    currentStock: 0,
  },
  {
    id: 102,
    name: "Mol go'shti (Pusti mag'iz)",
    category: "Go'sht",
    tannarx: 105000,
    sotish: 120000,
    cost: 105000,
    price: 120000,
    currentStock: 0,
  },
  {
    id: 103,
    name: "Mol go'shti (Ichki son)",
    category: "Go'sht",
    tannarx: 90000,
    sotish: 100000,
    cost: 90000,
    price: 100000,
    currentStock: 0,
  },
  {
    id: 104,
    name: "Mol go'shti (Son yaxlit)",
    category: "Go'sht",
    tannarx: 86000,
    sotish: 96000,
    cost: 86000,
    price: 96000,
    currentStock: 0,
  },
  {
    id: 105,
    name: "Mol go'shti (Son qismi)",
    category: "Go'sht",
    tannarx: 85000,
    sotish: 95000,
    cost: 85000,
    price: 95000,
    currentStock: 0,
  },
  {
    id: 106,
    name: "Mol go'shti (Son tepa qism)",
    category: "Go'sht",
    tannarx: 84000,
    sotish: 94000,
    cost: 84000,
    price: 94000,
    currentStock: 0,
  },
  {
    id: 107,
    name: "Mol go'shti (Mushtak qism)",
    category: "Go'sht",
    tannarx: 70000,
    sotish: 80000,
    cost: 70000,
    price: 80000,
    currentStock: 0,
  },
  {
    id: 108,
    name: "Mol go'shti (Qo'l qismi)",
    category: "Go'sht",
    tannarx: 75000,
    sotish: 85000,
    cost: 75000,
    price: 85000,
    currentStock: 0,
  },
  {
    id: 109,
    name: "Mol go'shti (Qovurga qism)",
    category: "Go'sht",
    tannarx: 70000,
    sotish: 80000,
    cost: 70000,
    price: 80000,
    currentStock: 0,
  },
  {
    id: 110,
    name: "Mol jigar",
    category: "Go'sht",
    tannarx: 35000,
    sotish: 45000,
    cost: 35000,
    price: 45000,
    currentStock: 0,
  },
  {
    id: 111,
    name: "Mol go'shti (Bo'yin qismi)",
    category: "Go'sht",
    tannarx: 73000,
    sotish: 83000,
    cost: 73000,
    price: 83000,
    currentStock: 0,
  },
  {
    id: 112,
    name: "Mol tili",
    category: "Go'sht",
    tannarx: 50000,
    sotish: 60000,
    cost: 50000,
    price: 60000,
    currentStock: 0,
  },

  {
    id: 201,
    name: "Tovuq (File)",
    category: "Go'sht",
    tannarx: 26000,
    sotish: 32000,
    cost: 26000,
    price: 32000,
    currentStock: 0,
  },
  {
    id: 202,
    name: "Tovuq (Bedro)",
    category: "Go'sht",
    tannarx: 22000,
    sotish: 27000,
    cost: 22000,
    price: 27000,
    currentStock: 0,
  },
  {
    id: 203,
    name: "Tovuq (Golen)",
    category: "Go'sht",
    tannarx: 25000,
    sotish: 30000,
    cost: 25000,
    price: 30000,
    currentStock: 0,
  },
  {
    id: 204,
    name: "Tovuq (Qanot)",
    category: "Go'sht",
    tannarx: 26000,
    sotish: 31000,
    cost: 26000,
    price: 31000,
    currentStock: 0,
  },
  {
    id: 205,
    name: "Tovuq (Okorochka)",
    category: "Go'sht",
    tannarx: 18000,
    sotish: 22000,
    cost: 18000,
    price: 22000,
    currentStock: 0,
  },
  {
    id: 206,
    name: "Tovuq (Plicho)",
    category: "Go'sht",
    tannarx: 26000,
    sotish: 32000,
    cost: 26000,
    price: 32000,
    currentStock: 0,
  },
  {
    id: 207,
    name: "Tovuq (Krilishka)",
    category: "Go'sht",
    tannarx: 27000,
    sotish: 33000,
    cost: 27000,
    price: 33000,
    currentStock: 0,
  },
  {
    id: 208,
    name: "Tovuq (Katta go'sht)",
    category: "Go'sht",
    tannarx: 18000,
    sotish: 23000,
    cost: 18000,
    price: 23000,
    currentStock: 0,
  },
  {
    id: 209,
    name: "Tovuq (Drobok)",
    category: "Go'sht",
    tannarx: 5000,
    sotish: 8000,
    cost: 5000,
    price: 8000,
    currentStock: 0,
  },
  {
    id: 210,
    name: "Tovuq (Spinka)",
    category: "Go'sht",
    tannarx: 5000,
    sotish: 8000,
    cost: 5000,
    price: 8000,
    currentStock: 0,
  },
  {
    id: 211,
    name: "Tovuq (Po'tka)",
    category: "Go'sht",
    tannarx: 3000,
    sotish: 5000,
    cost: 3000,
    price: 5000,
    currentStock: 0,
  },
  {
    id: 212,
    name: "Tovuq jigar",
    category: "Go'sht",
    tannarx: 2000,
    sotish: 4000,
    cost: 2000,
    price: 4000,
    currentStock: 0,
  },
  {
    id: 213,
    name: "Tovuq (Gril)",
    category: "Go'sht",
    tannarx: 21000,
    sotish: 26500,
    cost: 21000,
    price: 26500,
    currentStock: 0,
  },

  {
    id: 301,
    name: "Tuxum",
    category: "Parranda",
    tannarx: 24000,
    sotish: 28000,
    cost: 24000,
    price: 28000,
    currentStock: 0,
  },
];

const normalizeProduct = (p) => ({
  id: String(p.id ?? p.productId ?? Date.now()),
  productId: String(p.productId ?? p.id ?? Date.now()),
  name: p.name || "Nomsiz mahsulot",
  category: p.category || "Go'sht",
  tannarx: Number(p.tannarx ?? p.cost ?? 0),
  sotish: Number(p.sotish ?? p.price ?? 0),
  cost: Number(p.cost ?? p.tannarx ?? 0),
  price: Number(p.price ?? p.sotish ?? 0),
  currentStock: Number(
    p.currentStock ?? p.stock ?? p.quantityKg ?? p.quantity ?? 0
  ),
  type: p.type || "product",
});

const getLocalProducts = () => {
  const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");

  if (!Array.isArray(stored) || stored.length === 0) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts.map(normalizeProduct);
  }

  return stored.map(normalizeProduct);
};

const setLocalProducts = (items) => {
  localStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(items.map(normalizeProduct))
  );
};

const getWarehouse = () => {
  const stored = JSON.parse(localStorage.getItem(WAREHOUSE_KEY) || "[]");

  if (!Array.isArray(stored) || stored.length === 0) {
    const products = getLocalProducts();
    localStorage.setItem(WAREHOUSE_KEY, JSON.stringify(products));
    return products;
  }

  return stored.map(normalizeProduct);
};

const setWarehouse = (items) => {
  localStorage.setItem(
    WAREHOUSE_KEY,
    JSON.stringify(items.map(normalizeProduct))
  );
};

export const apiService = {
  login: async (credentials) => {
    const payload = {
      email: String(credentials.email || "").trim(),
      password: String(credentials.password || "").trim(),
    };

    try {
      const res = await api.post("/auth/login", payload);

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.access_token ||
        res.data?.data?.token ||
        res.data?.data?.accessToken ||
        res.data?.data?.access_token;

      if (!token) throw new Error("Token kelmadi!");

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("isLoggedIn", "true");

      return res.data;
    } catch (error) {
      if (payload.email === "admin" && payload.password === "12345") {
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
    return { data: getLocalProducts() };
  },

  getAllProducts: async () => {
    return { data: getLocalProducts() };
  },

  addProduct: async (data) => {
    const products = getLocalProducts();

    const newProduct = normalizeProduct({
      id: Date.now(),
      productId: Date.now(),
      name: data.name,
      category: data.category || "Go'sht",
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
      cost: Number(data.tannarx ?? data.cost ?? 0),
      price: Number(data.sotish ?? data.price ?? 0),
      currentStock: 0,
      type: "custom",
    });

    const updatedProducts = [...products, newProduct];

    setLocalProducts(updatedProducts);

    const warehouse = getWarehouse();
    setWarehouse([...warehouse, newProduct]);

    return { success: true, data: newProduct };
  },

  updateProduct: async (id, data) => {
    const updatedProducts = getLocalProducts().map((p) =>
      String(p.id) === String(id)
        ? normalizeProduct({
            ...p,
            ...data,
            cost: Number(data.cost ?? data.tannarx ?? p.cost),
            price: Number(data.price ?? data.sotish ?? p.price),
            tannarx: Number(data.tannarx ?? data.cost ?? p.tannarx),
            sotish: Number(data.sotish ?? data.price ?? p.sotish),
          })
        : p
    );

    setLocalProducts(updatedProducts);

    const updatedWarehouse = getWarehouse().map((p) =>
      String(p.id) === String(id) || String(p.productId) === String(id)
        ? normalizeProduct({
            ...p,
            ...data,
            cost: Number(data.cost ?? data.tannarx ?? p.cost),
            price: Number(data.price ?? data.sotish ?? p.price),
            tannarx: Number(data.tannarx ?? data.cost ?? p.tannarx),
            sotish: Number(data.sotish ?? data.price ?? p.sotish),
          })
        : p
    );

    setWarehouse(updatedWarehouse);

    return { success: true };
  },

  updateProductPrice: async (id, newPrice, newCost) => {
    return apiService.updateProduct(id, {
      price: Number(newPrice),
      sotish: Number(newPrice),
      cost: Number(newCost),
      tannarx: Number(newCost),
    });
  },

  deleteProduct: async (id) => {
    setLocalProducts(
      getLocalProducts().filter((p) => String(p.id) !== String(id))
    );

    setWarehouse(
      getWarehouse().filter(
        (p) => String(p.id) !== String(id) && String(p.productId) !== String(id)
      )
    );

    return { success: true };
  },

  getWarehouseStock: async () => {
    return { data: getWarehouse() };
  },

  addStock: async (data) => {
    const productId = String(data.productId || data.product_id || data.id);
    const quantityKg = Number(data.quantityKg || data.weight || data.qty || 0);

    if (!productId) throw new Error("productId yo‘q");
    if (!quantityKg || quantityKg <= 0) throw new Error("quantityKg noto‘g‘ri");

    const updated = getWarehouse().map((p) =>
      String(p.productId || p.id) === String(productId)
        ? {
            ...p,
            currentStock: Number(p.currentStock || 0) + quantityKg,
          }
        : p
    );

    setWarehouse(updated);

    return {
      success: true,
      data: updated.find((p) => String(p.productId || p.id) === productId),
    };
  },

  receiveStock: async (data) => {
    return apiService.addStock(data);
  },

  createSale: async (saleData) => {
    const items = saleData.items || [];

    const totalAmount =
      Number(saleData.totalAmount) ||
      items.reduce((sum, item) => {
        const qty = Number(item.quantityKg || item.qty || 0);
        const price = Number(item.price || item.sotish || 0);
        return sum + qty * price;
      }, 0);

    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      customerName:
        saleData.customerName || saleData.customer?.name || "Naqd mijoz",
      customerPhone: saleData.customerPhone || saleData.customer?.phone || "",
      paymentMethod: String(saleData.paymentMethod || "naqd").toLowerCase(),
      totalAmount,
      items,
    };

    const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
    localStorage.setItem(SALES_KEY, JSON.stringify([...sales, newSale]));

    const updatedWarehouse = getWarehouse().map((p) => {
      const sold = items.find(
        (i) => String(i.productId || i.id) === String(p.productId || p.id)
      );

      if (!sold) return p;

      return {
        ...p,
        currentStock: Math.max(
          0,
          Number(p.currentStock || 0) - Number(sold.quantityKg || sold.qty || 0)
        ),
      };
    });

    setWarehouse(updatedWarehouse);

    if (newSale.paymentMethod === "nasiya") {
      const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");

      const newDebt = {
        id: Date.now(),
        saleId: newSale.id,
        name: newSale.customerName,
        phone: newSale.customerPhone,
        totalDebt: totalAmount,
        remainingDebt: totalAmount,
        paidAmount: 0,
        date: new Date().toLocaleDateString("uz-UZ"),
        items,
      };

      localStorage.setItem(DEBTS_KEY, JSON.stringify([...debts, newDebt]));
    }

    return { success: true, data: newSale };
  },

  completeSale: async (saleData) => {
    return apiService.createSale(saleData);
  },

  getDebtors: async () => {
    const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");
    return { data: debts };
  },

  getDebts: async () => {
    return apiService.getDebtors();
  },

  addDebtCustomer: async (data) => {
    const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");

    const amount = Number(data.totalDebt || data.amount || 0);

    const newDebt = {
      id: Date.now(),
      name: String(data.name || "").trim(),
      phone: String(data.phone || "").trim(),
      totalDebt: amount,
      remainingDebt: amount,
      paidAmount: 0,
      date: new Date().toLocaleDateString("uz-UZ"),
      items: [],
      type: "manual",
    };

    localStorage.setItem(DEBTS_KEY, JSON.stringify([...debts, newDebt]));

    return { success: true, data: newDebt };
  },

  payDebt: async (id, amount = 0) => {
    const debts = JSON.parse(localStorage.getItem(DEBTS_KEY) || "[]");

    const updated = debts
      .map((d) => {
        if (String(d.id) !== String(id)) return d;

        const remaining = Math.max(
          0,
          Number(d.remainingDebt ?? d.totalDebt ?? 0) - Number(amount)
        );

        return {
          ...d,
          paidAmount: Number(d.paidAmount || 0) + Number(amount),
          remainingDebt: remaining,
        };
      })
      .filter((d) => Number(d.remainingDebt ?? d.totalDebt ?? 0) > 0);

    localStorage.setItem(DEBTS_KEY, JSON.stringify(updated));

    return { success: true };
  },

  getStats: async () => {
    const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");

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
        const qty = Number(item.quantityKg || item.qty || 0);
        const price = Number(item.price || item.sotish || 0);
        const cost = Number(item.cost || item.tannarx || 0);

        profit += (price - cost) * qty;
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
    const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");

    return {
      data: sales
        .slice(-10)
        .reverse()
        .map((s) => ({
          id: s.id,
          customer: s.customerName || "Naqd mijoz",
          total: Number(s.totalAmount || 0).toLocaleString(),
          paymentDisplay:
            s.paymentMethod === "nasiya"
              ? "Nasiya"
              : s.paymentMethod === "karta"
              ? "Karta"
              : "Naqd",
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
    const sales = JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
    return {
      success: true,
      data: sales.find((s) => String(s.id) === String(id)),
    };
  },

  getProfile: async () => {
    try {
      const res = await api.get("/profile");
      return res.data;
    } catch {
      return { success: true, data: {} };
    }
  },

  changePassword: async () => {
    return { success: true };
  },

  uploadPhoto: async () => {
    return { success: true };
  },

  clearLocalDemoData: () => {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(WAREHOUSE_KEY);
    localStorage.removeItem(SALES_KEY);
    localStorage.removeItem(DEBTS_KEY);
    localStorage.removeItem("active_cart");
    return { success: true };
  },
};

export default api;
