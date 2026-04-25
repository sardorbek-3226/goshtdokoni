import axios from "axios";

const BASE_URL = "https://sifat006.duckdns.org/api";
const TOKEN_KEY = "user_token";

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

  console.log("➡️ REQUEST:", {
    url: config.url,
    method: config.method,
    data: config.data,
    token,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      sentData: error.config?.data,
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

export const apiService = {
  seedDefaultProductsToBackend: async () => {
    const results = [];
  
    for (const product of defaultProducts) {
      const payload = {
        name: product.name,
        category: product.category,
        tannarx: Number(product.tannarx),
        sotish: Number(product.sotish),
      };
  
      try {
        const res = await api.post("/products", payload);
        results.push(res.data);
        console.log("✅ Qo‘shildi:", product.name);
      } catch (error) {
        console.error("❌ Qo‘shilmadi:", product.name, error.response?.data);
      }
    }
  
    return { success: true, data: results };
  },
  // AUTH
  login: async (credentials) => {
    const payload = {
      email: String(credentials.email || "").trim(),
      password: String(credentials.password || "").trim(),
    };

    const res = await api.post("/auth/login", payload);

    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.access_token ||
      res.data?.data?.token ||
      res.data?.data?.accessToken ||
      res.data?.data?.access_token;

    if (!token) {
      throw new Error("Token kelmadi!");
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("isLoggedIn", "true");

    return res.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // PRODUCT
  getProducts: async () => {
    const res = await api.get("/products");
    return { data: toArray(res.data) };
  },

  getAllProducts: async () => {
    return apiService.getProducts();
  },

  addProduct: async (data) => {
    const payload = {
      name: data.name,
      category: data.category || "Go‘sht",
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
    };

    const res = await api.post("/products", payload);
    return res.data;
  },

  updateProduct: async (id, data) => {
    const payload = {
      name: data.name,
      category: data.category || "Go‘sht",
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
    };

    const res = await api.put(`/products/update/${id}`, payload);
    return res.data;
  },

  updateProductPrice: async (id, newPrice, newCost) => {
    const payload = {
      tannarx: Number(newCost),
      sotish: Number(newPrice),
    };

    const res = await api.put(`/products/update/${id}`, payload);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/delete/${id}`);
    return res.data;
  },

  addStock: async (data) => {
    const payload = {
      productId: data.productId || data.product_id || data.id,
      quantityKg: Number(data.quantityKg || data.weight || data.qty || 0),
    };
  
    console.log("📦 WAREHOUSE PAYLOAD KETYAPTI:", payload);
  
    if (!payload.productId) {
      throw new Error("productId yo‘q");
    }
  
    if (!payload.quantityKg || payload.quantityKg <= 0) {
      throw new Error("quantityKg noto‘g‘ri");
    }
  
    try {
      const res = await api.post("/warehouse/receive", payload);
  
      console.log("✅ WAREHOUSE RECEIVE RESPONSE:", res.data);
  
      return res.data;
    } catch (error) {
      console.error("❌ WAREHOUSE RECEIVE ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        sentPayload: payload,
      });
  
      throw error;
    }
  },
  receiveStock: async (data) => {
    return apiService.addStock(data);
  },

  getWarehouseStock: async () => {
    const res = await api.get("/warehouse/current");
    return { data: toArray(res.data) };
  },

  // SALE
  createSale: async (saleData) => {
    const payload = {
      items: (saleData.items || []).map((item) => ({
        productId: String(item.productId || item.id),
        quantityKg: Number(item.quantityKg || item.qty || 0),
      })),
      paymentMethod: String(saleData.paymentMethod || "KARTA").toUpperCase(),
    };

    console.log("🧾 SALE PAYLOAD:", payload);

    const res = await api.post("/sale", payload);
    return res.data;
  },

  completeSale: async (saleData) => {
    return apiService.createSale(saleData);
  },

  // DEBT
  getDebtors: async () => {
    const res = await api.get("/debt");
    return { data: toArray(res.data) };
  },

  getDebts: async () => {
    return apiService.getDebtors();
  },

  addDebtCustomer: async (data) => {
    const payload = {
      name: data.name,
      phone: data.phone,
    };

    const res = await api.post("/debt/customer", payload);
    return res.data;
  },

  payDebt: async (id, amount) => {
    const res = await api.put(`/debt/pay/${id}`, {
      amount: Number(amount),
    });

    return res.data;
  },
  getDebtors: async () => {
    const res = await api.get("/debt");
    return {
      data: Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [],
    };
  },
  addDebtCustomer: async (data) => {
    const payload = {
      name: String(data.name || "").trim(),
      phone: String(data.phone || "").trim(),
    };
  
    const res = await api.post("/debt/customer", payload);
    return res.data;
  },
  
  payDebt: async (id, amount) => {
    const res = await api.put(`/debt/pay/${id}`, {
      amount: Number(amount),
    });
  
    return res.data;
  },
  // REPORT
  getStats: async (period = "bugun") => {
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
  
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
    const sales = JSON.parse(localStorage.getItem("sales_history") || "[]");
  
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

  // RECEIPT
  getReceipt: async (id) => {
    const res = await api.get(`/receipt/${id}`);
    return res.data;
  },

  // PROFILE
  getProfile: async () => {
    const res = await api.get("/profile");
    return res.data;
  },

  changePassword: async (data) => {
    const payload = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };

    const res = await api.put("/profile/password", payload);
    return res.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put("/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },
};

export default api;