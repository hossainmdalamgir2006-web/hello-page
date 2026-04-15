import jsPDF from 'jspdf';

interface PackingSlipItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface PackingSlipData {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  items: PackingSlipItem[];
  notes?: string | null;
  store_name?: string;
}

export interface PackingSlipTemplateConfig {
  store_name?: string;
  accent_color?: string;
  show_notes?: boolean;
  show_signature?: boolean;
  footer_text?: string;
  store_logo_url?: string;
  show_store_info?: boolean;
  store_address?: string;
  store_phone?: string;
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [15, 23, 42];
}

function buildColors(accentHex?: string) {
  const primary: RGB = accentHex ? hexToRgb(accentHex) : [15, 23, 42];
  return {
    primary,
    accent: [37, 99, 235] as RGB,
    text: [30, 41, 59] as RGB,
    textMuted: [100, 116, 139] as RGB,
    border: [226, 232, 240] as RGB,
    borderLight: [241, 245, 249] as RGB,
    bgLight: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
    accentBg: [239, 246, 255] as RGB,
  };
}

export function generatePackingSlip(data: PackingSlipData, config?: PackingSlipTemplateConfig) {
  const C = buildColors(config?.accent_color);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const storeName = config?.store_name || data.store_name || 'YOUR STORE';
  const storeAddress = config?.store_address || '';
  const storePhone = config?.store_phone || '';
  const showNotes = config?.show_notes ?? true;
  const showSignature = config?.show_signature ?? true;
  const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0);

  // ─── OUTER CARD BORDER ───
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, 8, pageWidth - 20, pageHeight - 16, 4, 4);

  let y = 18;

  // ─── HEADER ───
  // Logo circle
  doc.setFillColor(...C.primary);
  doc.circle(margin + 10, y + 5, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text(storeName.charAt(0).toUpperCase(), margin + 10, y + 8, { align: "center" });

  // Store name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.primary);
  doc.text(storeName, margin + 22, y + 8);

  // PACKING SLIP title
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.primary);
  doc.text("PACKING SLIP", rightX, y + 6, { align: "right" });

  y += 18;

  // Store info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  if (storeAddress) { doc.text(storeAddress, margin, y); y += 4; }
  if (storePhone) { doc.text(storePhone, margin, y); y += 4; }

  // Meta info on right
  let metaY = y - 8;
  const metaLabelX = rightX - 50;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text("Order No:", metaLabelX, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.primary);
  doc.text(data.order_number, rightX, metaY, { align: "right" });

  metaY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text("Date:", metaLabelX, metaY);
  doc.setTextColor(...C.text);
  doc.text(new Date(data.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), rightX, metaY, { align: "right" });

  metaY += 6;
  doc.setTextColor(...C.textMuted);
  doc.text("Total Items:", metaLabelX, metaY);
  // Items badge
  doc.setFillColor(...C.accentBg);
  const badgeText = `${totalQty} pcs`;
  const badgeW = doc.getTextWidth(badgeText) + 6;
  doc.roundedRect(rightX - badgeW, metaY - 3.5, badgeW, 5.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.accent);
  doc.text(badgeText, rightX - badgeW / 2, metaY + 0.5, { align: "center" });

  y = Math.max(y, metaY) + 10;

  // ─── SHIP TO ───
  doc.setFillColor(...C.bgLight);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3);

  let shipY = y + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text("SHIP TO", margin + 8, shipY);
  shipY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.primary);
  doc.text(data.customer_name, margin + 8, shipY);
  shipY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  if (data.shipping_address) {
    const addrLines = doc.splitTextToSize(data.shipping_address, contentWidth - 16);
    addrLines.forEach((line: string) => { doc.text(line, margin + 8, shipY); shipY += 4.5; });
  }
  if (data.customer_phone) { doc.text(data.customer_phone, margin + 8, shipY); }

  y += 40;

  // ─── ITEMS TABLE ───
  const colHash = margin + 8;
  const colItem = margin + 20;
  const colSku = margin + contentWidth * 0.45;
  const colLoc = margin + contentWidth * 0.6;
  const colQty = margin + contentWidth * 0.76;
  const colCheck = margin + contentWidth - 12;

  // Table header
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, y, contentWidth, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text("#", colHash, y + 7);
  doc.text("Item", colItem, y + 7);
  doc.text("SKU", colSku, y + 7);
  doc.text("Location", colLoc, y + 7);
  doc.text("Qty", colQty, y + 7, { align: "center" });
  doc.text("\u2713 Packed", colCheck, y + 7, { align: "center" });
  y += 14;

  // Table rows
  data.items.forEach((item, index) => {
    if (y > pageHeight - 70) { doc.addPage(); y = 20; }

    const rowH = 14;

    // Row background
    if (index % 2 !== 0) {
      doc.setFillColor(...C.bgLight);
      doc.rect(margin, y - 4, contentWidth, rowH, "F");
    }

    // Row bottom border
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH - 4, margin + contentWidth, y + rowH - 4);

    // Number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(`${index + 1}`, colHash, y + 3);

    // Item name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primary);
    const maxNameW = colSku - colItem - 5;
    const nameLines = doc.splitTextToSize(item.product_name, maxNameW);
    doc.text(nameLines[0], colItem, y + 3);

    // SKU placeholder
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.textMuted);
    doc.text("—", colSku, y + 3);

    // Location placeholder
    doc.text("—", colLoc, y + 3);

    // Qty
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.primary);
    doc.text(item.quantity.toString(), colQty, y + 4, { align: "center" });

    // Checkbox
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.6);
    doc.roundedRect(colCheck - 3, y - 1, 7, 7, 1, 1);

    y += rowH;
  });

  y += 8;

  // ─── SUMMARY ───
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  doc.text(`\u2611 Total SKUs: ${data.items.length}`, margin, y);
  doc.text(`|   Total Pieces: ${totalQty}`, margin + 40, y);
  y += 12;

  // ─── PACKING NOTES ───
  if (showNotes) {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.primary);
    doc.text("Packing Notes", margin, y);

    if (showSignature) {
      doc.text("Packed By", rightX - 30, y);
    }

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);

    if (data.notes) {
      const noteLines = doc.splitTextToSize(data.notes, contentWidth * 0.6);
      noteLines.forEach((line: string) => {
        doc.text(`• ${line}`, margin, y);
        y += 5;
      });
    } else {
      doc.text("• Handle with care", margin, y); y += 5;
      doc.text("• Include invoice copy inside package", margin, y); y += 5;
      doc.text("• Double-check quantities before sealing", margin, y); y += 5;
    }

    if (showSignature) {
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(rightX - 45, y - 2, rightX, y - 2);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...C.textMuted);
      doc.text("Signature & Date", rightX - 25, y + 4);
    }
  }

  // ─── FOOTER ───
  const footerY = pageHeight - 18;
  doc.setFillColor(...C.accentBg);
  doc.roundedRect(margin, footerY - 4, contentWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.accent);
  doc.text("This is a packing slip — no pricing information included", pageWidth / 2, footerY + 3, { align: "center" });

  doc.save(`packing-slip-${data.order_number}.pdf`);
}
