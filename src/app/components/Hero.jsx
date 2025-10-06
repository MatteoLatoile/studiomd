"use client";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageHero from "../../../public/imge_hero.webp"; // convertis-le en .webp/.avif si possible
import { IconArrowRight, IconCalendar } from "./icons";

const ease = [0.22, 1, 0.36, 1];
const CATEGORIES = [
  "Batterie",
  "Camera",
  "costume-accesoire",
  "eclairage",
  "machinerie",
  "monitoring",
  "son",
];

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

export default function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const today = new Date().toISOString().split("T")[0];
  const [imgReady, setImgReady] = useState(false);
  const [category, setCategory] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function onSearch() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const qs = params.toString();
    router.push(qs ? `/location?${qs}` : "/location");
  }

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-sable"
      aria-busy={!imgReady}
      aria-live="polite"
    >
      <LazyMotion features={domAnimation}>
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
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(80% 60% at 50% 60%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 60%)",
            }}
          />
        </m.div>

        <div
          aria-hidden
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(360deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.7) 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
          }}
        />

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
              Réservation simple, retrait rapide, packs optimisés pour le
              tournage.
            </m.p>

            <m.div
              className="rounded-2xl p-5 bg-[#FFFFFF70] backdrop-blur-sm shadow-md border-2 border-white space-y-4 max-w-md"
              whileHover={reduce ? undefined : { y: -2 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <p className="text-noir font-medium">Matériel</p>

              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 text-[12px] text-noir/80">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full text-sm text-gris rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-400 focus:ring-2 focus:ring-[#FFB700]/30"
                  >
                    <option value="">Toutes les catégories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
                  <IconCalendar className="h-5 w-5 fill-[#FFB700]" />
                  <input
                    type="date"
                    min={today}
                    value={start}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStart(v);
                      if (end && v && new Date(end) < new Date(v)) setEnd(v);
                    }}
                    className="w-full text-sm text-gris outline-none appearance-none"
                  />
                </label>

                <label className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
                  <IconCalendar className="h-5 w-5 fill-[#FFB700]" />
                  <input
                    type="date"
                    min={start || today}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full text-sm text-gris outline-none appearance-none"
                  />
                </label>

                <m.button
                  onClick={onSearch}
                  className="col-span-2 bg-[#FFB700] hover:bg-[#ffc83b] text-noir font-semibold rounded-lg px-4 py-2"
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  Recherche
                </m.button>
              </div>

              <p className="text-xs text-gris text-center">
                Matériel vérifié — Devis rapide — Support technique
              </p>

              <m.button
                onClick={() => router.push("/location")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFC119] to-[#FFEB83] text-noir font-semibold py-3 rounded-xl shadow"
                whileTap={reduce ? undefined : { scale: 0.98 }}
              >
                Voir le catalogue{" "}
                <IconArrowRight className="h-5 w-5 fill-current" />
              </m.button>
            </m.div>
          </div>
        </m.div>

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
}
