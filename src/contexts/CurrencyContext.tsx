import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useCurrencySettings, CurrencySetting } from "@/hooks/useCurrencySettings";

interface CurrencyContextType {
  selectedCurrency: CurrencySetting | null;
  currencies: CurrencySetting[];
  setSelectedCode: (code: string) => void;
  formatPrice: (amountInBDT: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  selectedCurrency: null,
  currencies: [],
  setSelectedCode: () => {},
  formatPrice: (a) => `৳${a.toLocaleString()}`,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { enabledCurrencies, defaultCurrency } = useCurrencySettings();
  const [selectedCode, setSelectedCodeState] = useState<string>(
    () => localStorage.getItem("selected_currency") || "BDT"
  );

  const setSelectedCode = useCallback((code: string) => {
    setSelectedCodeState(code);
    localStorage.setItem("selected_currency", code);
  }, []);

  // If stored currency is no longer enabled, reset to default
  useEffect(() => {
    if (enabledCurrencies.length > 0 && !enabledCurrencies.find((c) => c.code === selectedCode)) {
      const def = defaultCurrency?.code || enabledCurrencies[0]?.code || "BDT";
      setSelectedCode(def);
    }
  }, [enabledCurrencies, selectedCode, defaultCurrency, setSelectedCode]);

  const selectedCurrency = enabledCurrencies.find((c) => c.code === selectedCode) || defaultCurrency || null;

  const formatPrice = useCallback(
    (amountInBDT: number) => {
      if (!selectedCurrency || selectedCurrency.code === "BDT") {
        return `৳${amountInBDT.toLocaleString("en-BD")}`;
      }
      const converted = amountInBDT / selectedCurrency.rate_to_bdt;
      return `${selectedCurrency.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [selectedCurrency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        currencies: enabledCurrencies,
        setSelectedCode,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
