"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "consent";

function readConsent() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}
function writeConsent(value) {
  const str = encodeURIComponent(JSON.stringify(value));
  // 6 mois, SameSite Lax
  document.cookie = `${COOKIE_NAME}=${str}; Max-Age=${
    60 * 60 * 24 * 180
  }; Path=/; SameSite=Lax`;
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    essentials: true,
    functional: false,
    analytics: false,
    ads: false,
  });

  // Ouvrir via un lien/footer
  useEffect(() => {
    window.__openCookiePrefs = () => {
      setOpen(true);
      setPrefsOpen(true);
    };
    const saved = readConsent();
    if (!saved) setOpen(true);
  }, []);

  function acceptAll() {
    const v = {
      essentials: true,
      functional: true,
      analytics: true,
      ads: true,
      date: new Date().toISOString(),
    };
    writeConsent(v);
    closeAll();
  }
  function refuseAll() {
    const v = {
      essentials: true,
      functional: false,
      analytics: false,
      ads: false,
      date: new Date().toISOString(),
    };
    writeConsent(v);
    closeAll();
  }
  function savePrefs() {
    const v = { ...prefs, essentials: true, date: new Date().toISOString() };
    writeConsent(v);
    closeAll();
  }
  function closeAll() {
    setPrefsOpen(false);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <>
      {/* BANNIÈRE — style cartes (bg translucide + ring + shadow) */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-4xl m-4 rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm p-4 sm:p-5">
          <div className="sm:flex sm:items-start sm:gap-5">
            <div className="hidden sm:block h-10 w-10 shrink-0 rounded-xl bg-[#FFEB83] ring-1 ring-black/10" />
            <div className="flex-1">
              <h3 className="text-noir font-semibold">
                Cookies & confidentialité
              </h3>
              <p className="text-sm text-[#343434] mt-1">
                On utilise des cookies pour le fonctionnement du site (toujours
                actifs) et, avec ton accord, pour améliorer l’expérience
                (fonctionnels), mesurer l’audience (analytics) et personnaliser
                la pub.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={refuseAll}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-noir shadow ring-1 ring-black/10 bg-white hover:opacity-90"
                >
                  Tout refuser
                </button>
                <button
                  onClick={() => setPrefsOpen(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-noir shadow ring-1 ring-black/10 bg-white hover:opacity-90"
                >
                  Personnaliser
                </button>
                <button
                  onClick={acceptAll}
                  className="ml-auto px-5 py-2 rounded-xl text-sm font-semibold text-noir shadow hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PRÉFÉRENCES — même style que tes cartes (bg translucide, ring, gradient CTA) */}
      {prefsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm"
          >
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-bold text-noir">
                Préférences cookies
              </h3>
              <p className="text-sm text-[#6B6B6B] mt-1">
                Choisis ce que tu acceptes. Les cookies essentiels sont
                nécessaires au bon fonctionnement.
              </p>

              <div className="mt-4 space-y-3">
                <CardRow
                  title="Essentiels"
                  desc="Sécurité, session, panier. Toujours actifs."
                  checked
                  disabled
                />
                <CardRow
                  title="Fonctionnels"
                  desc="Améliorations d’expérience (ex : sauvegarde de filtres)."
                  checked={prefs.functional}
                  onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
                />
                <CardRow
                  title="Analytics"
                  desc="Mesure d’audience anonyme (ex : GA4)."
                  checked={prefs.analytics}
                  onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                />
                <CardRow
                  title="Publicité"
                  desc="Personnalisation et retargeting."
                  checked={prefs.ads}
                  onChange={(v) => setPrefs((p) => ({ ...p, ads: v }))}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={refuseAll}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-noir shadow ring-1 ring-black/10 bg-white hover:opacity-90"
                >
                  Tout refuser
                </button>
                <button
                  onClick={savePrefs}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-noir shadow hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setPrefsOpen(false)}
                  className="ml-auto px-3 py-2 text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ——— Sous-compo ligne de préférences ——— */
function CardRow({ title, desc, checked, onChange, disabled }) {
  return (
    <label
      className={[
        "flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-black/10",
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FFB700] focus:ring-[#FFB700]"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <div>
        <p className="text-sm font-semibold text-noir">{title}</p>
        <p className="text-xs text-[#6B6B6B] mt-0.5">{desc}</p>
      </div>
    </label>
  );
}
