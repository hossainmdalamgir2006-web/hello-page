// Standalone currency formatter — import anywhere, no hook needed.
// Reads selected currency from localStorage + cached settings.

import { supabase } from "@/integrations/supabase/client";

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate_to_bdt: number;
}

let _currencies: CurrencyInfo[] = [];
let _loaded = false;

async function ensureLoaded() {
  if (_loaded) return;
  try {
    const { data } = await supabase
      .from("currency_settings" as any)
      .select("code, symbol, rate_to_bdt, is_enabled")
      .eq("is_enabled", true)
      .order("sort_order");
    if (data) _currencies = data as any[];
    _loaded = true;
  } catch {
    _loaded = true;
  }
}

// Pre-load on import
ensureLoaded();

/** Refresh cached currencies (call after admin changes) */
export function refreshCurrencies() {
  _loaded = false;
  ensureLoaded();
}

function getSelectedCode(): string {
  try {
    return localStorage.getItem("selected_currency") || "BDT";
  } catch {
    return "BDT";
  }
}

function getSelectedCurrency(): CurrencyInfo | null {
  const code = getSelectedCode();
  return _currencies.find((c) => c.code === code) || _currencies[0] || null;
}

/**
 * Format a BDT amount in the user's selected currency.
 * Works outside React components — just import and call.
 */
export function formatPrice(amountInBDT: number): string {
  const cur = getSelectedCurrency();
  if (!cur || cur.code === "BDT") {
    return `৳${amountInBDT.toLocaleString("en-BD")}`;
  }
  const converted = amountInBDT / cur.rate_to_bdt;
  return `${cur.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export { getSelectedCode as getSelectedCurrencyCode };
