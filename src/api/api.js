export const apiService = {
  // 1. MAHSULOTLARNI YUKLASH VA YANGILASH
  getWarehouseStock: () => {
    let products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    if (products.length === 0) {
      products = [
        { id: 101, name: "Mol go'shti (Bo'yin)", price: 82000, cost: 72000, currentStock: 0, type: "beef" },
        { id: 102, name: "Mol go'shti (Pusti mag'iz)", price: 120000, cost: 105000, currentStock: 0, type: "beef" },
        { id: 1, name: "Tovuq (File)", price: 32000, cost: 26000, currentStock: 0, type: "chicken" },
        { id: 13, name: "Tovuq (Gril)", price: 26500, cost: 21000, currentStock: 0, type: "chicken" },
        { id: 14, name: "Tuxum", price: 28000, cost: 24000, currentStock: 0, type: "chicken" },
      ];
      localStorage.setItem('meat_inventory', JSON.stringify(products));
    }
    return Promise.resolve({ data: products });
  },

  updateProductPrice: (productId, newPrice, newCost) => {
    let products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    const updated = products.map(p => 
      p.id === Number(productId) ? { ...p, price: Number(newPrice), cost: Number(newCost) } : p
    );
    localStorage.setItem('meat_inventory', JSON.stringify(updated));
    return Promise.resolve({ success: true });
  },

  addStock: (data) => {
    let products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    const updated = products.map(p => 
      p.id === Number(data.product_id) ? { ...p, currentStock: (Number(p.currentStock) || 0) + Number(data.weight) } : p
    );
    localStorage.setItem('meat_inventory', JSON.stringify(updated));
    return Promise.resolve({ success: true });
  },

  // 2. SOTUV VA QARZLAR
  createSale: (saleData) => {
    const sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    const saleId = Date.now();

    const newSale = { ...saleData, id: saleId, date: new Date().toISOString() };
    sales.push(newSale);
    localStorage.setItem('sales_history', JSON.stringify(sales));

    const updatedProducts = products.map(p => {
      const soldItem = saleData.items.find(item => item.id === p.id);
      return soldItem ? { ...p, currentStock: Math.max(0, (p.currentStock || 0) - soldItem.qty) } : p;
    });
    localStorage.setItem('meat_inventory', JSON.stringify(updatedProducts));

    if (saleData.paymentMethod === 'nasiya') {
      const debts = JSON.parse(localStorage.getItem('debts') || '[]');
      debts.push({
        id: Date.now(),
        saleId: saleId,
        name: saleData.customer.name,
        totalDebt: saleData.totalAmount,
        date: new Date().toLocaleDateString('uz-UZ')
      });
      localStorage.setItem('debts', JSON.stringify(debts));
    }
    return Promise.resolve({ success: true });
  },

  payDebt: (debtId) => {
    let debts = JSON.parse(localStorage.getItem('debts') || '[]');
    let sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const debt = debts.find(d => d.id === debtId);
    
    if (debt) {
      sales = sales.map(s => s.id === debt.saleId ? { ...s, paymentMethod: 'naqd' } : s);
      debts = debts.filter(d => d.id !== debtId);
      localStorage.setItem('debts', JSON.stringify(debts));
      localStorage.setItem('sales_history', JSON.stringify(sales));
    }
    return Promise.resolve({ success: true });
  },

  // 3. HISOBOTLAR
  getStats: (period) => {
    const sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const now = new Date();
    const filtered = sales.filter(s => {
      const d = new Date(s.date);
      if (period === 'bugun') return d.toDateString() === now.toDateString();
      if (period === 'hafta') return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      return true;
    });

    const totalRev = filtered.reduce((a, b) => a + (Number(b.totalAmount) || 0), 0);
    const profit = filtered.reduce((sum, s) => sum + s.items.reduce((p, i) => p + ((Number(i.price) - (Number(i.cost) || i.price * 0.85)) * i.qty), 0), 0);
    const card = filtered.filter(s => s.paymentMethod === 'karta').reduce((a, b) => a + b.totalAmount, 0);
    const cash = filtered.filter(s => s.paymentMethod === 'naqd').reduce((a, b) => a + b.totalAmount, 0);
    const debt = filtered.filter(s => s.paymentMethod === 'nasiya').reduce((a, b) => a + b.totalAmount, 0);

    return Promise.resolve({ data: [
      { title: "Umumiy Savdo", value: totalRev.toLocaleString(), type: 'total' },
      { title: "Sof Foyda", value: profit.toLocaleString(), type: 'profit' },
      { title: "Karta orqali", value: card.toLocaleString(), type: 'card' },
      { title: "Naqd tushum", value: cash.toLocaleString(), type: 'cash' },
      { title: "Nasiyalar", value: debt.toLocaleString(), type: 'debt' }
    ]});
  },

  getRecentSales: () => {
    const sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const recent = sales.slice(-10).reverse().map(s => ({
      id: s.id,
      customer: s.customer?.name || "Naqd Mijoz",
      product: s.items.map(i => i.name).join(", "),
      total: s.totalAmount.toLocaleString(),
      paymentDisplay: s.paymentMethod === 'nasiya' ? "Nasiya :" : (s.paymentMethod === 'karta' ? "Karta :" : "Naqd :"),
      time: new Date(s.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    }));
    return Promise.resolve({ data: recent });
  },

  getDebtors: () => Promise.resolve({ data: JSON.parse(localStorage.getItem('debts') || '[]') }),
  // api.js

  // LOGIN FUNKSIYASI
  login: async (credentials) => {
    // Kelajakda bu yerda: return axios.post('/api/login', credentials) bo'ladi
    const { username, password } = credentials;

    // Simulyatsiya: Haqiqiy backend bo'lganda bu qism serverdan keladi
    if (username === 'admin' && password === '12345') {
      const mockToken = "meat-pos-token-777"; // Backenddan keladigan JWT token simulyatsiyasi
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', mockToken);
      return { success: true, user: { name: 'Admin', role: 'owner' } };
    } else {
      throw new Error("Login yoki parol xato!");
    }
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  // Boshqa barcha funksiyalar (getWarehouseStock, createSale va h.k.) pastdan davom etadi...
};