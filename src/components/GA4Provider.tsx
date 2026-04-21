import { useEffect } from "react";
import { useGA4Config } from "@/hooks/useGA4Config";

// Declare gtag and fbq for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

export function GA4Provider({ children }: { children: React.ReactNode }) {
  const { measurementId, isEnabled, isLoading, gtmContainerId, gtmEnabled, metaPixelId, metaPixelEnabled, googleSiteVerification } = useGA4Config();

  useEffect(() => {
    if (isLoading) return;

    // Safe remove helper — guards against React reconciliation race
    const safeRemoveById = (id: string) => {
      const el = document.getElementById(id);
      if (el && el.parentNode) {
        try { el.parentNode.removeChild(el); } catch { /* ignore */ }
      }
    };

    // --- GA4 ---
    safeRemoveById('ga4-dynamic-script');
    safeRemoveById('ga4-dynamic-inline');

    if (isEnabled && measurementId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.id = 'ga4-dynamic-script';
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'ga4-dynamic-inline';
      inlineScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `;
      document.head.appendChild(inlineScript);
    }

    // --- GTM ---
    safeRemoveById('gtm-dynamic-script');
    safeRemoveById('gtm-dynamic-noscript');

    if (gtmEnabled && gtmContainerId) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-dynamic-script';
      gtmScript.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmContainerId}');
      `;
      document.head.appendChild(gtmScript);

      // noscript iframe — APPEND to body end (NOT before React root) to avoid
      // breaking React's DOM child-index tracking which causes removeChild crashes.
      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-dynamic-noscript';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.appendChild(noscript);
    }

    // --- Meta Pixel ---
    safeRemoveById('meta-pixel-script');
    safeRemoveById('meta-pixel-sdk');

    if (metaPixelEnabled && metaPixelId) {
      // Initialize fbq stub WITHOUT mutating DOM via insertBefore (which
      // corrupts React's body child-index tracking and causes removeChild crashes).
      // Then inject the SDK as a head-only async script — head is not React-owned.
      const fbInit = document.createElement('script');
      fbInit.id = 'meta-pixel-script';
      fbInit.textContent = `
        (function(){
          if (window.fbq) return;
          var n = window.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
          if (!window._fbq) window._fbq = n;
          n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
          window.fbq('init', '${metaPixelId}');
          window.fbq('track', 'PageView');
        })();
      `;
      document.head.appendChild(fbInit);

      const fbSdk = document.createElement('script');
      fbSdk.id = 'meta-pixel-sdk';
      fbSdk.async = true;
      fbSdk.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(fbSdk);
    }

    // --- Google Search Console Verification ---
    safeRemoveById('gsc-verification-meta');

    if (googleSiteVerification) {
      const meta = document.createElement('meta');
      meta.id = 'gsc-verification-meta';
      meta.name = 'google-site-verification';
      meta.content = googleSiteVerification;
      document.head.appendChild(meta);
    }
  }, [measurementId, isEnabled, isLoading, gtmContainerId, gtmEnabled, metaPixelId, metaPixelEnabled, googleSiteVerification]);

  return <>{children}</>;
}

export function getGA4MeasurementId(): string | null {
  const script = document.getElementById('ga4-dynamic-script') as HTMLScriptElement;
  if (script?.src) {
    const match = script.src.match(/id=(G-[A-Z0-9]+)/);
    return match ? match[1] : null;
  }
  return null;
}
