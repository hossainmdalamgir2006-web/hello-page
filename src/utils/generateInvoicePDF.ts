import { jsPDF } from "jspdf";
import { PAYMENT_METHOD_DEFINITIONS } from "@/data/paymentMethodDefinitions";
import { supabase } from "@/integrations/supabase/client";

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

// Get payment logo URL: DB logo > definition default_logo > empty
function getPaymentLogoUrl(paymentMethod: string, dbLogoUrl?: string): string {
  if (dbLogoUrl) return dbLogoUrl;
  const code = paymentMethod?.toLowerCase().replace(/\s+/g, '_') || '';
  const def = PAYMENT_METHOD_DEFINITIONS.find(
    d => d.method_id === code || d.name.toLowerCase() === code
  );
  return def?.default_logo || "";
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    // Make relative URLs absolute
    const absoluteUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
    const response = await fetch(absoluteUrl);
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
  const footerText = cfg?.footer_text ?? "Thank you for your business!";
  const showPaymentInfo = cfg?.show_payment_info ?? true;
  const showStoreInfo = cfg?.show_store_info ?? true;

  // ─── OUTER CARD BORDER ───
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, startY + 8, pageWidth - 20, pageHeight - 16, 4, 4);

  let y = startY + 18;

  // ─── HEADER SECTION ───
  // Logo - image or fallback circle (bigger: 20mm)
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin + 2, y - 4, 20, 20);
    } catch {
      doc.setFillColor(...C.primary);
      doc.circle(margin + 12, y + 6, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...C.white);
      doc.text(storeName.charAt(0).toUpperCase(), margin + 12, y + 10, { align: "center" });
    }
  } else {
    doc.setFillColor(...C.primary);
    doc.circle(margin + 12, y + 6, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C.white);
    doc.text(storeName.charAt(0).toUpperCase(), margin + 12, y + 10, { align: "center" });
  }

  // Store name (bigger: 20pt)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.primary);
  doc.text(storeName, margin + 26, y + 5);

  // INVOICE title on right
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...C.primary);
  doc.text("INVOICE", rightX, y + 5, { align: "right" });

  // Accent line under INVOICE title
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1.2);
  const invTitleW = 42;
  doc.line(rightX - invTitleW, y + 9, rightX, y + 9);

  y += 22;

  // Store address info
  if (showStoreInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    if (storeAddress) { doc.text(storeAddress, margin, y); y += 4; }
    if (storeEmail) { doc.text(storeEmail, margin, y); y += 4; }
    if (storePhone) { doc.text(storePhone, margin, y); y += 4; }
  }

  // Invoice meta on right
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

  // Payment status badge
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
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  const badgeW = Math.max(22, doc.getTextWidth(statusLabel) + 8);
  const badgeX = metaValueX;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(badgeX - badgeW, metaY - 2, badgeW, 8, 3, 3, "F");
  doc.setTextColor(...C.white);
  doc.text(statusLabel, badgeX - badgeW / 2, metaY + 3.5, { align: "center" });

  y = Math.max(y, metaY) + 12;

  // ─── BILL TO / SHIP TO ───
  const halfW = contentWidth / 2;
  const billX = margin + 10;
  const shipX = margin + halfW + 10;

  const addressLines = doc.splitTextToSize(data.shipping_address || "N/A", halfW - 18);
  let contactLines = 0;
  if (data.customer_phone && data.customer_phone.trim()) contactLines++;
  if (data.customer_email && data.customer_email.trim()) contactLines++;
  const boxContentH = 10 + 8 + 6 + (addressLines.length * 4.5) + (contactLines * 4.5) + 6;
  const boxH = Math.max(42, boxContentH);

  doc.setFillColor(...C.bgLight);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3, "F");
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3);

  // Left accent borders
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1.5);
  doc.line(margin + 2, y + 6, margin + 2, y + boxH - 6);
  doc.line(margin + halfW + 2, y + 6, margin + halfW + 2, y + boxH - 6);

  // Divider
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin + halfW, y + 5, margin + halfW, y + boxH - 5);

  let secY = y + 10;

  // Section labels in accent color
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.accent);
  doc.text("BILL TO", billX, secY);
  doc.text("SHIP TO", shipX, secY);
  secY += 8;

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

  y += boxH + 10;

  // ─── ITEMS TABLE ───
  const colHash = margin + 5;
  const colProduct = margin + 16;
  const colQty = margin + contentWidth * 0.55;
  const colUnitPrice = margin + contentWidth * 0.72;
  const colTotal = margin + contentWidth - 5;

  // Table header (taller: 13)
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text("#", colHash, y + 8.5);
  doc.text("Product", colProduct, y + 8.5);
  doc.text("Qty", colQty, y + 8.5, { align: "center" });
  doc.text("Unit Price", colUnitPrice, y + 8.5, { align: "right" });
  doc.text("Total", colTotal, y + 8.5, { align: "right" });
  y += 16;

  // Table rows (taller: 16)
  data.items.forEach((item, index) => {
    if (y > pageHeight - 80) { doc.addPage(); y = 20; }

    const rowH = 16;
    if (index % 2 === 0) {
      doc.setFillColor(...C.white);
    } else {
      doc.setFillColor(245, 247, 250);
    }
    doc.rect(margin, y - 5, contentWidth, rowH, "F");

    // Row bottom border
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH - 5, margin + contentWidth, y + rowH - 5);

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

  y += 6;

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

  // Grand Total with accent background bar
  const grandTotalBarW = totalsValueX - (totalsLabelX - 30);
  doc.setFillColor(...C.accent);
  doc.roundedRect(totalsLabelX - 30, y - 5, grandTotalBarW, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text("Grand Total", totalsLabelX, y + 3, { align: "right" });
  doc.text(fmt(data.total), totalsValueX, y + 3, { align: "right" });
  y += 18;

  // ─── BOTTOM SECTION: Payment, Terms, Signature ───
  // Calculate bottom section position — anchor near footer
  const footerAreaY = pageHeight - 32;
  const bottomSectionH = 28;
  const bottomY = showPaymentInfo ? Math.max(y, footerAreaY - bottomSectionH) : y;

  if (showPaymentInfo) {
    // Accent separator line
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.5);
    doc.line(margin, bottomY, margin + contentWidth, bottomY);
    let bsY = bottomY + 8;

    const col1X = margin;
    const col2X = margin + contentWidth * 0.35;
    const col3X = margin + contentWidth * 0.7;

    // Payment Method
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text("Payment Method", col1X, bsY);
    bsY += 5;
    let pmTextX = col1X;
    if (paymentLogoData) {
      try {
        doc.addImage(paymentLogoData, "PNG", col1X, bsY - 3.5, 8, 8);
        pmTextX = col1X + 10;
      } catch { /* ignore */ }
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text(data.payment_method || "N/A", pmTextX, bsY);

    // Terms
    const termsY = bsY - 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text("Terms & Conditions", col2X, termsY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text("• Returns accepted within 3 days", col2X, termsY + 5);
    doc.text("• Damaged items must be reported within 24hrs", col2X, termsY + 9);

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
  }

  // ─── FOOTER ───
  const footerY = pageHeight - 18;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, footerY - 4, contentWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  if (footerText) doc.text(footerText, pageWidth / 2, footerY + 3, { align: "center", maxWidth: contentWidth - 10 });
}

// Fetch store info from store_settings DB and merge into config as fallback
async function enrichConfigWithStoreSettings(config?: InvoiceTemplateConfig): Promise<InvoiceTemplateConfig | undefined> {
  try {
    const { data } = await supabase
      .from("store_settings" as any)
      .select("key, setting_value")
      .in("key", ["STORE_EMAIL", "STORE_PHONE", "STORE_ADDRESS"]);
    if (!data || data.length === 0) return config;
    const map: Record<string, string> = {};
    (data as any[]).forEach((r: any) => { if (r.setting_value) map[r.key] = r.setting_value; });
    const merged: InvoiceTemplateConfig = {
      ...(config || {}),
      store_address: config?.store_address || map["STORE_ADDRESS"] || "",
      store_email: config?.store_email || map["STORE_EMAIL"] || "",
      store_phone: config?.store_phone || map["STORE_PHONE"] || "",
    };
    return merged;
  } catch {
    return config;
  }
}

export async function generateInvoicePDF(data: InvoiceData, config?: InvoiceTemplateConfig): Promise<void> {
  const enrichedConfig = await enrichConfigWithStoreSettings(config);
  const pmLogoUrl = getPaymentLogoUrl(data.payment_method, data.payment_method_logo || undefined);
  const [logoData, paymentLogoData] = await Promise.all([
    loadImageAsBase64(enrichedConfig?.store_logo_url || ""),
    loadImageAsBase64(pmLogoUrl),
  ]);
  const doc = new jsPDF();
  generateSingleInvoice(doc, data, enrichedConfig, 0, logoData, paymentLogoData);
  doc.save(`Invoice-${data.order_number}.pdf`);
}

export async function generateBulkInvoicePDF(invoices: InvoiceData[], config?: InvoiceTemplateConfig): Promise<void> {
  if (invoices.length === 0) return;
  const enrichedConfig = await enrichConfigWithStoreSettings(config);
  const logoData = await loadImageAsBase64(enrichedConfig?.store_logo_url || "");
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
    generateSingleInvoice(doc, data, enrichedConfig, 0, logoData, pmLogo);
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
