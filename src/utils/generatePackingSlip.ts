import jsPDF from 'jspdf';
import { supabase } from "@/integrations/supabase/client";

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
  store_email?: string;
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [15, 23, 42];
}

function buildColors(accentHex?: string) {
  const accent: RGB = accentHex ? hexToRgb(accentHex) : [37, 99, 235];
  return {
    primary: [15, 23, 42] as RGB,
    accent,
    text: [30, 41, 59] as RGB,
    textMuted: [100, 116, 139] as RGB,
    border: [226, 232, 240] as RGB,
    borderLight: [241, 245, 249] as RGB,
    bgLight: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
    accentBg: [239, 246, 255] as RGB,
  };
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

async function enrichConfigWithStoreSettings(config?: PackingSlipTemplateConfig): Promise<PackingSlipTemplateConfig | undefined> {
  try {
    const { data } = await supabase
      .from("store_settings" as any)
      .select("key, setting_value")
      .in("key", ["STORE_EMAIL", "STORE_PHONE", "STORE_ADDRESS"]);
    if (!data || data.length === 0) return config;
    const map: Record<string, string> = {};
    (data as any[]).forEach((r: any) => { if (r.setting_value) map[r.key] = r.setting_value; });
    return {
      ...(config || {}),
      store_address: config?.store_address || map["STORE_ADDRESS"] || "",
      store_email: config?.store_email || map["STORE_EMAIL"] || "",
      store_phone: config?.store_phone || map["STORE_PHONE"] || "",
    };
  } catch {
    return config;
  }
}

export async function generatePackingSlip(data: PackingSlipData, config?: PackingSlipTemplateConfig) {
  const enrichedConfig = await enrichConfigWithStoreSettings(config);
  const logoData = await loadImageAsBase64(enrichedConfig?.store_logo_url || "");

  const C = buildColors(enrichedConfig?.accent_color);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const storeName = enrichedConfig?.store_name || data.store_name || 'YOUR STORE';
  const storeAddress = enrichedConfig?.store_address || '';
  const storePhone = enrichedConfig?.store_phone || '';
  const storeEmail = enrichedConfig?.store_email || '';
  const showNotes = enrichedConfig?.show_notes ?? true;
  const showSignature = enrichedConfig?.show_signature ?? true;
  const showStoreInfo = enrichedConfig?.show_store_info ?? true;
  const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0);

  // ─── OUTER CARD BORDER ───
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, 8, pageWidth - 20, pageHeight - 16, 4, 4);

  let y = 18;

  // ─── HEADER ───
  // Logo (bigger: 20mm)
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

  // PACKING SLIP title
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.primary);
  doc.text("PACKING SLIP", rightX, y + 5, { align: "right" });

  // Accent line under title
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1.2);
  const titleW = 56;
  doc.line(rightX - titleW, y + 9, rightX, y + 9);

  y += 22;

  // Store info
  if (showStoreInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    if (storeAddress) { doc.text(storeAddress, margin, y); y += 4; }
    if (storeEmail) { doc.text(storeEmail, margin, y); y += 4; }
    if (storePhone) { doc.text(storePhone, margin, y); y += 4; }
  }

  // Meta info on right
  let metaY = y - 8;
  const metaLabelX = rightX - 50;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text("Order No:", metaLabelX, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.accent);
  doc.text(data.order_number, rightX, metaY, { align: "right" });

  metaY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textMuted);
  doc.text("Date:", metaLabelX, metaY);
  doc.setTextColor(...C.text);
  doc.text(new Date(data.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), rightX, metaY, { align: "right" });

  metaY += 6;
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.text("Total Items:", metaLabelX, metaY);
  const badgeText = `${totalQty} pcs`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const badgeW = doc.getTextWidth(badgeText) + 6;
  doc.setFillColor(...C.accentBg);
  doc.roundedRect(rightX - badgeW, metaY - 3.5, badgeW, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(...C.accent);
  doc.text(badgeText, rightX - badgeW / 2, metaY + 0.5, { align: "center" });

  y = Math.max(y, metaY) + 12;

  // ─── SHIP TO ───
  const addressLines = doc.splitTextToSize(data.shipping_address || "N/A", contentWidth - 24);
  let shipBoxContentH = 10 + 8 + 6 + (addressLines.length * 4.5) + (data.customer_phone ? 4.5 : 0) + 6;
  const shipBoxH = Math.max(38, shipBoxContentH);

  doc.setFillColor(...C.bgLight);
  doc.roundedRect(margin, y, contentWidth, shipBoxH, 3, 3, "F");
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, shipBoxH, 3, 3);

  // Left accent border
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1.5);
  doc.line(margin + 2, y + 6, margin + 2, y + shipBoxH - 6);

  let shipY = y + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.accent);
  doc.text("SHIP TO", margin + 10, shipY);
  shipY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.primary);
  doc.text(data.customer_name, margin + 10, shipY);
  shipY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  addressLines.forEach((line: string) => { doc.text(line, margin + 10, shipY); shipY += 4.5; });
  if (data.customer_phone) { doc.text(data.customer_phone, margin + 10, shipY); }

  y += shipBoxH + 10;

  // ─── ITEMS TABLE ───
  const colHash = margin + 8;
  const colItem = margin + 20;
  const colSku = margin + contentWidth * 0.45;
  const colLoc = margin + contentWidth * 0.6;
  const colQty = margin + contentWidth * 0.76;
  const colCheck = margin + contentWidth - 12;

  // Table header (taller: 13)
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text("#", colHash, y + 8.5);
  doc.text("Item", colItem, y + 8.5);
  doc.text("SKU", colSku, y + 8.5);
  doc.text("Location", colLoc, y + 8.5);
  doc.text("Qty", colQty, y + 8.5, { align: "center" });
  doc.text("\u2713 Packed", colCheck, y + 8.5, { align: "center" });
  y += 16;

  // Table rows (taller: 16)
  data.items.forEach((item, index) => {
    if (y > pageHeight - 70) { doc.addPage(); y = 20; }

    const rowH = 16;

    if (index % 2 !== 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 5, contentWidth, rowH, "F");
    }

    // Row bottom border
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH - 5, margin + contentWidth, y + rowH - 5);

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

  // ─── SUMMARY BAR ───
  const summaryBarW = contentWidth;
  doc.setFillColor(...C.accent);
  doc.roundedRect(margin, y - 4, summaryBarW, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text(`Total SKUs: ${data.items.length}`, margin + 8, y + 3);
  doc.text(`Total Pieces: ${totalQty}`, margin + 60, y + 3);
  y += 16;

  // ─── PACKING NOTES & SIGNATURE ───
  if (showNotes) {
    // Accent separator
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.5);
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
