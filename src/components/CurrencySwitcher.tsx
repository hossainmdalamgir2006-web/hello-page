import { useCurrency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function CurrencySwitcher() {
  const { selectedCurrency, currencies, setSelectedCode } = useCurrency();

  if (currencies.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-sm font-semibold" title="Currency">
          {selectedCurrency?.symbol || "৳"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setSelectedCode(c.code)}
            className="flex items-center justify-between gap-2"
          >
            <span>
              {c.symbol} {c.code}
            </span>
            {c.code === selectedCurrency?.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
