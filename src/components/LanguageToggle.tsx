import { useLanguage } from "@/contexts/LanguageContext";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { enabledLanguages, isLoading } = useLanguageSettings();

  // Hide toggle if only 1 or 0 languages enabled
  if (!isLoading && enabledLanguages.length <= 1) return null;

  const currentLang = enabledLanguages.find((l) => l.language_code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Languages className="h-5 w-5" />
          <span className="absolute -bottom-1 -right-1 text-[10px] font-bold uppercase bg-primary text-primary-foreground rounded px-1">
            {language}
          </span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {enabledLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.language_code}
            onClick={() => setLanguage(lang.language_code)}
            className={language === lang.language_code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag_emoji}</span>
            {lang.native_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
