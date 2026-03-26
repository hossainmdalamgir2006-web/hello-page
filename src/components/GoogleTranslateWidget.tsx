import { useEffect } from "react";
import { useLanguageSettings } from "@/hooks/useLanguageSettings";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function GoogleTranslateWidget() {
  const { enabledLanguages, isLoading } = useLanguageSettings();

  useEffect(() => {
    if (isLoading || enabledLanguages.length === 0) return;

    const langCodes = enabledLanguages.map((l) => l.language_code).join(",");

    // Remove old widget if re-rendering
    const existing = document.getElementById("google_translate_element");
    if (existing) existing.innerHTML = "";

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: langCodes,
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Load script if not already loaded
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already loaded, re-init
      window.googleTranslateElementInit();
    }
  }, [enabledLanguages, isLoading]);

  return <div id="google_translate_element" className="notranslate" />;
}
