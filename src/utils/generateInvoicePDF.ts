import { jsPDF } from "jspdf";
import { PAYMENT_METHOD_DEFINITIONS } from "@/data/paymentMethodDefinitions";

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
  payment_method_logo?: string;
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  store_email?: string;
  tax?: number;
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

// Hardcoded fallback logos for common payment methods
const FALLBACK_PAYMENT_LOGOS: Record<string, string> = {
  bkash: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Bkash_logo.png/220px-Bkash_logo.png",
  nagad: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Nagad_logo.svg/220px-Nagad_logo.svg.png",
  rocket: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dutch-Bangla_Bank_Rocket_logo.png/220px-Dutch-Bangla_Bank_Rocket_logo.png",
  upay: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/UCB_Upay_Logo.png/220px-UCB_Upay_Logo.png",
  paypal: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/220px-PayPal.svg.png",
  stripe: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/220px-Stripe_Logo%2C_revised_2016.svg.png",
  payoneer: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Payoneer_logo.svg/220px-Payoneer_logo.svg.png",
  cod: "",
  cash_on_delivery: "",
};

function getPaymentLogoUrl(paymentMethod: string, dbLogoUrl?: string): string {
  if (dbLogoUrl) return dbLogoUrl;
  const code = paymentMethod?.toLowerCase().replace(/\s+/g, '_') || '';
  return FALLBACK_PAYMENT_LOGOS[code] || "";
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [59, 130, 246];
}

function buildColors(accentHex?: string) {
  const accent: RGB = accentHex ? hexToRgb(accentHex) : [37, 99, 235];
  return {
    primary: [15, 23, 42] as RGB,
    accent,
    text: [30, 41, 59] as RGB,
    textMuted: [100, 116, 139] as RGB,
    textLight: [148, 163, 184] as RGB,
    border: [226, 232, 240] as RGB,
    borderLight: [241, 245, 249] as RGB,
    bgLight: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
    success: [22, 163, 74] as RGB,
    danger: [220, 38, 38] as RGB,
    gold: [180, 142, 58] as RGB,
    bgCard: [249, 250, 251] as RGB,
  };
}

function generateSingleInvoice(doc: jsPDF, data: InvoiceData, cfg?: InvoiceTemplateConfig, startY = 0, logoData?: string | null, paymentLogoData?: string | null): void {
  const C = buildColors(cfg?.accent_color);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const currencySymbol = cfg?.currency_symbol || "BDT";
  const fmt = (n: number) => {
    const formatted = Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${currencySymbol} ${formatted}`;
  };

  const storeName = cfg?.store_name || data.store_name || "YOUR STORE";
  const storeAddress = cfg?.store_address || data.store_address || "";
  const storePhone = cfg?.store_phone || data.store_phone || "";
  const storeEmail = cfg?.store_email || data.store_email || "";
  const footerText = cfg?.footer_text ?? "Thank you for your purchase! If you have any questions, contact us at " + storeEmail;
  const showPaymentInfo = cfg?.show_payment_info ?? true;
  const showStoreInfo = cfg?.show_store_info ?? true;

  // ─── OUTER CARD BORDER ───
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, startY + 8, pageWidth - 20, pageHeight - 16, 4, 4);

  let y = startY + 18;

  // ─── HEADER SECTION ───
  // Logo - image or fallback circle
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin + 2, y - 3, 16, 16);
    } catch {
      // Fallback to circle if image fails
      doc.setFillColor(...C.primary);
      doc.circle(margin + 10, y + 5, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...C.white);
      doc.text(storeName.charAt(0).toUpperCase(), margin + 10, y + 8, { align: "center" });
    }
  } else {
    doc.setFillColor(...C.primary);
    doc.circle(margin + 10, y + 5, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C.white);
    doc.text(storeName.charAt(0).toUpperCase(), margin + 10, y + 8, { align: "center" });
  }

  // Store name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.primary);
  doc.text(storeName, margin + 22, y + 4);

  // INVOICE title on right
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.primary);
  doc.text("INVOICE", rightX, y + 4, { align: "right" });

  y += 18;

  // Store address info
  if (showStoreInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    if (storeAddress) { doc.text(storeAddress, margin, y); y += 4; }
    if (storeEmail) { doc.text(storeEmail, margin, y); y += 4; }
    if (storePhone) { doc.text(storePhone, margin, y); y += 4; }
  }

  // Invoice meta on right — starts after INVOICE title
  let metaY = y - 8;
  const metaLabelX = rightX - 55;
  const metaValueX = rightX;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text("Invoice No:", metaLabelX, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.accent);
  doc.text(`INV-${data.order_number}`, metaValueX, metaY, { align: "right" });

  metaY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text("Date:", metaLabelX, metaY);
  doc.setTextColor(...C.text);
  doc.text(new Date(data.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), metaValueX, metaY, { align: "right" });

  metaY += 6;
  doc.setTextColor(...C.textMuted);
  doc.text("Due Date:", metaLabelX, metaY);
  doc.setTextColor(...C.text);
  const dueDate = new Date(data.created_at);
  dueDate.setDate(dueDate.getDate() + 7);
  doc.text(dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), metaValueX, metaY, { align: "right" });

  // Payment status badge — always show
  metaY += 7;
  const pStatus = (data.payment_status || "pending").toLowerCase();
  const statusLabel = pStatus.toUpperCase();
  const badgeColors: Record<string, RGB> = {
    paid: [22, 163, 74],
    pending: [217, 119, 6],
    failed: [220, 38, 38],
    cancelled: [220, 38, 38],
    refunded: [100, 116, 139],
  };
  const badgeColor: RGB = badgeColors[pStatus] || [100, 116, 139];
  const badgeW = Math.max(22, doc.getTextWidth(statusLabel) + 8);
  const badgeX = metaValueX;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(badgeX - badgeW, metaY - 2, badgeW, 8, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.white);
  doc.text(statusLabel, badgeX - badgeW / 2, metaY + 3.5, { align: "center" });

  y = Math.max(y, metaY) + 10;

  // ─── BILL TO / SHIP TO ───
  // Calculate dynamic height
  const halfW = contentWidth / 2;
  const billX = margin + 8;
  const shipX = margin + halfW + 8;

  const addressLines = doc.splitTextToSize(data.shipping_address || "N/A", halfW - 16);
  let contactLines = 0;
  if (data.customer_phone && data.customer_phone.trim()) contactLines++;
  if (data.customer_email && data.customer_email.trim()) contactLines++;
  const boxContentH = 8 + 7 + 6 + (addressLines.length * 4.5) + (contactLines * 4.5) + 4;
  const boxH = Math.max(38, boxContentH);

  doc.setFillColor(...C.bgLight);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3, "F");
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3);

  let secY = y + 8;

  // Divider
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin + halfW, y + 5, margin + halfW, y + boxH - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text("BILL TO", billX, secY);
  doc.text("SHIP TO", shipX, secY);
  secY += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text(data.customer_name, billX, secY);
  doc.text(data.customer_name, shipX, secY);
  secY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);

  // Bill To details
  let bY = secY;
  addressLines.forEach((line: string) => { doc.text(line, billX, bY); bY += 4.5; });
  if (data.customer_phone && data.customer_phone.trim()) { doc.text(data.customer_phone, billX, bY); bY += 4.5; }
  if (data.customer_email && data.customer_email.trim()) { doc.text(data.customer_email, billX, bY); }

  // Ship To details
  let sY = secY;
  addressLines.forEach((line: string) => { doc.text(line, shipX, sY); sY += 4.5; });
  if (data.customer_phone && data.customer_phone.trim()) { doc.text(data.customer_phone, shipX, sY); sY += 4.5; }
  if (data.customer_email && data.customer_email.trim()) { doc.text(data.customer_email, shipX, sY); }

  y += boxH + 8;

  // ─── ITEMS TABLE ───
  const colHash = margin + 5;
  const colProduct = margin + 16;
  const colQty = margin + contentWidth * 0.55;
  const colUnitPrice = margin + contentWidth * 0.72;
  const colTotal = margin + contentWidth - 5;

  // Table header
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, y, contentWidth, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text("#", colHash, y + 7);
  doc.text("Product", colProduct, y + 7);
  doc.text("Qty", colQty, y + 7, { align: "center" });
  doc.text("Unit Price", colUnitPrice, y + 7, { align: "right" });
  doc.text("Total", colTotal, y + 7, { align: "right" });
  y += 14;

  // Table rows
  data.items.forEach((item, index) => {
    if (y > pageHeight - 80) { doc.addPage(); y = 20; }

    const rowH = 14;
    if (index % 2 === 0) {
      doc.setFillColor(...C.white);
    } else {
      doc.setFillColor(...C.bgLight);
    }
    doc.rect(margin, y - 4, contentWidth, rowH, "F");

    // Row bottom border
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH - 4, margin + contentWidth, y + rowH - 4);

    // Row number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(`${index + 1}`, colHash, y + 3);

    // Product name
    const maxProdW = colQty - colProduct - 10;
    const productLines = doc.splitTextToSize(item.product_name, maxProdW);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primary);
    doc.text(productLines[0], colProduct, y + 3);

    // Qty
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.text(item.quantity.toString(), colQty, y + 3, { align: "center" });

    // Unit price
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(fmt(item.unit_price), colUnitPrice, y + 3, { align: "right" });

    // Total
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.accent);
    doc.text(fmt(item.total_price), colTotal, y + 3, { align: "right" });

    y += rowH;
  });

  y += 4;

  // ─── TOTALS ───
  const totalsLabelX = margin + contentWidth * 0.55;
  const totalsValueX = colTotal;

  const drawTotalRow = (label: string, value: string, bold = false, color: RGB = C.text) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 8.5);
    doc.setTextColor(...C.textMuted);
    doc.text(label, totalsLabelX, y, { align: "right" });
    doc.setTextColor(...color);
    doc.text(value, totalsValueX, y, { align: "right" });
    y += bold ? 10 : 7;
  };

  drawTotalRow("Subtotal", fmt(data.subtotal));
  if (data.tax) drawTotalRow("Tax (5%)", fmt(data.tax));
  drawTotalRow("Shipping", fmt(data.shipping_cost));
  if (data.discount > 0) drawTotalRow("Discount", `-${fmt(data.discount)}`, false, C.success);

  // Grand total line
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX - 30, y - 2, totalsValueX, y - 2);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.primary);
  doc.text("Grand Total", totalsLabelX, y, { align: "right" });
  doc.setTextColor(...C.accent);
  doc.text(fmt(data.total), totalsValueX, y, { align: "right" });
  y += 16;

  // ─── BOTTOM SECTION: Payment, Terms, Signature ───
  if (showPaymentInfo) {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    const col1X = margin;
    const col2X = margin + contentWidth * 0.35;
    const col3X = margin + contentWidth * 0.7;

    // Payment Method
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text("Payment Method", col1X, y);
    y += 5;
    // Payment method logo + name
    let pmTextX = col1X;
    if (paymentLogoData) {
      try {
        doc.addImage(paymentLogoData, "PNG", col1X, y - 3.5, 8, 8);
        pmTextX = col1X + 10;
      } catch { /* ignore */ }
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text(data.payment_method || "N/A", pmTextX, y);

    // Terms
    const termsY = y - 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text("Terms & Conditions", col2X, termsY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text("• Payment due within 7 days", col2X, termsY + 5);
    doc.text("• Returns accepted within 3 days", col2X, termsY + 9);
    doc.text("• Damaged items must be reported within 24hrs", col2X, termsY + 13);

    // Authorized Signature
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text("Authorized Signature", col3X, termsY);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(col3X, termsY + 12, col3X + 45, termsY + 12);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...C.textMuted);
    doc.text(`${storeName} Authority`, col3X + 5, termsY + 17);

    y += 20;
  }

  // ─── FOOTER ───
  const footerY = Math.max(y + 8, pageHeight - 18);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, footerY - 4, contentWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  if (footerText) doc.text(footerText, pageWidth / 2, footerY + 3, { align: "center", maxWidth: contentWidth - 10 });
}

export async function generateInvoicePDF(data: InvoiceData, config?: InvoiceTemplateConfig): Promise<void> {
  const pmLogoUrl = getPaymentLogoUrl(data.payment_method, data.payment_method_logo || undefined);
  const [logoData, paymentLogoData] = await Promise.all([
    loadImageAsBase64(config?.store_logo_url || ""),
    loadImageAsBase64(pmLogoUrl),
  ]);
  const doc = new jsPDF();
  generateSingleInvoice(doc, data, config, 0, logoData, paymentLogoData);
  doc.save(`Invoice-${data.order_number}.pdf`);
}

export async function generateBulkInvoicePDF(invoices: InvoiceData[], config?: InvoiceTemplateConfig): Promise<void> {
  if (invoices.length === 0) return;
  const logoData = await loadImageAsBase64(config?.store_logo_url || "");
  // Resolve all payment logo URLs (DB or fallback)
  const resolvedLogos = invoices.map(i => getPaymentLogoUrl(i.payment_method, i.payment_method_logo || undefined));
  const uniqueLogos = [...new Set(resolvedLogos.filter(Boolean))];
  const logoMap = new Map<string, string | null>();
  await Promise.all(uniqueLogos.map(async (url) => {
    logoMap.set(url, await loadImageAsBase64(url));
  }));
  const doc = new jsPDF();
  invoices.forEach((data, index) => {
    if (index > 0) doc.addPage();
    const pmUrl = getPaymentLogoUrl(data.payment_method, data.payment_method_logo || undefined);
    const pmLogo = pmUrl ? logoMap.get(pmUrl) : null;
    generateSingleInvoice(doc, data, config, 0, logoData, pmLogo);
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
  items: Array<{ product_name: string; quantity: number; unit_price: number; total_price: number }>;
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
