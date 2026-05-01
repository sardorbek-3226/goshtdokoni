import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = "https://sifat006.duckdns.org/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_token");

  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Tizim xatosi yuz berdi";

    console.error("API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      message,
      data: error.response?.data,
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
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.warehouse)) return data.warehouse;
  return [];
};

export const normalizeProduct = (p = {}) => {
  const product = p.product || p.Product || {};

  const id = p.id ?? p.productId ?? p.product_id ?? product.id ?? "";

  const price = Number(
    p.sotish ?? p.price ?? p.sellingPrice ?? product.sotish ?? product.price ?? 0
  );

  const cost = Number(
    p.tannarx ?? p.cost ?? product.tannarx ?? product.cost ?? 0
  );

  const stock = Number(
    p.currentStock ??
      p.quantityKg ??
      p.stock ??
      p.quantity ??
      p.qty ??
      product.currentStock ??
      product.quantityKg ??
      0
  );

  return {
    ...p,
    id: String(id),
    productId: String(p.productId ?? p.product_id ?? id),
    name: p.name || product.name || "Nomsiz mahsulot",
    category: p.category || product.category || "Go'sht",
    price,
    sotish: price,
    cost,
    tannarx: cost,
    currentStock: stock,
    quantityKg: stock,
  };
};

export const mergeProductsWithWarehouse = (productsData, warehouseData) => {
  const products = toArray(productsData).map(normalizeProduct);
  const warehouse = toArray(warehouseData).map(normalizeProduct);

  return products.map((product) => {
    const stockItem = warehouse.find((w) => {
      return (
        String(w.productId) === String(product.id) ||
        String(w.productId) === String(product.productId) ||
        String(w.id) === String(product.id) ||
        String(w.id) === String(product.productId) ||
        String(w.name || "").toLowerCase().trim() ===
          String(product.name || "").toLowerCase().trim()
      );
    });

    const stock = stockItem
      ? Number(stockItem.currentStock || stockItem.quantityKg || 0)
      : Number(product.currentStock || product.quantityKg || 0);

    return {
      ...product,
      currentStock: stock,
      quantityKg: stock,
    };
  });
};

export const apiService = {
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

    if (!token) throw new Error("Token kelmadi!");

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
    const res = await api.get("/products");
    return toArray(res).map(normalizeProduct);
  },

  getAllProducts: async () => {
    return apiService.getProducts();
  },

  addProduct: async (data) => {
    return api.post("/products", {
      name: String(data.name || "").trim(),
      tannarx: Number(data.tannarx || data.cost || 0),
      sotish: Number(data.sotish || data.price || 0),
      category: data.category || "Go'sht",
    });
  },
  updateProduct: async (id, data) => {
    return api.put(`/products/update/${id}`, {
      name: String(data.name || "").trim(),
      tannarx: Number(data.tannarx ?? data.cost ?? 0),
      sotish: Number(data.sotish ?? data.price ?? 0),
      category: data.category || "Go'sht",
    });
  },
  updateProductPrice: async (id, price, cost) => {
    return api.put(`/products/update/${id}`, {
      tannarx: Number(cost),
      sotish: Number(price),
    });
  },

  deleteProduct: async (id) => {
    return api.delete(`/products/delete/${id}`);
  },

  getWarehouse: async () => {
    const res = await api.get("/warehouse/current");
    return toArray(res).map(normalizeProduct);
  },

  getWarehouseStock: async () => {
    const res = await api.get("/warehouse/current");
    return toArray(res).map(normalizeProduct);
  },

  getProductsWithStock: async () => {
    try {
      const productsRes = await apiService.getProducts();
      const warehouseRes = await apiService.getWarehouseStock();
  
      const products = toArray(productsRes).map(normalizeProduct);
      const warehouse = toArray(warehouseRes).map(normalizeProduct);
  
      return products.map((product) => {
        const stockItem = warehouse.find((w) => {
          return (
            String(w.productId) === String(product.id) ||
            String(w.productId) === String(product.productId) ||
            String(w.id) === String(product.id) ||
            String(w.name).toLowerCase() === String(product.name).toLowerCase()
          );
        });
  
        const stock = Number(
          stockItem?.currentStock ||
          stockItem?.quantityKg ||
          stockItem?.quantity ||
          stockItem?.stock ||
          0
        );
  
        return {
          ...product,
          currentStock: stock,
          quantityKg: stock,
        };
      });
    } catch (err) {
      console.error("GET PRODUCTS WITH STOCK ERROR:", err);
      return [];
    }
  },

  receiveStock: async (data) => {
    const productId = String(data.productId || data.id || "");
    const quantityKg = Number(data.quantityKg || data.weight || data.qty || 0);

    if (!productId) throw new Error("productId topilmadi!");
    if (!quantityKg || quantityKg <= 0) throw new Error("quantityKg noto‘g‘ri!");

    return api.post("/warehouse/receive", {
      productId,
      quantityKg,
    });
  },

  addStock: async (data) => {
    return apiService.receiveStock(data);
  },

  createSale: async (data) => {
    const payload = {
      items: (data.items || []).map((item) => ({
        productId: String(item.productId || item.id),
        quantityKg: Number(item.quantityKg || item.qty || 0),
      })),
      paymentMethod: String(data.paymentMethod || "NAQD").toUpperCase(),
    };

    if (!payload.items.length) throw new Error("Savat bo‘sh!");

    const invalid = payload.items.find(
      (item) => !item.productId || !item.quantityKg || item.quantityKg <= 0
    );

    if (invalid) throw new Error("Mahsulot yoki kg noto‘g‘ri!");

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

  getDebtors: async () => {
    try {
      const res = await api.get("/debt");
      return toArray(res);
    } catch {
      return [];
    }
  },

  getDebts: async () => {
    return apiService.getDebtors();
  },

  addDebtCustomer: async (data) => {
    return api.post("/debt/customer", {
      name: String(data.name || "").trim(),
      phone: String(data.phone || "").replace(/\s+/g, "").trim(),
    });
  },

  payDebt: async (id, amount) => {
    return api.put(`/debt/pay/${id}`, {
      amount: Number(amount),
    });
  },

  getDebtHistory: async (id) => {
    try {
      const res = await api.get(`/debt/history/${id}`);
      return toArray(res);
    } catch {
      return [];
    }
  },

  getStats: async (period = "bugun") => {
    const allowed = ["bugun", "kecha", "hafta", "oy"];
    const safePeriod = allowed.includes(period) ? period : "bugun";
    return api.get(`/report?period=${safePeriod}`);
  },

  getReceipt: async (id) => {
    return api.get(`/receipt/${id}`);
  },

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
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;