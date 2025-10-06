"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { supabase } from "../lib/supabase";

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function toISO(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7)); // lundi (0..6)
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) row.push(addDays(start, w * 7 + d));
    weeks.push(row);
  }
  return { weeks, gridStart: start, gridEnd: addDays(start, 6 * 7 - 1) };
}

export default function DateRangeModal({
  open,
  onClose,
  productId,
  onConfirm,
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // === CHANGEMENT: on gère la dispo par jour (stock), pas des spans ===
  const [cap, setCap] = useState({}); // { 'YYYY-MM-DD': remaining:int }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const [selStart, setSelStart] = useState(null);
  const [selEnd, setSelEnd] = useState(null);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState("");

  // Charge la capacité journalière restante pour toute la grille (6 semaines) du mois visible
  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      setCap({});
      try {
        // bornes exactes de la grille visible (pour couvrir les jours du mois précédent/suivant affichés)
        const { gridStart, gridEnd } = monthMatrix(cursor.y, cursor.m);
        const p_from = toISO(gridStart);
        const p_to = toISO(gridEnd);

        const { data, error } = await supabase.rpc("product_daily_remaining", {
          p_product: productId,
          p_from,
          p_to,
        });
        if (error) throw error;

        const map = {};
        (data || []).forEach((r) => {
          // r.d = date, r.remaining = capacité restante (int)
          map[r.d] = r.remaining;
        });
        if (!cancelled) setCap(map);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, productId, cursor.y, cursor.m]);

  // Un jour est “désactivé” si passé OU si remaining <= 0
  function isDisabled(d) {
    if (d < today) return true;
    const key = toISO(d);
    const remaining = cap[key];
    return remaining !== undefined && remaining <= 0;
  }

  // Sélection (exactement ton UX ; on refuse une plage qui inclut un jour complet)
  function pick(d) {
    if (!selStart || (selStart && selEnd)) {
      setSelStart(d);
      setSelEnd(null);
      setMsg("");
      return;
    }
    let a = selStart,
      b = d;
    if (b < a) [a, b] = [b, a];

    // refuse si un jour complet (remaining <= 0) entre a..b
    let cur = new Date(a),
      invalid = false;
    while (cur <= b) {
      if (isDisabled(cur)) {
        invalid = true;
        break;
      }
      cur = addDays(cur, 1);
    }
    if (invalid) {
      setMsg("Plage invalide : au moins un jour n’a plus de stock.");
      setSelStart(null);
      setSelEnd(null);
      return;
    }

    setSelStart(a);
    setSelEnd(b);
    setMsg("");
  }

  function dayClasses(d) {
    const other = d.getMonth() !== cursor.m || d.getFullYear() !== cursor.y;
    const disabled = isDisabled(d);
    const selected =
      (selStart && +d === +selStart) ||
      (selEnd && +d === +selEnd) ||
      (selStart && selEnd && d > selStart && d < selEnd);
    return [
      "h-9 w-9 rounded-md text-sm flex items-center justify-center select-none",
      other ? "text-gray-400" : "text-noir",
      disabled
        ? "opacity-40 pointer-events-none"
        : "cursor-pointer hover:bg-black/5",
      selected
        ? "bg-gradient-to-r from-[#FFC119] to-[#FFEB83] text-black font-semibold"
        : "",
    ].join(" ");
  }

  async function confirm() {
    if (!selStart || !selEnd) {
      setMsg("Choisis une date de début et de fin.");
      return;
    }
    setChecking(true);
    setMsg("");
    try {
      // Double-check serveur pare-balles
      const { data, error } = await supabase.rpc("product_is_available", {
        p_product: productId,
        p_start: toISO(selStart),
        p_end: toISO(selEnd),
      });
      if (error) throw error;
      if (!data) {
        setMsg("Ce créneau n’est plus disponible. Réessaie.");
        return;
      }
      onConfirm?.({ start: toISO(selStart), end: toISO(selEnd) });
      onClose?.();
    } catch (e) {
      setMsg(e.message || "Erreur de vérification");
    } finally {
      setChecking(false);
    }
  }

  if (!open) return null;
  const { weeks } = monthMatrix(cursor.y, cursor.m);
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[80] text-black flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl relative">
        <button
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/5"
          onClick={onClose}
          aria-label="Fermer"
        >
          <FiX />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="text-[#FFC119]" />
          <h2 className="font-semibold">Choisis tes dates</h2>
        </div>

        {loading ? (
          <p className="text-sm text-noir/60">Chargement…</p>
        ) : err ? (
          <p className="text-sm text-red-600">Erreur : {err}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button
                className="p-2 rounded-md hover:bg-black/5"
                onClick={() => {
                  const d = new Date(cursor.y, cursor.m, 1);
                  d.setMonth(d.getMonth() - 1);
                  setCursor({ y: d.getFullYear(), m: d.getMonth() });
                }}
                aria-label="Mois précédent"
              >
                <FiChevronLeft />
              </button>
              <div className="text-sm font-semibold capitalize">{label}</div>
              <button
                className="p-2 rounded-md hover:bg-black/5"
                onClick={() => {
                  const d = new Date(cursor.y, cursor.m, 1);
                  d.setMonth(d.getMonth() + 1);
                  setCursor({ y: d.getFullYear(), m: d.getMonth() });
                }}
                aria-label="Mois suivant"
              >
                <FiChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[11px] text-noir/60 mb-1">
              {["L", "M", "M", "J", "V", "S", "D"].map((x, i) => (
                <div key={i} className="text-center">
                  {x}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {weeks.flat().map((d, i) => {
                const key = toISO(d);
                const remaining = cap[key];
                return (
                  <button
                    key={i}
                    className={dayClasses(d)}
                    onClick={() => pick(new Date(d))}
                    title={
                      remaining !== undefined
                        ? remaining > 0
                          ? `Reste ${remaining} unité${
                              remaining > 1 ? "s" : ""
                            }`
                          : "Complet"
                        : ""
                    }
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="text-sm mb-3">
              {selStart && selEnd ? (
                <>
                  Sélection : <strong>{toISO(selStart)}</strong> →{" "}
                  <strong>{toISO(selEnd)}</strong>
                </>
              ) : (
                <span className="text-noir/60">
                  Clique une date de début puis une date de fin.
                </span>
              )}
            </div>

            {msg && <p className="text-sm text-red-600 mb-3">{msg}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border">
                Annuler
              </button>
              <button
                onClick={confirm}
                disabled={checking || !selStart || !selEnd}
                className="px-4 py-2 rounded-lg text-black font-semibold shadow disabled:opacity-60"
                style={{
                  background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                }}
              >
                {checking ? "Vérification…" : "Valider le créneau"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
