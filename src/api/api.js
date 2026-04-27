import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = "https://sifat006.duckdns.org/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_token");

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ API REQUEST:", {
      url: config.url,
      method: config.method,
      data: config.data,
      token,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Tizim xatosi yuz berdi";

    console.error("❌ API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      message,
      data: error.response?.data,
      sentData: error.config?.data,
    });

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("user_token");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";
    }

    toast.error(Array.isArray(message) ? message[0] : message);
    return Promise.reject(error);
  }
);

export const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.result)) return data.result;
  return [];
};

export const normalizeProduct = (p) => {
  const product = p.product || p.Product || {};

  return {
    id: String(p.id ?? p.productId ?? product.id ?? ""),
    productId: String(p.productId ?? p.product_id ?? product.id ?? p.id ?? ""),
    name: p.name || product.name || "Nomsiz mahsulot",
    tannarx: Number(p.tannarx ?? p.cost ?? product.tannarx ?? 0),
    sotish: Number(p.sotish ?? p.price ?? product.sotish ?? 0),
    cost: Number(p.cost ?? p.tannarx ?? product.tannarx ?? 0),
    price: Number(p.price ?? p.sotish ?? product.sotish ?? 0),
    category: p.category || product.category || "Go'sht",
    quantityKg: Number(
      p.quantityKg ??
        p.currentStock ??
        p.stock ??
        p.quantity ??
        p.qty ??
        product.quantityKg ??
        product.currentStock ??
        0
    ),
    currentStock: Number(
      p.currentStock ??
        p.quantityKg ??
        p.stock ??
        p.quantity ??
        p.qty ??
        product.currentStock ??
        product.quantityKg ??
        0
    ),
  };
};

export const mergeProductsWithWarehouse = (products = [], warehouse = []) => {
  const normalizedProducts = products.map(normalizeProduct);
  const normalizedWarehouse = warehouse.map(normalizeProduct);

  return normalizedProducts.map((product) => {
    const stockItem = normalizedWarehouse.find((w) => {
      return (
        String(w.productId) === String(product.id) ||
        String(w.productId) === String(product.productId) ||
        String(w.id) === String(product.id) ||
        String(w.id) === String(product.productId) ||
        String(w.name || "").toLowerCase() ===
          String(product.name || "").toLowerCase()
      );
    });

    const stock = Number(
      stockItem?.currentStock ??
        stockItem?.quantityKg ??
        stockItem?.stock ??
        stockItem?.quantity ??
        product.currentStock ??
        0
    );

    return {
      ...product,
      productId: String(product.productId || product.id),
      currentStock: stock,
      quantityKg: stock,
    };
  });
};

export const apiService = {
  getProducts: async () => {
    const res = await api.get("/products");
    // Agar res.data bo'lsa shuni, bo'lmasa res'ni olamiz. Har doim massiv bo'lishini ta'minlaymiz.
    return Array.isArray(res) ? res : (res?.data || []);
  },

  // OMBOR QOLDIG'INI OLISH
  getWarehouseStock: async () => {
    const res = await api.get("/warehouse/current");
    return Array.isArray(res) ? res : (res?.data || []);
  },

  // MAHSULOT + OMBOR (Sales va Warehouse uchun)
  getProductsWithStock: async () => {
    try {
      const products = await apiService.getProducts();
      const stock = await apiService.getWarehouseStock();

      // BU YERDA XATO BERAYOTGAN EDI: endi products har doim massiv
      return products.map(p => {
        const s = stock.find(item => String(item.productId) === String(p.id));
        return {
          ...p,
          productId: String(p.id),
          currentStock: s ? Number(s.quantityKg || s.quantity || 0) : 0
        };
      });
    } catch (err) {
      console.error("MERGE ERROR:", err);
      return [];
    }
  },

  // KIRIM QILISH (400 xatosini yo'qotish uchun)
// api.js ichidagi addStock funksiyasini shu bilan almashtiring:
// api.js ichidagi funksiya
addStock: (data) => {
  return api.post("/warehouse/receive", {
    productId: String(data.productId), // ID string bo'lishi shart
    quantityKg: Number(data.weight)    // Vazn musbat son bo'lishi shart
  });
},
  login: async (credentials) => {
    const res = await api.post("/auth/login", {
      email: String(credentials.email || "").trim(),
      password: String(credentials.password || "").trim(),
    });

    const token =
      res?.token ||
      res?.accessToken ||
      res?.access_token ||
      res?.data?.token ||
      res?.data?.accessToken ||
      res?.data?.access_token;

    if (!token) {
      throw new Error("Token kelmadi!");
    }

    localStorage.setItem("user_token", token);
    localStorage.setItem("isLoggedIn", "true");

    return res;
  },

  logout: () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/login";
  },

  getProducts: async () => {
    try {
      const res = await api.get("/products");
      // Agar res.data bo'lsa shuni, bo'lmasa resni qaytaramiz (massiv holatida)
      return Array.isArray(res) ? res : (res?.data || []);
    } catch (err) {
      console.error("API Error:", err);
      return []; // Xato bo'lsa bo'sh massiv qaytaramiz
    }
  },

  // Ombor qoldig'ini olish (bu shart emas, chunki localedan olamiz, lekin tursin)
  getWarehouseStock: () => api.get("/warehouse/current"),

  getAllProducts: async () => {
    return apiService.getProducts();
  },

  addProduct: async (data) => {
    const payload = {
      name: String(data.name || "").trim(),
      tannarx: Number(data.tannarx || 0),
      sotish: Number(data.sotish || 0),
      category: data.category || "Go'sht",
    };

    return api.post("/products", payload);
  },

  updateProduct: async (id, data) => {
    const payload = {
      name: String(data.name || "").trim(),
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
      category: data.category || "Go'sht",
    };

    return api.put(`/products/update/${id}`, payload);
  },

  updateProductPrice: async (id, newPrice, newCost) => {
    return api.put(`/products/update/${id}`, {
      tannarx: Number(newCost),
      sotish: Number(newPrice),
    });
  },

  deleteProduct: async (id) => {
    return api.delete(`/products/delete/${id}`);
  },

  // WAREHOUSE
  getWarehouse: async () => {
    const res = await api.get("/warehouse/current");
    return toArray(res).map(normalizeProduct);
  },

  getWarehouseStock: async () => {
    return apiService.getWarehouse();
  },

  receiveStock: async (data) => {
    const payload = {
      productId: String(data.productId || data.id || ""),
      quantityKg: Number(data.quantityKg || data.weight || data.qty || 0),
    };

    if (!payload.productId) {
      throw new Error("productId topilmadi!");
    }

    if (!payload.quantityKg || payload.quantityKg <= 0) {
      throw new Error("quantityKg noto‘g‘ri!");
    }

    const res = await api.post("/warehouse/receive", payload);

    console.log("✅ KIRIM JAVOBI:", res);

    return res;
  },

  addStock: async (data) => {
    return apiService.receiveStock(data);
  },

  getProductsWithStock: async () => {
    const [products, warehouse] = await Promise.all([
      apiService.getProducts(),
      apiService.getWarehouse(),
    ]);

    return mergeProductsWithWarehouse(products, warehouse);
  },

  // SALES
  createSale: async (data) => {
    const payload = {
      items: (data.items || []).map((item) => ({
        productId: String(item.productId || item.id),
        quantityKg: Number(item.quantityKg || item.qty || 0),
      })),
      paymentMethod: String(data.paymentMethod || "NAQD").toUpperCase(),
    };

    const invalid = payload.items.find(
      (item) => !item.productId || !item.quantityKg || item.quantityKg <= 0
    );

    if (!payload.items.length) {
      throw new Error("Savat bo‘sh!");
    }

    if (invalid) {
      throw new Error("Mahsulot yoki kg noto‘g‘ri!");
    }

    return api.post("/sale", payload);
  },

  completeSale: async (data) => {
    return apiService.createSale(data);
  },

  getSalesHistory: async () => {
    try {
      const res = await api.get("/sale/history");
      return toArray(res);
    } catch {
      return [];
    }
  },

  // DEBTS
  getDebtors: async () => {
    const res = await api.get("/debt");
    return toArray(res);
  },

  getDebts: async () => {
    return apiService.getDebtors();
  },

  addDebtCustomer: async (data) => {
    const payload = {
      name: String(data.name || "").trim(),
      phone: String(data.phone || "").replace(/\s+/g, "").trim(),
    };

    return api.post("/debt/customer", payload);
  },

  payDebt: async (id, amount) => {
    return api.put(`/debt/pay/${id}`, {
      amount: Number(amount),
    });
  },

  getDebtHistory: async (id) => {
    try {
      return api.get(`/debt/history/${id}`);
    } catch {
      return [];
    }
  },
  getProducts: () => api.get("/products"),

  // Ombor qoldig'ini olish
  getWarehouseStock: () => api.get("/warehouse/current"),

  // Yangi yuk qabul qilish (Kirim)
  addStock: (data) => api.post("/warehouse/receive", {
    productId: String(data.productId),
    quantityKg: Number(data.quantityKg)
  }),

  // Narxni yangilash
  updateProductPrice: (id, price, cost) => api.put(`/products/${id}`, {
    price: Number(price),
    cost: Number(cost)
  }),

// src/api/api.js ichidagi getStats qismini toping va almashtiring:

// src/api/api.js faylidagi getStats funksiyasini toping va mana buni qo'ying:

// api.js ichidagi getStats funksiyasini shunga almashtiring:
getStats: async (period = "bugun") => {
  const allowed = ["bugun", "kecha", "hafta", "oy"];
  const safePeriod = allowed.includes(period) ? period : "bugun";

  return api.get(`/report?period=${safePeriod}`);
},
  // RECEIPT
  getReceipt: async (id) => {
    return api.get(`/receipt/${id}`);
  },

  // PROFILE
  getProfile: async () => {
    return api.get("/profile");
  },

  changePassword: async (data) => {
    return api.put("/profile/password", {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.put("/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;