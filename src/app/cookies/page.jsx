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
  document.cookie = `${COOKIE_NAME}=${str}; Max-Age=${
    60 * 60 * 24 * 180
  }; Path=/; SameSite=Lax`;
}
function clearConsent() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export default function CookiesSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [prefs, setPrefs] = useState({
    essentials: true,
    functional: false,
    analytics: false,
    ads: false,
  });
  const [savedAt, setSavedAt] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const saved = readConsent();
    if (saved) {
      setPrefs({
        essentials: true,
        functional: !!saved.functional,
        analytics: !!saved.analytics,
        ads: !!saved.ads,
      });
      setSavedAt(saved.date || null);
    }
    setLoaded(true);
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
    setPrefs(v);
    setSavedAt(v.date);
    flash("Préférences enregistrées (tout accepté).");
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
    setPrefs(v);
    setSavedAt(v.date);
    flash("Préférences enregistrées (tout refusé).");
  }
  function save() {
    const v = { ...prefs, essentials: true, date: new Date().toISOString() };
    writeConsent(v);
    setSavedAt(v.date);
    flash("Préférences enregistrées.");
  }
  function reset() {
    clearConsent();
    setPrefs({
      essentials: true,
      functional: false,
      analytics: false,
      ads: false,
    });
    setSavedAt(null);
    flash("Consentement réinitialisé. La bannière réapparaîtra.");
    if (typeof window !== "undefined" && window.__openCookiePrefs) {
      window.__openCookiePrefs();
    }
  }
  function flash(msg) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0B0B0F] py-30 px-4 md:px-8 text-white">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Gérer mes cookies</h1>
        <p className="text-sm text-white/60 mt-2">
          Choisis ce que tu acceptes. Les cookies essentiels sont nécessaires au
          bon fonctionnement (sécurité, session, panier).
        </p>
      </header>

      <section className="max-w-4xl mx-auto mt-6 rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refuseAll}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-transparent ring-1 ring-white/15 hover:bg-white/5"
          >
            Tout refuser
          </button>
          <button
            onClick={acceptAll}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-black shadow hover:opacity-90"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Tout accepter
          </button>
          <button
            onClick={save}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-black shadow hover:opacity-90"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Enregistrer
          </button>
          <button
            onClick={reset}
            className="ml-auto px-3 py-2 text-sm underline underline-offset-4"
          >
            Réinitialiser le consentement
          </button>
        </div>

        {statusMsg && <p className="mt-3 text-sm text-white/80">{statusMsg}</p>}

        <div className="mt-5 grid gap-3">
          <PrefRow
            title="Essentiels"
            desc="Sécurité, session, panier. Toujours actifs."
            checked
            disabled
          />
          <PrefRow
            title="Fonctionnels"
            desc="Améliorations d’expérience (par ex. sauvegarde des filtres)."
            checked={prefs.functional}
            onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
          />
          <PrefRow
            title="Analytics"
            desc="Mesure d’audience (ex. GA4, anonymisé)."
            checked={prefs.analytics}
            onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
          />
          <PrefRow
            title="Publicité"
            desc="Personnalisation et retargeting publicitaire."
            checked={prefs.ads}
            onChange={(v) => setPrefs((p) => ({ ...p, ads: v }))}
          />
        </div>

        <div className="mt-6 text-xs text-white/60">
          {loaded ? (
            <p>
              {savedAt ? (
                <>
                  Dernière mise à jour :{" "}
                  <span className="text-white">
                    {new Date(savedAt).toLocaleString("fr-FR")}
                  </span>
                </>
              ) : (
                "Aucun consentement enregistré pour l’instant."
              )}
            </p>
          ) : (
            <p>Chargement…</p>
          )}
          <p className="mt-1">
            Pour en savoir plus, consulte notre{" "}
            <a
              href="/mentions-legales"
              className="underline underline-offset-4"
            >
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

function PrefRow({ title, desc, checked, onChange, disabled }) {
  return (
    <label
      className={[
        "flex items-start gap-3 rounded-xl bg-[#0B0D12] p-3 ring-1 ring-white/10",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#FFB700] focus:ring-[#FFB700]"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/60 mt-0.5">{desc}</p>
      </div>
    </label>
  );
}
