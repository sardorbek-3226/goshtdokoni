import qz from "qz-tray";

export async function printReceipt(sale) {
  try {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    // Printer nomi control printers dagi nom bilan bir xil bo‘lsin
    const printerName = "Xprinter";
    const config = qz.configs.create(printerName);

    const itemsText = sale.items
      .map(
        (item) =>
          `${item.name}\n${item.quantityKg} kg x ${item.price} = ${item.total}\n`
      )
      .join("");

    const data = [
      "\x1B\x40", // printer reset
      "\x1B\x61\x01", // center
      "SIFAT BROYLER 006\n",
      "--------------------------\n",
      "\x1B\x61\x00", // left
      `Sana: ${new Date().toLocaleString()}\n`,
      "--------------------------\n",
      itemsText,
      "--------------------------\n",
      `Jami: ${sale.total} so'm\n`,
      `To'lov: ${sale.paymentMethod}\n`,
      "\nRahmat!\n\n\n",
      "\x1D\x56\x00", // cut
    ];

    await qz.print(config, data);

    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
    }
  } catch (error) {
    console.error("Print error:", error);
    alert("Chek chiqarishda xatolik bo‘ldi");
  }
}