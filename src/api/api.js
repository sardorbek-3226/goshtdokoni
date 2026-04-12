

export const apiService = {
  // 1. MAHSULOTLAR VA OMBOR
  getWarehouseStock: () => {
    let products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    
    if (products.length === 0) {
      products = [
        // --- MOL GO'SHTI ---
        { id: 101, name: "Mol go'shti (Bo'yin)", price: 82000, cost: 72000, currentStock: 0, type: "beef" },
        { id: 102, name: "Mol go'shti (Pusti mag'iz)", price: 120000, cost: 105000, currentStock: 0, type: "beef" },
        { id: 103, name: "Mol go'shti (Ichki son)", price: 100000, cost: 88000, currentStock: 0, type: "beef" },
        { id: 104, name: "Mol go'shti (Son yabliska)", price: 96000, cost: 84000, currentStock: 0, type: "beef" },
        { id: 105, name: "Mol go'shti (Son qismi)", price: 95000, cost: 83000, currentStock: 0, type: "beef" },
        { id: 106, name: "Mol go'shti (Son o'rta)", price: 94000, cost: 82000, currentStock: 0, type: "beef" },
        { id: 107, name: "Mol go'shti (Mushtak)", price: 80000, cost: 70000, currentStock: 0, type: "beef" },
        { id: 108, name: "Mol go'shti (Qo'l qismi)", price: 85000, cost: 75000, currentStock: 0, type: "beef" },
        { id: 109, name: "Mol go'shti (Qovurg'a)", price: 80000, cost: 70000, currentStock: 0, type: "beef" },
        { id: 110, name: "Mol go'shti (Jigar)", price: 45000, cost: 35000, currentStock: 0, type: "beef" },
        { id: 111, name: "Mol go'shti (Bo'yin qism)", price: 83000, cost: 73000, currentStock: 0, type: "beef" },
        { id: 112, name: "Mol go'shti (Til)", price: 60000, cost: 50000, currentStock: 0, type: "beef" },

        // --- TOVUQ MAHSULOTLARI ---
        { id: 1, name: "Tovuq (File)", price: 32000, cost: 26000, currentStock: 0, type: "chicken" },
        { id: 2, name: "Tovuq (Bedro)", price: 27000, cost: 22000, currentStock: 0, type: "chicken" },
        { id: 3, name: "Tovuq (Golen)", price: 30000, cost: 24000, currentStock: 0, type: "chicken" },
        { id: 4, name: "Tovuq (Qanot)", price: 31000, cost: 25000, currentStock: 0, type: "chicken" },
        { id: 5, name: "Tovuq (Akolachka)", price: 22000, cost: 18000, currentStock: 0, type: "chicken" },
        { id: 6, name: "Tovuq (Plicho)", price: 32000, cost: 26000, currentStock: 0, type: "chicken" },
        { id: 7, name: "Tovuq (Krilishka)", price: 33000, cost: 27000, currentStock: 0, type: "chicken" },
        { id: 8, name: "Tovuq (Katta go'sht)", price: 23000, cost: 19000, currentStock: 0, type: "chicken" },
        { id: 9, name: "Tovuq (Drakon)", price: 8000, cost: 6000, currentStock: 0, type: "chicken" },
        { id: 10, name: "Tovuq (Spinka)", price: 8000, cost: 6000, currentStock: 0, type: "chicken" },
        { id: 11, name: "Tovuq (Po'taka)", price: 5000, cost: 3500, currentStock: 0, type: "chicken" },
        { id: 12, name: "Tovuq (Jigar)", price: 4000, cost: 2500, currentStock: 0, type: "chicken" },
        { id: 13, name: "Tovuq (Gril)", price: 26500, cost: 21000, currentStock: 0, type: "chicken" },
        { id: 14, name: "Tuxum", price: 28000, cost: 24000, currentStock: 0, type: "chicken" },
      ];
      localStorage.setItem('meat_inventory', JSON.stringify(products));
    }
    return Promise.resolve({ data: products });
  },
  // 2. SOTUV YARATISH
  createSale: (saleData) => {
    const sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    const saleId = Date.now();

    const newSale = { 
      ...saleData, 
      id: saleId, 
      date: new Date().toISOString() 
    };
    sales.push(newSale);
    localStorage.setItem('sales_history', JSON.stringify(sales));

    // Ombordan ayirish
    const updatedProducts = products.map(p => {
      const soldItem = saleData.items.find(item => item.id === p.id);
      if (soldItem) return { ...p, currentStock: Math.max(0, p.currentStock - soldItem.qty) };
      return p;
    });
    localStorage.setItem('meat_inventory', JSON.stringify(updatedProducts));

    // Nasiya bo'lsa "debts" ga qo'shish (saleId bilan bog'laymiz)
    if (saleData.paymentMethod === 'nasiya') {
      const debts = JSON.parse(localStorage.getItem('debts') || '[]');
      debts.push({
        id: Date.now(),
        saleId: saleId, // Qaysi sotuv ekanligini bilish uchun
        name: saleData.customer.name,
        phone: saleData.customer.phone,
        totalDebt: saleData.totalAmount,
        date: new Date().toLocaleDateString('uz-UZ')
      });
      localStorage.setItem('debts', JSON.stringify(debts));
    }
    return Promise.resolve({ success: true });
  },

  // 3. STATISTIKA (Dashboad uchun)
  getStats: (period) => {
    const sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const now = new Date();
  
    const filtered = sales.filter(s => {
      const sDate = new Date(s.date);
      if (period === 'bugun') return sDate.toDateString() === now.toDateString();
      if (period === 'hafta') return (now - sDate) / (1000 * 60 * 60 * 24) <= 7;
      if (period === 'oy') return now.getMonth() === sDate.getMonth() && now.getFullYear() === sDate.getFullYear();
      return true;
    });
  
    const totalRevenue = filtered.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const totalProfit = filtered.reduce((sum, sale) => {
      const saleProfit = (sale.items || []).reduce((pSum, item) => {
        const price = Number(item.price) || 0;
        const cost = Number(item.cost) || (price * 0.85);
        const qty = Number(item.qty) || 0;
        return pSum + ((price - cost) * qty);
      }, 0);
      return sum + saleProfit;
    }, 0);

    const naqd = filtered.filter(s => s.paymentMethod === 'naqd').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const karta = filtered.filter(s => s.paymentMethod === 'karta').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const nasiya = filtered.filter(s => s.paymentMethod === 'nasiya').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  
    return Promise.resolve({
      data: [
        { title: "Umumiy Savdo", value: totalRevenue.toLocaleString() },
        { title: "Sof Foyda", value: totalProfit.toLocaleString(), type: "profit" },
        { title: "Karta orqali", value: karta.toLocaleString(), type: "card" },
        { title: "Naqd tushum", value: naqd.toLocaleString(), type: "cash" },
        { title: "Nasiyalar", value: nasiya.toLocaleString(), type: "debt" }
      ]
    });
  },

  // 4. OXIRGI SOTUVLARDA MIJOZNI KO'RSATISH
  getRecentSales: () => {
    const sales = JSON.parse(localStorage.getItem('sales_history') || '[]');
    const recent = sales.slice(-15).reverse().map(s => ({
      id: s.id,
      // MIJOZ ISMI SHU YERDA TO'G'IRLANDI:
      customer: (s.customer && s.customer.name) ? s.customer.name : "Naqd Mijoz",
      product: s.items.map(i => i.name).join(", "),
      total: s.totalAmount.toLocaleString(),
      paymentDisplay: s.paymentMethod === 'nasiya' ? "Nasiya :" : (s.paymentMethod === 'karta' ? "Karta :" : "Naqd :"),
      time: new Date(s.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    }));
    return Promise.resolve({ data: recent });
  },

  // 5. QARZNI TO'LASH VA DASHBOARDDAN O'CHIRISH
  payDebt: (debtId) => {
    let debts = JSON.parse(localStorage.getItem('debts') || '[]');
    let sales = JSON.parse(localStorage.getItem('sales_history') || '[]');

    const debt = debts.find(d => d.id === debtId);
    if (debt) {
      // Sotuv tarixida ham to'lov usulini 'naqd' ga o'zgartiramiz
      // Shunda Dashboard'da Nasiyadan ayirilib, Naqdga qo'shiladi
      sales = sales.map(s => {
        if (s.id === debt.saleId) return { ...s, paymentMethod: 'naqd' };
        return s;
      });

      // Qarzlar ro'yxatidan o'chirish
      debts = debts.filter(d => d.id !== debtId);

      localStorage.setItem('debts', JSON.stringify(debts));
      localStorage.setItem('sales_history', JSON.stringify(sales));
    }
    return Promise.resolve({ success: true });
  },

  getDebtors: () => Promise.resolve({ data: JSON.parse(localStorage.getItem('debts') || '[]') }),
  addStock: (data) => {
    // 1. Ombordagi mahsulotlarni olish
    let products = JSON.parse(localStorage.getItem('meat_inventory') || '[]');
    
    // 2. Ma'lumotlarni tozalash (Xatolik bo'lmasligi uchun)
    const incomingId = Number(data.product_id); // ID ni songa o'tkazamiz
    const incomingWeight = parseFloat(data.weight); // Vaznni songa o'tkazamiz
  
    // Agar vazn raqam bo'lmasa yoki 0 dan kichik bo'lsa, to'xtatamiz
    if (isNaN(incomingWeight) || incomingWeight <= 0) {
      return Promise.reject("Noto'g'ri vazn kiritildi");
    }
  
    // 3. Mahsulotni topish va zahirasini yangilash
    const updated = products.map(p => {
      // ID-larni qat'iy tekshiramiz (Number == Number)
      if (Number(p.id) === incomingId) {
        const current = Number(p.currentStock) || 0;
        return { ...p, currentStock: current + incomingWeight };
      }
      return p;
    });
  
    // 4. LocalStorage-ga qayta saqlash
    localStorage.setItem('meat_inventory', JSON.stringify(updated));
    
    return Promise.resolve({ success: true });
  },
};