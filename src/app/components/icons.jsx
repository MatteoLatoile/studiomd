/* =====================================================
   FLECHE — droite élégante et fluide
   ===================================================== */
export function IconArrowRight(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/* =====================================================
   CALENDRIER — simple et lisible
   ===================================================== */
export function IconCalendar(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="8.5" cy="14.5" r=".8" />
      <circle cx="12" cy="14.5" r=".8" />
      <circle cx="15.5" cy="14.5" r=".8" />
    </svg>
  );
}

/* =====================================================
   CAMERA — design cinéma moderne et lisible
   ===================================================== */
export function IconCamera(props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Boîtier principal */}
      <rect x="5" y="12" width="30" height="22" rx="3.2" />
      {/* Objectif */}
      <circle cx="20" cy="23" r="6" />
      <circle cx="20" cy="23" r="3" stroke="currentColor" opacity=".6" />
      {/* Objectif lumineux */}
      <circle cx="20" cy="23" r="1.2" fill="currentColor" />
      {/* Viseur droit */}
      <path d="M34 17l8-4v22l-8-4V17z" />
      {/* Poignée */}
      <path d="M9 10h10l2 4H9z" />
      {/* Voyant / flash */}
      <circle cx="12" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

/* =====================================================
   CLAP DE TOURNAGE — stylisé et équilibré
   ===================================================== */
export function IconClap(props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Partie basse (ardoise) */}
      <rect x="5" y="16" width="38" height="24" rx="3" />
      {/* Partie haute (clap articulé) */}
      <path d="M5 16l6-10h31l-6 10z" />
      {/* Rayures caractéristiques */}
      <path d="M10 6l6 10M18 6l6 10M26 6l6 10M34 6l6 10" />
      {/* Charnière brillante */}
      <circle cx="8" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}

/* =====================================================
   MEGAPHONE — volume et diffusion stylisée
   ===================================================== */
export function IconMegaphone(props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Corps principal */}
      <path d="M6 20v8l22 8V12L6 20z" />
      {/* Poignée */}
      <path d="M28 25v9a4 4 0 0 0 4 4h3" />
      {/* Ondes sonores extérieures */}
      <path d="M38 19c3 2 3 6 0 8M42 17c5 3 5 9 0 12" />
      {/* Éclat accent visuel */}
      <path d="M10 18l3-1M11 28l3 1" strokeOpacity=".6" />
    </svg>
  );
}
