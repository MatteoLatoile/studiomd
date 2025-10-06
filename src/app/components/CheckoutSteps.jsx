"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiCheck } from "react-icons/fi";

/**
 * Props:
 * - step: 1 | 2 | 3  (étape active)
 * - clickablePrev?: boolean (par défaut true : étapes passées cliquables)
 */
export default function CheckoutSteps({ step = 1, clickablePrev = true }) {
  const pathname = usePathname();

  const steps = [
    { id: 1, label: "Panier", href: "/panier" },
    { id: 2, label: "Coordonnées & paiement", href: "/panier/checkout" },
    { id: 3, label: "Confirmation", href: "/panier/checkout/confirmation" },
  ];

  const pct = ((Math.min(Math.max(step, 1), 3) - 1) / (steps.length - 1)) * 100;

  return (
    <div
      className="rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-4"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={step}
      aria-label="Progression de la réservation"
    >
      {/* Barre de progression */}
      <div className="relative h-2 rounded-full bg-black/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FFC119] to-[#FFEB83] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checkpoints */}
      <ol className="mt-4 grid grid-cols-3">
        {steps.map((s, i) => {
          const isDone = s.id < step;
          const isActive = s.id === step;
          const Base = isDone && clickablePrev ? Link : "div";
          const baseProps =
            isDone && clickablePrev
              ? { href: s.href }
              : { "aria-current": isActive ? "step" : undefined };

          return (
            <li key={s.id} className="flex flex-col items-center gap-1">
              <Base
                {...baseProps}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 transition",
                  isActive
                    ? "bg-[#0F0F14] text-white ring-[#0F0F14]"
                    : isDone
                    ? "bg-[#FFE48A] text-[#0F0F14] ring-[#FFD65A] hover:opacity-90"
                    : "bg-white text-[#0F0F14] ring-black/10",
                ].join(" ")}
                title={s.label}
              >
                {isDone ? <FiCheck /> : s.id}
              </Base>
              <span
                className={[
                  "text-[11px] text-center leading-4",
                  isActive ? "font-semibold text-noir" : "text-[#6B6B6B]",
                ].join(" ")}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Hint route (optionnel) */}
      <p className="sr-only">Page actuelle : {pathname}</p>
    </div>
  );
}
