import { jsPDF } from "jspdf";

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceData {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  store_email?: string;
}

export interface InvoiceTemplateConfig {
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  store_email?: string;
  store_logo_url?: string;
  accent_color?: string;
  show_payment_info?: boolean;
  footer_text?: string;
  show_qr_code?: boolean;
  currency_symbol?: string;
  show_store_info?: boolean;
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [59, 130, 246];
}

function buildColors(accentHex?: string) {
  const accent: RGB = accentHex ? hexToRgb(accentHex) : [59, 130, 246];
  return {
    primary: [15, 23, 42] as RGB,
    accent,
    accentLight: [219, 234, 254] as RGB,
    gold: [180, 142, 58] as RGB,
    text: [30, 41, 59] as RGB,
    textMuted: [100, 116, 139] as RGB,
    textLight: [148, 163, 184] as RGB,
    border: [226, 232, 240] as RGB,
    bgLight: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
    success: [22, 163, 74] as RGB,
    danger: [220, 38, 38] as RGB,
  };
}

function generateSingleInvoice(doc: jsPDF, data: InvoiceData, cfg?: InvoiceTemplateConfig, startY = 0): void {
  const C = buildColors(cfg?.accent_color);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = startY + 5;
  const currencySymbol = cfg?.currency_symbol || "৳";
  const formatCurrency = (amount: number) => `${currencySymbol}${amount.toLocaleString('en-BD', { minimumFractionDigits: 0 })}`;

  const storeName = cfg?.store_name || data.store_name || "YOUR STORE";
  const storeAddress = cfg?.store_address || data.store_address || "";
  const storePhone = cfg?.store_phone || data.store_phone || "";
  const storeEmail = cfg?.store_email || data.store_email || "";
  const footerText = cfg?.footer_text ?? "Thank you for your business!";
  const showPaymentInfo = cfg?.show_payment_info ?? true;
  const showStoreInfo = cfg?.show_store_info ?? true;

  // TOP ACCENT BAR
  doc.setFillColor(...C.accent);
  doc.rect(0, startY, pageWidth, 4, "F");
  y = startY + 20;

  // HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.primary);
  doc.text(storeName, margin, y);

  if (showStoreInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    if (storeAddress) { y += 6; doc.text(storeAddress, margin, y); }
    if (storePhone) { y += 4; doc.text(`Tel: ${storePhone}`, margin, y); }
    if (storeEmail) { y += 4; doc.text(storeEmail, margin, y); }
  }

  const rightX = pageWidth - margin;
  let headerRightY = startY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...C.textLight);
  doc.text("INVOICE", rightX, headerRightY, { align: "right" });
  headerRightY += 10;
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  doc.text(`#INV-${data.order_number}`, rightX, headerRightY, { align: "right" });
  headerRightY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text(`Date: ${new Date(data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, rightX, headerRightY, { align: "right" });

  y = Math.max(y, headerRightY) + 16;

  // SEPARATOR
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // BILL TO / SHIP TO
  const colWidth = (pageWidth - margin * 2 - 20) / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.accent);
  doc.text("BILL TO", margin, y);

  const billStartY = y + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.text(data.customer_name, margin, billStartY);

  let billY = billStartY + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  if (data.customer_phone) { doc.text(data.customer_phone, margin, billY); billY += 5; }
  if (data.customer_email) { doc.text(data.customer_email, margin, billY); billY += 5; }

  const shipX = margin + colWidth + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.accent);
  doc.text("SHIP TO", shipX, y);

  let shipY = y + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.text(data.customer_name, shipX, shipY);
  shipY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  const addressLines = doc.splitTextToSize(data.shipping_address || "N/A", colWidth - 5);
  addressLines.forEach((line: string) => { doc.text(line, shipX, shipY); shipY += 5; });

  y = Math.max(billY, shipY) + 12;

  // ITEMS TABLE
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  const col1 = margin + 5;
  const col2 = margin + 95;
  const col3 = margin + 118;
  const col4 = pageWidth - margin - 5;
  doc.text("DESCRIPTION", col1, y + 2);
  doc.text("QTY", col2, y + 2);
  doc.text("UNIT PRICE", col3, y + 2);
  doc.text("AMOUNT", col4, y + 2, { align: "right" });
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  data.items.forEach((item, index) => {
    if (y > pageHeight - 80) { doc.addPage(); y = 20; }
    if (index % 2 === 0) { doc.setFillColor(...C.bgLight); doc.rect(margin, y - 5, pageWidth - margin * 2, 10, "F"); }
    doc.setTextColor(...C.text);
    const productLines = doc.splitTextToSize(item.product_name, 82);
    doc.text(productLines[0], col1, y);
    doc.setTextColor(...C.textMuted);
    doc.text(item.quantity.toString(), col2 + 5, y);
    doc.text(formatCurrency(item.unit_price), col3, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.text);
    doc.text(formatCurrency(item.total_price), col4, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    if (productLines.length > 1) {
      for (let i = 1; i < productLines.length; i++) { y += 5; doc.setTextColor(...C.textMuted); doc.text(productLines[i], col1, y); }
    }
    y += 10;
  });
  y += 2;

  // TOTALS
  const totalsBoxX = pageWidth - margin - 85;
  const totalsBoxWidth = 85;
  doc.setFillColor(...C.bgLight);
  doc.roundedRect(totalsBoxX, y - 2, totalsBoxWidth, data.discount > 0 ? 52 : 42, 3, 3, "F");
  const labelX = totalsBoxX + 5;
  const valueX = totalsBoxX + totalsBoxWidth - 5;

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text("Subtotal", labelX, y);
  doc.setTextColor(...C.text);
  doc.text(formatCurrency(data.subtotal), valueX, y, { align: "right" });
  y += 8;
  doc.setTextColor(...C.textMuted);
  doc.text("Shipping", labelX, y);
  doc.setTextColor(...C.text);
  doc.text(formatCurrency(data.shipping_cost), valueX, y, { align: "right" });
  if (data.discount > 0) {
    y += 8;
    doc.setTextColor(...C.textMuted);
    doc.text("Discount", labelX, y);
    doc.setTextColor(...C.success);
    doc.text(`-${formatCurrency(data.discount)}`, valueX, y, { align: "right" });
  }
  y += 6;
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1.5);
  doc.line(totalsBoxX + 3, y, totalsBoxX + totalsBoxWidth - 3, y);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.accent);
  doc.text("TOTAL", labelX, y);
  doc.text(formatCurrency(data.total), valueX, y, { align: "right" });
  y += 20;

  // PAYMENT INFO
  if (showPaymentInfo) {
    doc.setFillColor(...C.accentLight);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 3, 3, "F");
    y += 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text("Payment Method", margin + 8, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.text(data.payment_method || "N/A", margin + 50, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text("Status", pageWidth / 2 + 10, y);
    const statusColor = data.payment_status === "paid" ? C.success : data.payment_status === "failed" ? C.danger : C.gold;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...statusColor);
    doc.text(data.payment_status.toUpperCase(), pageWidth / 2 + 30, y);
  }

  // QR CODE PLACEHOLDER
  if (cfg?.show_qr_code) {
    const qrY = pageHeight - 55;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, qrY, 25, 25, 2, 2);
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    doc.text("QR Code", margin + 4, qrY + 14);
  }

  // FOOTER
  y = pageHeight - 30;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  if (footerText) doc.text(footerText, pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(7);
  doc.text(storeEmail, pageWidth / 2, y, { align: "center" });

  doc.setFillColor(...C.accent);
  doc.rect(0, pageHeight - 4, pageWidth, 4, "F");
}

export function generateInvoicePDF(data: InvoiceData, config?: InvoiceTemplateConfig): void {
  const doc = new jsPDF();
  generateSingleInvoice(doc, data, config);
  doc.save(`Invoice-${data.order_number}.pdf`);
}

export function generateBulkInvoicePDF(invoices: InvoiceData[], config?: InvoiceTemplateConfig): void {
  if (invoices.length === 0) return;
  const doc = new jsPDF();
  invoices.forEach((data, index) => {
    if (index > 0) doc.addPage();
    generateSingleInvoice(doc, data, config);
  });
  doc.save(`Invoices-Bulk-${invoices.length}.pdf`);
}

export function orderToInvoiceData(order: {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  items: Array<{ product_name: string; quantity: number; unit_price: number; total_price: number; }>;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
}): InvoiceData {
  let addressString = "N/A";
  if (order.shipping_address) {
    if (typeof order.shipping_address === "string") {
      addressString = order.shipping_address;
    } else if (typeof order.shipping_address === "object") {
      const parts = [order.shipping_address.street, order.shipping_address.area, order.shipping_address.city].filter(Boolean);
      addressString = parts.join(", ");
    }
  }
  return {
    order_number: order.order_number,
    created_at: order.created_at,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: addressString,
    items: order.items,
    subtotal: order.subtotal,
    shipping_cost: order.shipping_cost,
    discount: order.discount,
    total: order.total,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
  };
}
