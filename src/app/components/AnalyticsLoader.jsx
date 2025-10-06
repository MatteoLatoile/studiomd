// app/components/AnalyticsLoader.jsx
"use client";

import Script from "next/script";
import { useEffect } from "react";

function readConsent() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )consent=([^;]*)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

function toConsentMode(consent) {
  const yes = (v) => (v ? "granted" : "denied");
  return {
    ad_storage: yes(consent?.ads),
    analytics_storage: yes(consent?.analytics),
    ad_user_data: yes(consent?.ads),
    ad_personalization: yes(consent?.ads),
  };
}

export default function AnalyticsLoader() {
  // ⚠️ Remplace par tes IDs
  const GA_MEASUREMENT_ID = "G-ZVCM8QBD4F";
  // const GTM_ID = "GTM-XXXXXXX"; // si tu préfères GTM

  useEffect(() => {
    // Default: tout refusé (EU-first)
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });

    const apply = () => {
      const c = readConsent();
      const mode = toConsentMode(c);
      window.gtag("consent", "update", mode);
    };
    apply();

    // Re-applique si le cookie change (simple poll, court et safe)
    const id = setInterval(apply, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* GA4 direct (simple) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
      `}</Script>

      {/*
      // ——— OU via GTM (décommente et configure) ———
      <Script
        src={"https://www.googletagmanager.com/gtm.js?id=" + GTM_ID}
        strategy="afterInteractive"
      />
      <noscript><iframe src={"https://www.googletagmanager.com/ns.html?id=" + GTM_ID} height="0" width="0" style={{display:"none",visibility:"hidden"}}/></noscript>
      */}
    </>
  );
}
