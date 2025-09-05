"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FiArrowRight, FiCalendar, FiMapPin, FiSearch } from "react-icons/fi";
import ImageHero from "../../../public/imge_hero.png";

const ease = [0.22, 1, 0.36, 1];

// petit composant Skeleton avec shimmer
function Skel({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/15 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-[skel_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <style jsx>{`
        @keyframes skel {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

const Hero = () => {
  const reduce = useReducedMotion();
  const today = new Date().toISOString().split("T")[0];
  const [imgReady, setImgReady] = useState(false);

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-sable"
      aria-busy={!imgReady}
      aria-live="polite"
    >
      <LazyMotion features={domAnimation}>
        {/* BACKGROUND */}
        <m.div
          className="absolute inset-0 will-change-transform transform-gpu"
          initial={reduce ? false : { scale: 1.08, opacity: 0.9 }}
          animate={
            reduce
              ? false
              : imgReady
              ? { scale: 1.02, opacity: 1 }
              : { scale: 1.08, opacity: 0.9 }
          }
          transition={{ duration: 1.1, ease }}
        >
          <Image
            src={ImageHero}
            alt="image hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onLoadingComplete={() => setImgReady(true)}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(80% 60% at 50% 60%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 60%)",
            }}
          />
        </m.div>

        {/* Overlay brut */}
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(360deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.7) 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
          }}
        />

        {/* SKELETON (visible tant que l'image n'est pas prête) */}
        {!imgReady && (
          <div className="absolute inset-0 z-20 px-6 md:px-20 flex items-center">
            <div className="max-w-xl w-full space-y-6">
              <Skel className="h-3 w-48 rounded-full" />
              <Skel className="h-8 w-4/5 rounded-md" />
              <Skel className="h-3 w-2/3 rounded-full" />

              <div className="rounded-2xl p-5 bg-white/10 backdrop-blur-[2px] border border-white/20 space-y-4">
                <Skel className="h-4 w-24 rounded" />
                <div className="grid grid-cols-2 gap-3">
                  <Skel className="h-9 col-span-2 rounded-lg" />
                  <Skel className="h-9 rounded-lg" />
                  <Skel className="h-9 rounded-lg" />
                  <Skel className="h-10 col-span-2 rounded-lg" />
                </div>
                <Skel className="h-3 w-48 rounded-full mx-auto" />
                <Skel className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* CONTENU (crossfade quand l'image est prête) */}
        <m.div
          className="absolute inset-0 flex items-center justify-start px-6 md:px-20 z-10"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={
            reduce
              ? false
              : imgReady
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 }
          }
          transition={{ duration: 0.5, ease, delay: 0.05 }}
          style={{ pointerEvents: imgReady ? "auto" : "none" }}
        >
          <div className="max-w-xl space-y-6 p-8">
            <m.p
              className="text-gray-300 mb-3 text-sm uppercase tracking-wider"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={
                reduce
                  ? false
                  : imgReady
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.5, ease, delay: 0.1 }}
            >
              Location audiovisuelle pro
            </m.p>

            <m.h1
              className="text-4xl md:text-5xl tracking-tighter leading-11 font-bold text-white"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={
                reduce
                  ? false
                  : imgReady
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.55, ease, delay: 0.18 }}
            >
              Loue le bon matériel, <br /> au bon moment.
            </m.h1>

            <m.p
              className="text-gray-300 mt-4 tracking-tight"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={
                reduce
                  ? false
                  : imgReady
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.55, ease, delay: 0.26 }}
            >
              Réservation simple, retrait rapide, packs <br /> optimisés pour le
              tournage.
            </m.p>

            {/* Carte recherche */}
            <m.div
              className="rounded-2xl p-5 bg-[#FFFFFF70] backdrop-blur-sm shadow-md border-2 border-white space-y-4 max-w-md"
              whileHover={reduce ? undefined : { y: -2 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <p className="text-noir font-medium">Matériel</p>

              <div className="grid grid-cols-2 gap-3">
                {/* Recherche référence */}
                <div className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white col-span-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
                  <FiSearch className="text-[#FFB700] text-lg" />
                  <input
                    type="text"
                    placeholder="Rechercher une référence... (caméra, micro..)"
                    className="w-full outline-none text-sm placeholder-gray-400"
                  />
                </div>

                {/* Date début */}
                <label className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
                  <FiCalendar className="text-[#FFB700] text-lg" />
                  <input
                    type="date"
                    min={today}
                    className="w-full text-sm outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </label>

                {/* Date fin */}
                <label className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
                  <FiCalendar className="text-[#FFB700] text-lg" />
                  <input
                    type="date"
                    min={today}
                    className="w-full text-sm outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </label>

                {/* Ville (disabled + tooltip) */}
                <div className="relative group flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-gray-50 cursor-not-allowed">
                  <FiMapPin className="text-[#FFB700] text-lg opacity-70" />
                  <input
                    type="text"
                    value="Lyon"
                    disabled
                    readOnly
                    aria-label="Lieu de retrait: Lyon uniquement"
                    className="w-full text-sm bg-transparent text-gray-600 outline-none disabled:cursor-not-allowed"
                    title="Retrait disponible uniquement à Lyon"
                  />
                  {/* Tooltip */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute -top-10 left-0 whitespace-nowrap rounded-md bg-black/80 px-3 py-1 text-xs text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition"
                  >
                    Retrait disponible uniquement à Lyon
                  </span>
                  <span className="pointer-events-none absolute -top-3 left-4 h-2 w-2 rotate-45 bg-black/80 opacity-0 group-hover:opacity-100 transition" />
                </div>

                <m.button
                  className="bg-[#FFB700] hover:bg-orFonce text-noir font-semibold rounded-lg px-4 py-2"
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  Recherche
                </m.button>
              </div>

              <p className="text-xs text-gris text-center">
                Matériel vérifié - Devis rapide - Support technique
              </p>

              <m.button
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFC119] to-[#FFEB83] text-noir font-semibold py-3 rounded-xl shadow"
                whileTap={reduce ? undefined : { scale: 0.98 }}
              >
                Voir le catalogue <FiArrowRight className="text-lg" />
              </m.button>
            </m.div>
          </div>
        </m.div>

        {/* Cue scroll */}
        {!reduce && imgReady && (
          <m.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="h-10 w-[2px] bg-white/50 overflow-hidden rounded-full">
              <m.span
                className="block w-full h-full bg-white"
                animate={{ y: ["-100%", "100%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                }}
              />
            </div>
          </m.div>
        )}
      </LazyMotion>
    </section>
  );
};

export default Hero;
