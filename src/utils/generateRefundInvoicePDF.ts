import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHOD_DEFINITIONS } from "@/data/paymentMethodDefinitions";

interface RefundInvoiceData {
  order_number: string;
  refund_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  original_total: number;
  refund_amount: number;
  refund_reason: string;
  refund_status: string;
  payment_method: string;
  store_name?: string;
}

type RGB = [number, number, number];

const C = {
  primary: [15, 23, 42] as RGB,
  accent: [37, 99, 235] as RGB,
  text: [30, 41, 59] as RGB,
  textMuted: [100, 116, 139] as RGB,
  border: [226, 232, 240] as RGB,
  borderLight: [241, 245, 249] as RGB,
  bgLight: [248, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
  danger: [220, 38, 38] as RGB,
  dangerLight: [254, 226, 226] as RGB,
  success: [22, 163, 74] as RGB,
};

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

async function getStoreConfig() {
  try {
    const [settingsRes, pageRes, footerRes, templateRes] = await Promise.all([
      supabase.from("store_settings").select("key, setting_value")
        .in("key", ["STORE_EMAIL", "STORE_PHONE", "STORE_ADDRESS"]),
      supabase.from("page_contents").select("content").eq("page_slug", "header").maybeSingle(),
      supabase.from("page_contents").select("content").eq("page_slug", "footer_settings").maybeSingle(),
      supabase.from("document_templates").select("config").eq("type", "invoice").eq("is_active", true).maybeSingle(),
    ]);

    const map: Record<string, string> = {};
    settingsRes.data?.forEach((r: any) => { if (r.setting_value) map[r.key] = r.setting_value; });
    const hdr = pageRes.data?.content as any;
    const footer = footerRes.data?.content as any;
    const tplCfg = templateRes.data?.config as any;

    return {
      store_name: hdr?.store_name || tplCfg?.store_name || footer?.store_name || "Your Store",
      store_logo_url: hdr?.store_logo || tplCfg?.store_logo_url || footer?.store_logo || "",
      store_address: tplCfg?.store_address || footer?.store_address || map["STORE_ADDRESS"] || "",
      store_email: tplCfg?.store_email || footer?.store_email || map["STORE_EMAIL"] || "",
      store_phone: tplCfg?.store_phone || footer?.store_phone || map["STORE_PHONE"] || "",
    };
  } catch {
    return { store_name: "Your Store", store_logo_url: "", store_address: "", store_email: "", store_phone: "" };
  }
}

const fmt = (n: number) => {
  const formatted = Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `BDT ${formatted}`;
};

export async function generateRefundInvoicePDF(data: RefundInvoiceData): Promise<void> {
  const store = await getStoreConfig();
  const storeName = data.store_name || store.store_name;

  // Load images in parallel
  const pmLogoUrl = getPaymentLogoUrl(data.payment_method);
  const [logoData, pmLogoData] = await Promise.all([
    loadImageAsBase64(store.store_logo_url),
    loadImageAsBase64(pmLogoUrl),
  ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const rightX = pageWidth - margin;

  // ─── OUTER CARD BORDER ───
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, 8, pageWidth - 20, pageHeight - 16, 4, 4);

  let y = 18;

  // ─── HEADER ───
  let logoDrawn = false;
  if (logoData) {
    try { doc.addImage(logoData, "PNG", margin + 2, y - 4, 20, 20); logoDrawn = true; } catch { /* fallback */ }
  }
  if (!logoDrawn) {
    doc.setFillColor(...C.primary);
    doc.circle(margin + 12, y + 6, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C.white);
    doc.text(storeName.charAt(0).toUpperCase(), margin + 12, y + 10, { align: "center" });
  }

  // Store name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.primary);
  doc.text(storeName, margin + 26, y + 5);

  // CREDIT NOTE title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.danger);
  doc.text("CREDIT NOTE", rightX, y + 5, { align: "right" });

  // Accent line under title
  doc.setDrawColor(...C.danger);
  doc.setLineWidth(1.2);
  const titleW = 55;
  doc.line(rightX - titleW, y + 9, rightX, y + 9);

  y += 22;

  // Store info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  if (store.store_address) { doc.text(store.store_address, margin, y); y += 4; }
  if (store.store_email) { doc.text(store.store_email, margin, y); y += 4; }
  if (store.store_phone) { doc.text(store.store_phone, margin, y); y += 4; }

  // Meta info on right
  let metaY = y - 8;
  const metaLabelX = rightX - 55;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text("Credit Note:", metaLabelX, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.danger);
  doc.text(`CN-${data.order_number}`, rightX, metaY, { align: "right" });

  metaY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text("Date:", metaLabelX, metaY);
  doc.setTextColor(...C.text);
  doc.text(new Date(data.refund_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), rightX, metaY, { align: "right" });

  metaY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text("Original Order:", metaLabelX, metaY);
  doc.setTextColor(...C.text);
  doc.text(`#${data.order_number}`, rightX, metaY, { align: "right" });

  // Refund status badge
  metaY += 7;
  const rStatus = (data.refund_status || "none").toLowerCase();
  const statusLabel = rStatus.toUpperCase();
  const badgeColor: RGB = rStatus === "refunded" ? C.success : rStatus === "none" ? [100, 116, 139] : C.danger;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  const badgeW = Math.max(22, doc.getTextWidth(statusLabel) + 8);
  doc.setFillColor(...badgeColor);
  doc.roundedRect(rightX - badgeW, metaY - 2, badgeW, 8, 3, 3, "F");
  doc.setTextColor(...C.white);
  doc.text(statusLabel, rightX - badgeW / 2, metaY + 3.5, { align: "center" });

  y = Math.max(y, metaY) + 12;

  // ─── REFUND TO / ORIGINAL ORDER ───
  const halfW = contentWidth / 2;
  const billX = margin + 10;
  const orderX = margin + halfW + 10;

  let leftLines = 1;
  if (data.customer_phone) leftLines++;
  if (data.customer_email) leftLines++;
  const boxH = Math.max(44, 18 + leftLines * 6 + 6);

  doc.setFillColor(...C.bgLight);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3, "F");
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3);

  // Left accent borders
  doc.setDrawColor(...C.danger);
  doc.setLineWidth(1.5);
  doc.line(margin + 2, y + 6, margin + 2, y + boxH - 6);
  doc.setDrawColor(...C.accent);
  doc.line(margin + halfW + 2, y + 6, margin + halfW + 2, y + boxH - 6);

  // Divider
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin + halfW, y + 5, margin + halfW, y + boxH - 5);

  let secY = y + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.danger);
  doc.text("REFUND TO", billX, secY);
  doc.setTextColor(...C.accent);
  doc.text("ORIGINAL ORDER", orderX, secY);
  secY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text(data.customer_name, billX, secY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.primary);
  doc.text(`Order #${data.order_number}`, orderX, secY);
  secY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);

  if (data.customer_phone) doc.text(data.customer_phone, billX, secY);
  doc.text(`Total: ${fmt(data.original_total)}`, orderX, secY);
  secY += 5;

  doc.setTextColor(...C.textMuted);
  if (data.customer_email) doc.text(data.customer_email, billX, secY);
  doc.text(`Payment: ${data.payment_method || "N/A"}`, orderX, secY);

  y += boxH + 8;

  // ─── REFUND REASON ───
  doc.setFillColor(...C.dangerLight);
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, "F");
  doc.setDrawColor(...C.danger);
  doc.setLineWidth(1.5);
  doc.line(margin + 2, y + 3, margin + 2, y + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.danger);
  doc.text("REFUND REASON", margin + 8, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  doc.text(data.refund_reason || "N/A", margin + 8, y + 12);

  y += 22;

  // ─── ITEMS TABLE ───
  const colHash = margin + 5;
  const colProduct = margin + 16;
  const colQty = margin + contentWidth * 0.55;
  const colUnitPrice = margin + contentWidth * 0.72;
  const colTotal = margin + contentWidth - 5;

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

  data.items.forEach((item, index) => {
    if (y > pageHeight - 80) { doc.addPage(); y = 20; }

    const rowH = 16;
    doc.setFillColor(...(index % 2 === 0 ? C.white : [245, 247, 250] as RGB));
    doc.rect(margin, y - 5, contentWidth, rowH, "F");

    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH - 5, margin + contentWidth, y + rowH - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(`${index + 1}`, colHash, y + 3);

    const maxProdW = colQty - colProduct - 10;
    const productLines = doc.splitTextToSize(item.product_name, maxProdW);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primary);
    doc.text(productLines[0], colProduct, y + 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.text(item.quantity.toString(), colQty, y + 3, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(fmt(item.unit_price), colUnitPrice, y + 3, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.accent);
    doc.text(fmt(item.total_price), colTotal, y + 3, { align: "right" });

    y += rowH;
  });

  y += 8;

  // ─── TOTALS ───
  const totalsLabelX = margin + contentWidth * 0.55;
  const totalsValueX = colTotal;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textMuted);
  doc.text("Original Total", totalsLabelX, y, { align: "right" });
  doc.setTextColor(...C.text);
  doc.text(fmt(data.original_total), totalsValueX, y, { align: "right" });
  y += 10;

  // Separator
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX - 30, y - 3, totalsValueX, y - 3);
  y += 6;

  // Refund total with danger background bar
  const grandTotalBarW = totalsValueX - (totalsLabelX - 30);
  doc.setFillColor(...C.danger);
  doc.roundedRect(totalsLabelX - 30, y - 5, grandTotalBarW, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text("Refund Amount", totalsLabelX, y + 3, { align: "right" });
  doc.text(`-${fmt(data.refund_amount)}`, totalsValueX, y + 3, { align: "right" });

  y += 22;

  // ─── BOTTOM SECTION: Payment, Terms, Signature (matches Invoice layout) ───
  const footerAreaY = pageHeight - 32;
  const bottomSectionH = 28;
  const bottomY = Math.max(y, footerAreaY - bottomSectionH);

  // Accent separator line (danger theme like invoice uses accent)
  doc.setDrawColor(...C.danger);
  doc.setLineWidth(0.5);
  doc.line(margin, bottomY, margin + contentWidth, bottomY);
  let bsY = bottomY + 8;

  const col1X = margin;
  const col2X = margin + contentWidth * 0.35;
  const col3X = margin + contentWidth * 0.7;

  // Payment Method (matching invoice pattern exactly)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.primary);
  doc.text("Payment Method", col1X, bsY);
  bsY += 5;
  let pmTextX = col1X;
  if (pmLogoData) {
    try {
      doc.addImage(pmLogoData, "PNG", col1X, bsY - 3.5, 8, 8);
      pmTextX = col1X + 10;
    } catch { /* ignore */ }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text(data.payment_method || "N/A", pmTextX, bsY);

  // Terms & Conditions (aligned with invoice pattern)
  const termsY = bsY - 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.primary);
  doc.text("Terms & Conditions", col2X, termsY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.text("• This is a credit note for the refund", col2X, termsY + 5);
  doc.text("• Contact support for any queries", col2X, termsY + 9);

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

  // ─── FOOTER ───
  const footerY = pageHeight - 18;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, footerY - 4, contentWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.text("This credit note was generated for the refund processed against your order.", pageWidth / 2, footerY + 3, { align: "center" });

  doc.save(`Refund-CN-${data.order_number}.pdf`);
}
