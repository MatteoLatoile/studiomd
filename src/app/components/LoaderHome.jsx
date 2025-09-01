"use client";

import { useEffect, useRef } from "react";

/**
 * Splash ultra-réactif :
 * - visible dès SSR (pas de flash noir)
 * - progress mis à jour depuis la Home
 * - animation de sortie CSS (sans attendre Framer)
 */
export default function SplashHome({
  show,
  progress = 0,
  brand = "STUDIO",
  onExited,
}) {
  const ref = useRef(null);
  const barRef = useRef(null);

  // maj progression sans reflow coûteux
  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${Math.round(progress)}%`;
  }, [progress]);

  // sortie animée quand show passe à false
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!show) {
      el.classList.add("splash-hide");
      const onEnd = () => onExited?.();
      el.addEventListener("transitionend", onEnd, { once: true });
      return () => el.removeEventListener("transitionend", onEnd);
    }
  }, [show, onExited]);

  return (
    <div
      ref={ref}
      id="home-splash"
      aria-busy={show ? "true" : "false"}
      style={wrapStyle}
    >
      {/* styles inline (instantanés SSR) */}
      <style
        dangerouslySetInnerHTML={{
          __html: cssText,
        }}
      />

      {/* fond + grille subtile */}
      <div style={bgStyle} />
      <div style={gridStyle} />

      {/* contenu centré */}
      <div style={centerStyle}>
        <div style={brandWrap}>
          <span style={brandText}>{brand}</span>
          <span style={brandDot}>.</span>
        </div>

        {/* anneau */}
        <div style={ringWrap}>
          <svg viewBox="0 0 100 100" style={ringSvg}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFB700" />
                <stop offset="100%" stopColor="#FFEB83" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#g)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="240 260"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#g)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: "240 260",
                strokeDashoffset: 240 - (progress / 100) * 240,
              }}
            />
          </svg>
          <div style={ringBorder} />
        </div>

        {/* barre + pourcentage */}
        <div style={barOuter}>
          <div ref={barRef} style={barInner} />
        </div>
        <div style={percentText}>{Math.round(progress)}%</div>
      </div>

      {/* rideaux de sortie */}
      <div className="splash-top" />
      <div className="splash-bottom" />
    </div>
  );
}

/* ----- Inline styles (rapides) ----- */
const wrapStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  color: "#fff",
  pointerEvents: "auto",
};
const bgStyle = { position: "absolute", inset: 0, background: "#0B0B0B" };
const gridStyle = {
  position: "absolute",
  inset: 0,
  opacity: 0.06,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
  backgroundSize: "24px 24px, 24px 24px",
};
const centerStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
};
const brandWrap = {
  fontWeight: 900,
  letterSpacing: "-0.02em",
  fontSize: "54px",
};
const brandText = { color: "#fff" };
const brandDot = { color: "#FFB700" };
const ringWrap = { position: "relative", width: 88, height: 88, marginTop: 24 };
const ringSvg = {
  position: "absolute",
  inset: 0,
  animation: "spin 1.6s linear infinite",
};
const ringBorder = {
  position: "absolute",
  inset: 0,
  borderRadius: "9999px",
  border: "1px solid rgba(255,255,255,0.15)",
};
const barOuter = {
  width: "72vw",
  maxWidth: 420,
  height: 8,
  borderRadius: 999,
  background: "rgba(255,255,255,0.1)",
  overflow: "hidden",
  marginTop: 18,
};
const barInner = {
  height: "100%",
  width: "0%",
  background: "linear-gradient(90deg,#FFB700,#FFEB83)",
  transition: "width 0.2s linear",
};
const percentText = {
  marginTop: 8,
  fontSize: 14,
  color: "rgba(255,255,255,0.7)",
};

/* ----- CSS (transitions & keyframes) ----- */
const cssText = `
@keyframes spin { to { transform: rotate(360deg); } }
#home-splash .splash-top, #home-splash .splash-bottom {
  position: absolute; left: 0; right: 0; height: 50%; background: #111; pointer-events: none;
  transition: transform .65s cubic-bezier(.16,1,.3,1);
}
#home-splash .splash-top { top: 0; transform: translateY(0); }
#home-splash .splash-bottom { bottom: 0; transform: translateY(0); }
#home-splash.splash-hide { opacity: 1; transition: opacity .35s ease; }
#home-splash.splash-hide .splash-top { transform: translateY(-100%); }
#home-splash.splash-hide .splash-bottom { transform: translateY(100%); }
#home-splash.splash-hide { opacity: 0; }
`;
