import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = "https://sifat-pmy2.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================
// REQUEST
// =========================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_token");

  if (
    token &&
    token !== "undefined" &&
    token !== "null"
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// =========================
// RESPONSE
// =========================

api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    console.error("API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    const message =
      error.response?.data?.message ||
      "Server bilan ulanishda xatolik";

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("user_token");
      localStorage.removeItem("isLoggedIn");

      window.location.href = "/login";
    }

    toast.error(
      Array.isArray(message)
        ? message[0]
        : message
    );

    return Promise.reject(error);
  }
);


// =========================
// HELPERS
// =========================

export const toArray = (data) => {
  if (!data) return [];

  if (Array.isArray(data)) return data;

  if (Array.isArray(data.data))
    return data.data;

  if (Array.isArray(data.items))
    return data.items;

  if (Array.isArray(data.result))
    return data.result;

  return [];
};


export const normalizeProduct = (p = {}) => {
  return {
    id: String(
      p.id ||
      p.productId ||
      ""
    ),

    productId: String(
      p.productId ||
      p.id ||
      ""
    ),

    name:
      p.name ||
      "Nomsiz mahsulot",

    category:
      p.category ||
      "Go'sht",

    price: Number(
      p.sotish ||
      p.price ||
      0
    ),

    sotish: Number(
      p.sotish ||
      p.price ||
      0
    ),

    tannarx: Number(
      p.tannarx ||
      p.cost ||
      0
    ),

    currentStock: Number(
      p.currentStock ||
      p.quantityKg ||
      p.stock ||
      0
    ),

    quantityKg: Number(
      p.currentStock ||
      p.quantityKg ||
      p.stock ||
      0
    ),
  };
};


// =========================
// API SERVICE
// =========================

export const apiService = {

  // ================= LOGIN

  login: async (credentials) => {
    try {
      const res = await api.post("/auth/login", {
        email: String(credentials.email || "").trim(),
        password: String(credentials.password || "").trim(),
      });
  
      console.log("LOGIN RESPONSE:", res);
  
      // TOKENNI TOPISH
      const token =
        res?.token ||
        res?.accessToken ||
        res?.access_token ||
        res?.jwt ||
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.access_token ||
        res?.data?.jwt;
  
      // USERNI TOPISH
      const user =
        res?.user ||
        res?.data?.user ||
        res?.data;
  
      if (!token) {
        console.error("TOKEN TOPILMADI:", res);
  
        toast.error("Token kelmadi!");
  
        return {
          success: false,
          data: res,
        };
      }
  
      // SAVE
      localStorage.setItem("user_token", token);
      localStorage.setItem("isLoggedIn", "true");
  
      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }
  
      return {
        success: true,
        token,
        user,
      };
    } catch (err) {
      console.log("LOGIN ERROR:", err);
  
      const status = err.response?.status;
  
      if (status === 409) {
        toast.error(
          "Login yoki parol noto‘g‘ri"
        );
      } else if (status === 401) {
        toast.error("Ruxsat yo‘q");
      } else if (status === 500) {
        toast.error("Server xatosi");
      } else {
        toast.error("Login amalga oshmadi");
      }
  
      return {
        success: false,
      };
    }
  },


  logout: () => {
    localStorage.removeItem(
      "user_token"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    window.location.href = "/login";
  },


  // ================= PRODUCTS

  getProducts: async () => {
    try {
      const res = await api.get(
        "/products"
      );

      return toArray(res).map(
        normalizeProduct
      );
    } catch {
      return [];
    }
  },


  addProduct: async (data) => {
    return api.post("/products", {
      name: data.name,
      tannarx: Number(
        data.tannarx || 0
      ),
      sotish: Number(
        data.sotish || 0
      ),
      category:
        data.category ||
        "Go'sht",
    });
  },

// ================= WAREHOUSE (SWAGGER STYLE)

getWarehouse: async () => {
  try {
    const res = await api.get("/warehouse");
    return Array.isArray(res) ? res : [];
  } catch (err) {
    return [];
  }
},

addWarehouseStock: async (data) => {
  try {
    return await api.post("/warehouse/in", {
      productId: data.productId,
      weight: Number(data.weight),
    });
  } catch (err) {
    console.log("WAREHOUSE ADD ERROR:", err);
    throw err;
  }
},
  updateProduct: async (
    id,
    data
  ) => {
    return api.put(
      `/products/update/${id}`,
      {
        name: data.name,
        tannarx: Number(
          data.tannarx || 0
        ),
        sotish: Number(
          data.sotish || 0
        ),
        category:
          data.category ||
          "Go'sht",
      }
    );
  },


  deleteProduct: async (id) => {
    return api.delete(
      `/products/delete/${id}`
    );
  },
// ================= DASHBOARD API

getDashboardStats: async (
  filter = "bugun"
) => {

  try {

    const res = await API.get(
      `/dashboard/statistika/period?filter=${filter}`
    );

    return res.data;

  } catch (err) {

    console.log(
      "DASHBOARD API ERROR:",
      err
    );

    return {
      totalSales: 0,
      totalProfit: 0,
      activeDebts: 0,
      receivedDebtPayments: 0,
      realSalesIncome: 0,
      netCashFlow: 0,
      totalExpectedMoney: 0,
    };
  }
},

  // ================= WAREHOUSE

  getWarehouse: async () => {
    try {
      const res = await api.get(
        "/warehouse/current"
      );

      return toArray(res).map(
        normalizeProduct
      );
    } catch {
      return [];
    }
  },
  


  receiveStock: async (
    data
  ) => {
    return api.post(
      "/warehouse/receive",
      {
        productId:
          data.productId,

        quantityKg: Number(
          data.quantityKg || 0
        ),
      }
    );
  },


  // ================= SALES

  createSale: async (
    data
  ) => {
    return api.post("/sale", {
      items: data.items,
      paymentMethod:
        data.paymentMethod ||
        "NAQD",
    });
  },


  getSalesHistory:
    async () => {
      try {
        const res =
          await api.get(
            "/sale/history"
          );

        return toArray(res);
      } catch {
        return [];
      }
    },


  // ================= DEBTS

  getDebts: async () => {
    try {
      const res = await api.get(
        "/debt"
      );

      return toArray(res);
    } catch {
      return [];
    }
  },


  addDebtCustomer:
    async (data) => {
      return api.post(
        "/debt/customer",
        {
          name: data.name,
          phone: data.phone,
        }
      );
    },


  payDebt: async (
    id,
    amount
  ) => {
    return api.put(
      `/debt/pay/${id}`,
      {
        amount: Number(amount),
      }
    );
  },


  // ================= STATS

  getStats: async (
    period = "bugun"
  ) => {
    try {
      return await api.get(
        `/report?period=${period}`
      );
    } catch {
      return {};
    }
  },


  // ================= PROFILE

  getProfile: async () => {
    return api.get("/profile");
  },

};


export default api;