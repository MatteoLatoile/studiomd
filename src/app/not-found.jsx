// app/not-found.jsx
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white grid place-items-center px-4 py-24">
      <div className="w-full max-w-2xl text-center">
        {/* Badge + titre */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="inline-block h-2 w-2 rounded-full bg-[#FFB700]" />
          Erreur 404
        </div>

        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
          Oups… page introuvable
        </h1>
        <p className="mt-2 text-white/70 max-w-xl mx-auto">
          Le lien peut être cassé ou avoir été déplacé. Retourne à l’accueil ou
          explore notre catalogue.
        </p>

        {/* Mini illustration SVG (très léger) */}
        <div className="mx-auto mt-8 mb-6 h-36 w-full max-w-sm">
          <svg viewBox="0 0 420 180" className="w-full h-full">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="#FFC119" />
                <stop offset="100%" stopColor="#FFEB83" />
              </linearGradient>
              <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <rect
              x="0"
              y="120"
              width="420"
              height="40"
              fill="url(#g)"
              opacity="0.12"
              filter="url(#soft)"
            />
            <g
              fill="none"
              stroke="url(#g)"
              strokeWidth="10"
              strokeLinecap="round"
            >
              <path d="M45 140 L85 60 L125 140" opacity="0.9" />
              <path d="M180 140 L180 62" opacity="0.9" />
              <path d="M235 140 L275 60 L315 140" opacity="0.9" />
            </g>
            <text
              x="50%"
              y="170"
              textAnchor="middle"
              fill="#9CA3AF"
              fontFamily="ui-sans-serif,system-ui"
              fontSize="12"
            >
              4 0 4 — hors cadre
            </text>
          </svg>
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-black shadow hover:opacity-95 transition"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Retour à l’accueil
          </a>
          <a
            href="/location"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white/90 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
          >
            Voir le catalogue
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white/90 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
          >
            Contact
          </a>
        </div>

        {/* Barre de recherche (optionnelle, client-side) */}
        <form
          action="/location"
          className="mt-6 max-w-md mx-auto flex items-center gap-2 rounded-xl bg-[#0F1117] ring-1 ring-white/10 px-3 py-2"
        >
          <input
            name="q"
            placeholder="Rechercher un produit…"
            className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
            aria-label="Rechercher"
          />
          <button
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-black"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Chercher
          </button>
        </form>

        {/* Hint */}
        <p className="mt-6 text-xs text-white/40">
          Si le problème persiste, écris-nous via la page&nbsp;
          <a
            href="/contact"
            className="underline decoration-[#FFB700] underline-offset-4"
          >
            contact
          </a>
          .
        </p>
      </div>
    </main>
  );
}
